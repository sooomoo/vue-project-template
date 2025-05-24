<script setup lang="ts">
import { RespCode } from "@/composables/codes";

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const lvLogger = logger.tag("LoginView");

const redirect = decodeURIComponent((route.query.redirect as string) ?? "/");
lvLogger.debug("redirect", redirect);
try {
    if (authStore.user) {
        // 如果用户已登录，直接跳转到首页
        router.replace(redirect);
    } else {
        // 获取用户信息: 此时不需要处理401错误
        await authStore.getUserInfo(false);
        if (authStore.user && redirect) {
            // 如果用户已登录，直接跳转到首页
            router.replace(redirect);
        }
    }
} catch (e) {
    // 如果获取用户信息失败，可能是未登录或其他错误
    lvLogger.debug("获取用户信息失败，继续登录流程");
}

const mobile = ref("");
const imgCode = ref("");
const msgCode = ref("");
const csrfResp = ref<PrepareLoginResponse>();

/**
 * 刷新 csrf-token
 */
const doPrepareLogin = async () => {
    // 获取 csrf-token
    const resp = await apiAuth.prepareLogin();
    if (resp.code === RespCode.succeed) {
        csrfResp.value = resp.data;
    }
    lvLogger.debug("prepareLogin", resp);
};

// 获取 csrf-token
doPrepareLogin();

/**
 * 发起登录请求
 */
const handleSubmit = async () => {
    if (!mobile.value || !imgCode.value || !msgCode.value) {
        lvLogger.debug("请输入手机号、验证码和密码", mobile.value, imgCode.value, msgCode.value);
        return;
    }
    if (!csrfResp.value?.csrfToken) {
        lvLogger.debug("请先获取 csrf-token");
        return;
    }
    const resp = await apiAuth.login({
        countryCode: "086",
        phone: mobile.value,
        imgCode: imgCode.value,
        msgCode: msgCode.value,
        csrfToken: csrfResp.value.csrfToken,
    });
    lvLogger.debug("login result", resp);
    if (resp.code === RespCode.succeed) {
        // 登录成功，获取一下用户数据
        await authStore.getUserInfo();
        // 如果用户已登录，直接跳转到首页
        if (redirect) router.replace(redirect);
    } else {
        // show error message
        lvLogger.debug("登录失败", resp);
    }
};
</script>

<template>
    <div class="login-view">
        <div class="row">
            <label for="mobile">手机号</label>
            <input
                id="mobile"
                v-model="mobile"
                type="text"
                name="mobile"
                autocomplete="mobile"
                placeholder="请输入手机号"
                required
            />
        </div>
        <div class="row">
            <label for="imgCode">人机检测</label>
            <div class="row-code">
                <input
                    id="imgCode"
                    v-model="imgCode"
                    type="text"
                    name="imgCode"
                    placeholder="请输入图中的数字"
                    required
                />
                <img
                    :src="csrfResp?.imageData"
                    draggable="false"
                    class="img-code"
                    alt=""
                    @click="doPrepareLogin"
                />
            </div>
        </div>
        <div class="row">
            <label for="msgCode">验证码</label>
            <div class="row-code">
                <input
                    id="msgCode"
                    v-model="msgCode"
                    type="text"
                    name="msgCode"
                    placeholder="请输入短信验证码"
                    required
                />
                <button type="button" class="primary-button">获取验证码</button>
            </div>
        </div>
        <button type="submit" class="primary-button submit-button" @click="handleSubmit">
            登录
        </button>
    </div>
</template>

<style lang="scss" scoped>
.login-view {
    width: 260px;

    .row {
        display: flex;
        flex-direction: column;
        margin-bottom: 12px;

        & label {
            margin-bottom: 6px;
        }
    }

    .row-code {
        display: flex;

        input {
            flex: 1;
            margin-right: 8px;
        }
    }

    .img-code {
        width: 80px;
        height: 40px;
        background-color: #00000010;
        border-radius: 4px;
        cursor: pointer;
    }

    .submit-button {
        display: block;
        width: 120px;
        margin: 0 auto;
    }

    @media (prefers-color-scheme: dark) {
        .img-code {
            background-color: #ffffff8d;
        }
    }
}
</style>
