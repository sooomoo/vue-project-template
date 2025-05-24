// // const authLog = logger.tag("AuthStore");

export const useAuthStore = defineStore("auth", () => {
    const user = ref<GetUserInfoResponse | null>(null);
    const getUserInfo = async (handle401: boolean = true) => {
        const resp = handle401
            ? await apiUser.getUserInfo()
            : await apiUser.getUserInfoWithoutRedirect();
        if (resp.code === RespCode.succeed) {
            user.value = resp.data;
        } else {
            user.value = null;
        }
    };
    const logout = async (redirectToLogin?: boolean) => {
        await apiAuth.logout(redirectToLogin);
        user.value = null;
    };
    return { user, getUserInfo, logout };
});
