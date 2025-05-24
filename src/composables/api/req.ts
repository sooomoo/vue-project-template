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

const signHeaderTimestamp = "x-timestamp";
const signHeaderNonce = "x-nonce";
const signHeaderSignature = "x-signature";
const signHeaderPlatform = "x-platform";
const signHeaderSession = "x-session";
const headerRawType = "x-raw-type";
const contentTypeEncrypted = "application/x-encrypted;charset=utf-8";

const platform = "8";

export interface HttpOptions {
    cacheKey?: string;
    signal?: AbortSignal;
    responseType?: "json" | "text" | "blob" | "arrayBuffer" | "stream";
    cookie?: string;
    timeout?: number;
    autoHandle401?: boolean;
}

export interface SecureRequestConfig<D = any> extends AxiosRequestConfig<D> {
    authHandle401?: boolean; // 是否自动处理 401 错误
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
        const { method: methodRaw, url, data: body } = config;
        const method = methodRaw?.toLowerCase() ?? "";
        const path = url?.replace(import.meta.env.VITE_API_BASE_URL, "") || "";
        const log = logger.tag(method + " " + path + " request");
        log.debug("request url is: ", url);

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
            platform: platform,
            method: method?.toUpperCase(),
            path: path,
            query: strQuery,
        };

        // 1. 加密请求体（仅针对 POST/PUT 请求）
        if (body && ["post", "put"].includes(method)) {
            let reqData = "";
            // 先加密
            reqData = JSON.stringify(body);
            if (import.meta.env.VITE_ENABLE_CRYPTO === "true") {
                reqData = useEncrypt(boxKeyPair, reqData);
                config.data = reqData; // 替换原始数据为加密后的数据
            }
            signData["body"] = reqData;
            config.headers.set("Content-Type", contentTypeEncrypted); // 设置请求头
        }

        // 2. 签名请求体（包括请求头和请求体）
        const reqSignature = useSignData(signKeyPair, stringifyObj(signData));

        // 3. 附加安全相关请求头
        config.headers.set(signHeaderPlatform, platform);
        config.headers.set(signHeaderSession, sessionId);
        config.headers.set(signHeaderTimestamp, timestamp);
        config.headers.set(signHeaderNonce, nonce);
        config.headers.set(signHeaderSignature, reqSignature);
        log.debug("request sign data is: \n", signData);
        log.debug("request sign is: \n", reqSignature);
        log.debug("request headers are: \n", config.headers);
        log.debug("request data is: \n", config.data);

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
        const { boxKeyPair } = secrets;

        const { method: methodRaw, url } = response.config;
        const method = methodRaw?.toLowerCase() ?? "";
        const path = url?.replace(import.meta.env.VITE_API_BASE_URL, "") || "";
        const log = logger.tag(method + " " + path + " response");

        const sessionId = response.config.headers[signHeaderSession];
        const strQuery = response.config.params ? stringifyObj(response.config.params) : "";

        const respTimestamp = response.headers[signHeaderTimestamp] ?? "";
        const respNonce = response.headers[signHeaderNonce] ?? "";
        const respSignature = response.headers[signHeaderSignature] ?? "";
        let respData = response.data ?? "";
        const respStr = stringifyObj({
            session: sessionId,
            nonce: respNonce,
            platform: platform,
            timestamp: respTimestamp,
            method: method,
            path: path,
            query: strQuery,
            body: respData,
        });

        if (!useSignVerify(respStr, respSignature)) {
            log.warn(`【FAILED】签名验证失败`, respData);
            throw new Error("签名验证失败");
        }

        const contentType = response.headers["Content-Type"] ?? "";
        if (contentType == contentTypeEncrypted) {
            respData = useDecrypt(boxKeyPair, respData);
            response.data = respData; // 替换原始数据为解密后的数据
            log.debug("response data is: \n", respData);
            const rawType = (response.headers[headerRawType] as string | undefined) ?? "";
            if (rawType) {
                response.headers["Content-Type"] = rawType; // 恢复原始 Content-Type
                // if (rawType.startsWith("application/json")) {
                //     try {
                //         response.data = JSON.parse(respData);
                //     } catch (e) {
                //         log.error("解密后数据解析失败", respData, e);
                //         throw new Error("解密后数据解析失败");
                //     }
                // }
            }
        }
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
        let redirect = "";
        const pagePath = window.location.pathname + window.location.search;
        redirect =
            pagePath === "/" || pagePath.startsWith("/login")
                ? ""
                : `?redirect=${encodeURIComponent(pagePath)}`;
        log.debug("redirect path is :", redirect);

        try {
            const response = await this.instance.request<T>(config);
            return response.data;
        } catch (error) {
            if (this.isStatusError(error, 401) && (config.authHandle401 ?? true)) {
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
                    if (this.isStatusError(error, 401)) {
                        await useRouter().replace({
                            path: import.meta.env.VITE_LOGIN_URL + pagePath,
                            replace: true,
                        });
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
