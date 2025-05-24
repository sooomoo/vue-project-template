/* eslint-disable @typescript-eslint/no-explicit-any */
// ------------------------------
// 构建安全请求实例

import type {
    AxiosInstance,
    AxiosRequestConfig,
    AxiosResponse,
    InternalAxiosRequestConfig,
} from "axios";
import axios from "axios";
import axiosRetry from "axios-retry";
import { gotoLoginPage } from "@/router";

const signHeaderTimestamp = "x-timestamp";
const signHeaderNonce = "x-nonce";
const signHeaderSignature = "x-signature";
const signHeaderPlatform = "x-platform";
const signHeaderSession = "x-session";
const headerRawType = "x-rawtype";
const headerClientId = "x-client";
const contentTypeEncrypted = "application/x-encrypted";

let _platform = "";
const getPlatformId = () => {
    if (_platform.length > 0) {
        return _platform;
    }

    _platform = "8";
    const pla = getPlatform();
    if (pla === "mac") {
        _platform = "4";
    } else if (pla === "win") {
        _platform = "6";
    } else if (pla === "linux") {
        _platform = "7";
    }

    return _platform; // web 平台
};

export interface HttpOptions {
    cacheKey?: string;
    signal?: AbortSignal;
    responseType?: "json" | "text" | "blob" | "arrayBuffer" | "stream";
    cookie?: string;
    timeout?: number;
    autoHandle401?: boolean;
}

export interface SecureRequestConfig<D = any> extends AxiosRequestConfig<D> {
    autoHandle401?: boolean; // 是否自动处理 401 错误
}

class SecureRequest {
    private instance: AxiosInstance;
    private onceRefreshTokenTask: (args?: any) => Promise<AxiosResponse<any, any>>;

    constructor() {
        this.instance = axios.create({
            baseURL: import.meta.env.VITE_API_BASE_URL,
            timeout: 10000,
            headers: {
                "Content-Type": "application/json",
            },
            responseType: "json",
            withCredentials: true,
        });
        axiosRetry(this.instance, {
            retries: 3,
            // exponential backoff
            retryDelay: (retryCount) => Math.pow(2, retryCount) * 1000,
            retryCondition: (error) => {
                // retry on 5xx server errors
                if (error.response) {
                    return error.response.status >= 500 && error.response.status < 600;
                }
                // retry on network errors
                return axiosRetry.isNetworkError(error);
            },
        });

        // 注册请求拦截器（处理签名+加密）
        this.instance.interceptors.request.use(async (config) => this.requestInterceptor(config));

        // 注册响应拦截器（处理验签+解密）
        this.instance.interceptors.response.use(
            (response) => this.responseInterceptor(response),
            (error) => this.handleRequestError(error),
        );
        this.onceRefreshTokenTask = callOncePromise<AxiosResponse<any, any>, any>(() => {
            const refreshPath = import.meta.env.VITE_API_REFRESH_TOKEN_PATH;
            return this.instance.request({ url: refreshPath, method: "POST" });
        });
    }

    /**
     * 请求拦截器核心逻辑
     */
    private async requestInterceptor(config: InternalAxiosRequestConfig<any>) {
        const { method: methodRaw, url: path, data: body } = config;
        const method = methodRaw?.toLowerCase() ?? "";
        const log = logger.tag(method + " " + path + " request");

        const secrets = getSecuretsFromStorage();
        if (!secrets) {
            log.error("获取会话密钥失败");
            throw new Error("获取会话密钥失败");
        }
        (config as any)._secrets = secrets; // 将密钥对存储在请求配置中，供响应拦截器使用

        // 请求拦截：签名和加密
        const { boxKeyPair, signKeyPair, sessionId } = secrets;
        const nonce = generateUUID();
        const timestamp = (Date.now() / 1000).toFixed();
        const strQuery = config.params ? stringifyObj(config.params) : "";
        const signData: Record<string, unknown> = {
            session: sessionId,
            nonce: nonce,
            timestamp: timestamp,
            platform: getPlatformId(),
            method: method?.toUpperCase(),
            path: path,
            query: strQuery,
        };
        // 如果不是 web 平台
        if (getPlatformId() !== "8") {
            const auth = localStorage.getItem("access_token");
            const authValue = auth ? "Bearer " + auth : "";
            signData["authorization"] = authValue;
            config.headers.set("authorization", authValue);
        }

        // 1. 加密请求体（仅针对 POST/PUT 请求）
        if (
            body &&
            ["post", "put"].includes(method) &&
            import.meta.env.VITE_ENABLE_CRYPTO === "true"
        ) {
            config.headers.set("content-type", contentTypeEncrypted); // 设置请求头
            // 先加密
            let reqData = JSON.stringify(body);
            reqData = useEncrypt(boxKeyPair, reqData);
            config.data = reqData; // 替换原始数据为加密后的数据
            signData["body"] = reqData;
        }

        // 2. 签名请求体（包括请求头和请求体）
        const reqSignature = useSignData(signKeyPair, stringifyObj(signData));

        // 3. 附加安全相关请求头
        config.headers.set(signHeaderPlatform, getPlatformId());
        config.headers.set(signHeaderSession, sessionId);
        config.headers.set(signHeaderTimestamp, timestamp);
        config.headers.set(signHeaderNonce, nonce);
        config.headers.set(signHeaderSignature, reqSignature);
        config.headers.set(headerClientId, getClientId());
        log.debug("request is: \n", config);

        return config;
    }

