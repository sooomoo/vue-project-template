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

const authLogger = logger.tag("ApiAuth");

export const apiAuth = {
    prepareLogin: async () => {
        return await secureRequest.post<ResponseDto<PrepareLoginResponse>>(
            "/v1/auth/login/prepare",
        );
    },
    login: async (param: LoginParam) => {
        authLogger.debug("login param", param);
        const res = await secureRequest.post<ResponseDto<null>>("/v1/auth/login/do", param);
        if (res.code === RespCode.succeed) {
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
        const target =
            import.meta.env.VITE_LOGIN_PAGE + `?redirect=${encodeURIComponent(pagePath)}`;
        await useRouter().replace({
            path: target,
            replace: true,
        });
    },
};
