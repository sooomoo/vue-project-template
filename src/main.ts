import "./assets/styles/main.scss";

initApp();

import { createRouter, createWebHistory, RouterView } from "vue-router/auto";
import { routes, handleHotUpdate } from "vue-router/auto-routes";
import { DataLoaderPlugin } from "unplugin-vue-router/data-loaders";
import { setupLayouts } from "virtual:generated-layouts";

const router = createRouter({
    history: createWebHistory(),
    routes: setupLayouts(routes),
});
// This will update routes at runtime without reloading the page
if (import.meta.hot) {
    handleHotUpdate(router);
}
console.log("router", router.getRoutes());

const app = createApp(RouterView);
app.use(createPinia());
app.use(DataLoaderPlugin, { router }); // Register the plugin before the router
app.use(router); // adding the router will trigger the initial navigation
app.mount("#app");

router.afterEach(() => {
    // 页面加载完毕之后，移除splash
    const appSplash = document.getElementById("app-splash");
    if (appSplash) {
        appSplash.remove();
    }
});
