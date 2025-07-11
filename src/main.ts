import "./assets/main.css";

initApp();

import { RouterView } from "vue-router/auto";
import router from "./router";
import { startWebSocket, openWebSocket } from "@/workers/websocket";

const app = createApp(RouterView);
app.use(createPinia());
// app.use(DataLoaderPlugin, { router }); // Register the plugin before the router
app.use(router); // adding the router will trigger the initial navigation
app.mount(document.body);


startWebSocket((event) => {
    console.log("WebSocket message received:", event.data);
    if (event.data.type === "websocket_message") {
        useAppEventBus().emit("websocketMessage", event.data.data);
    }
});
const authStore = useAuthStore();
console.log("user", authStore);
if (!authStore.user) {
    setTimeout(async () => {
        try {
            await authStore.getUserInfo()
            openWebSocket();
        } catch (err) {
            console.error("获取用户信息失败", err)
        }
    }, 100);
}

router.afterEach((_to, _from) => {
    // 页面加载完毕之后，移除splash
    const appSplash = document.getElementById("app-splash");
    if (appSplash) {
        appSplash.remove();
    }
});