    /**
     * 响应拦截器核心逻辑
     */
    private async responseInterceptor(response: AxiosResponse) {
        if (response.status !== 200) {
            return response;
        }
        const secrets = (response.config as any)._secrets as Secrets | undefined;
        if (!secrets) {
            logger.error("获取会话密钥失败");
            throw new Error("获取会话密钥失败");
        }
        const { boxKeyPair, sessionId } = secrets;

        const { method: methodRaw, url } = response.config;
        const method = methodRaw?.toUpperCase() ?? "";
        const path = url?.replace(import.meta.env.VITE_API_BASE_URL, "") || "";
        const log = logger.tag(method + " " + path + " response");
        log.debug("response :", response);
        const strQuery = response.config.params ? stringifyObj(response.config.params) : "";

        const respTimestamp = response.headers[signHeaderTimestamp] ?? "";
        const respNonce = response.headers[signHeaderNonce] ?? "";
        const respSignature = response.headers[signHeaderSignature] ?? "";
        let respData = response.data ?? "";
        const respStr = stringifyObj({
            session: sessionId,
            nonce: respNonce,
            platform: getPlatformId(),
            timestamp: respTimestamp,
            method: method,
            path: path,
            query: strQuery,
            body: respData,
        });
        // log.debug("response sign data is: \n", respStr);

        if (!useSignVerify(respStr, respSignature)) {
            log.warn(`【FAILED】签名验证失败`, respData);
            throw new Error("签名验证失败");
        }

        const contentType = (response.headers["content-type"] as string) ?? "";
        if (contentType.startsWith(contentTypeEncrypted)) {
            respData = useDecrypt(boxKeyPair, respData);
            response.data = respData; // 替换原始数据为解密后的数据
            const rawType = (response.headers[headerRawType] as string | undefined) ?? "";
            if (rawType) {
                response.headers["Content-Type"] = rawType; // 恢复原始 Content-Type
                if (rawType.startsWith("application/json")) {
                    try {
                        response.data = JSON.parse(respData);
                    } catch (e) {
                        log.error("解密后JSON.parse失败", respData, e);
                        throw new Error("解密后JSON.parse失败");
                    }
                }
            }
        }

        log.debug("response body:", response.data);

        return response;
    }

    /**
     * 统一错误处理
     */
    private handleRequestError(error: any) {
        return Promise.reject(error);
    }

    private isStatusError(error: unknown, status: number) {
        if (axios.isAxiosError(error)) {
            return error.response?.status === status;
        }
        return false;
    }

    /**
     * 暴露请求方法（支持所有 HTTP 方法）
     */
    public async request<T = any>(config: SecureRequestConfig) {
        const log = logger.tag("request");
        log.newlines("\n\n");
        const pagePath = window.location.pathname + window.location.search;
        const redirectPath = pagePath === "/" || pagePath.startsWith("/login") ? "" : pagePath;
        log.debug("redirect path is :", redirectPath, pagePath);

        try {
            const response = await this.instance.request<T>(config);
            return response.data;
        } catch (error) {
            if (this.isStatusError(error, 401) && (config.autoHandle401 ?? true)) {
                const refLog = logger.tag(`Handle 401: ${config.method} ${config.url}`);
                try {
                    refLog.newlines("\n");
                    refLog.debug(`start refresh token.`);
                    const resRefresh = await this.onceRefreshTokenTask();
                    logger.tag("Handle 401").debug(`refresh token response.`, resRefresh);
                    if (!resRefresh || resRefresh.status !== 200) {
                        throw error;
                    }

                    logger.tag("Handle 401").debug(`refresh token success.`);
                    // 重新发起请求
                    const response = await this.instance.request<T>(config);
                    return response.data;
                } catch (e) {
                    logger.error("401 错误处理失败", e);
                    // token刷新失败，重定向到登录页
                    if (this.isStatusError(error, 401) && !pagePath.startsWith("/login")) {
                        gotoLoginPage(redirectPath);
                    }
                }
            }
            log.error("请求失败", error);
            throw error;
        }
    }

    /**
     * 发送GET请求
     */
    public get<T = any>(path: string, config?: SecureRequestConfig) {
        return this.request<T>({ ...config, method: "GET", url: path });
    }

    /**
     * 发送POST请求
     */
    public post<T = any>(path: string, data?: any, config?: SecureRequestConfig) {
        return this.request<T>({ ...config, method: "POST", url: path, data });
    }
}

// 导出单例实例（全局使用同一个实例）
export const secureRequest = new SecureRequest();
