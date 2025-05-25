import { callOncePromise } from "vuepkg";

export interface GetUserInfoResponse {
    id: string;
    name: string;
    avatarUrl: string;
    role: string;
    ipLatest: string;
}

class ApiUser {
    private readonly _getUserInfoOnce = callOncePromise(async () => {
        return await secureRequest.get<ResponseDto<GetUserInfoResponse>>("/v1/user/info");
    });

    getUserInfo() {
        return this._getUserInfoOnce();
    }

    async getUserInfoWithoutRedirect() {
        return await secureRequest.get<ResponseDto<GetUserInfoResponse>>("/v1/user/info", {
            autoHandle401: false, // 不处理401错误
        });
    }
}

export const apiUser = new ApiUser();
