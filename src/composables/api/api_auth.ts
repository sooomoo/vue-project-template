import { gotoLoginPage } from "@/router";

export interface LoginParam {
    countryCode: string; // 国家码，如 +86
    phone: string; // 手机号
    imgCode: string; // 图片验证码
    msgCode: string; // 短信验证码
    csrfToken: string; // csrf token
}

export type LoginStatus = "success" | "error" | "fail";

export interface PrepareLoginResponse {
    csrfToken: string;
    imageData: string;
}

export interface AuthResponse {
    accessToken: string;
    refreshToken: string;
}

const authLogger = logger.tag("ApiAuth");

export const apiAuth = {
    prepareLogin: async () => {
        return await secureRequest.post<ResponseDto<PrepareLoginResponse>>(
            "/v1/auth/login/prepare",
        );
    },
    login: async (param: LoginParam) => {
        const headers = getPlatform() === "web" ? {} : { "x-csrf": param.csrfToken };
        authLogger.debug("login param", param, headers);
        const res = await secureRequest.post<ResponseDto<AuthResponse>>(
            "/v1/auth/login/do",
            param,
            {
                headers: headers,
            },
        );
        if (res.code === RespCode.succeed) {
            authLogger.debug("login success", res.data);
            try {
                localStorage.setItem("access_token", res.data.accessToken);
                localStorage.setItem("refresh_token", res.data.refreshToken);
            } catch (e) {
                authLogger.error("保存登录状态到 localStorage 失败", e);
            }
            openWebSocket();
        }

        return res;
    },
    logout: async (redirectToLogin?: boolean) => {
        await secureRequest.post<ResponseDto<null>>("/v1/auth/logout");
        // 客户端退出时，关闭websocket连接
        closeWebSocket();

        if (redirectToLogin !== true) {
            return; // 不需要重定向到登录页，直接返回
        }
        const pagePath = window.location.pathname + window.location.search;
        gotoLoginPage(pagePath);
    },
};
