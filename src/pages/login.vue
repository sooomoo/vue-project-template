<script setup lang="ts">
import LoginView from "@/components/LoginView.vue";

const router = useRouter();
const route = useRoute();

const authStore = useAuthStore();
if (authStore.user) {
    // 登录成功，跳转到首页
    router.replace("/");
}

const handleLoginStatusUpdated = (status: LoginStatus) => {
    switch (status) {
        case "success":
            // 登录成功
            router.replace(decodeURIComponent((route.query.redirect as string) || "/"));
            break;
        case "error":
            // 登录失败，显示错误信息
            break;
        case "fail":
            // 登录失败，显示错误信息
            break;
    }
};
</script>

<template>
    <LoginView class="page-login" @status-update="handleLoginStatusUpdated" />
</template>

<style lang="scss" scoped>
.page-login {
    position: fixed;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    height: fit-content;
    margin: auto;
}
</style>
