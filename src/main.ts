import "./assets/main.css";

initApp();

import { RouterView } from "vue-router/auto";
import router from "./router";

const app = createApp(RouterView);
app.use(createPinia());
// app.use(DataLoaderPlugin, { router }); // Register the plugin before the router
app.use(router); // adding the router will trigger the initial navigation
app.mount("#app");

const authStore = useAuthStore();

console.log("user", authStore);
if (!authStore.user) {
    setTimeout(() => {
        authStore.getUserInfo().catch((err) => console.error("获取用户信息失败", err));
    }, 100);
}

startWebSocket();
openWebSocket();

router.afterEach((_to, _from) => {
    // 页面加载完毕之后，移除splash
    const appSplash = document.getElementById("app-splash");
    if (appSplash) {
        appSplash.remove();
    }
});
