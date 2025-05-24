import { createRouter, createWebHistory } from "vue-router/auto";
import { routes, handleHotUpdate } from "vue-router/auto-routes";
// import { DataLoaderPlugin } from "unplugin-vue-router/data-loaders";
import { setupLayouts } from "virtual:generated-layouts";

const router = createRouter({
    history: createWebHistory(),
    routes: setupLayouts(routes),
});
// This will update routes at runtime without reloading the page
if (import.meta.hot) {
    handleHotUpdate(router);
}

export const gotoLoginPage = (redirectPath: string = "") => {
    if (redirectPath) {
        const redirect = encodeURIComponent(redirectPath);
        router.replace(import.meta.env.VITE_LOGIN_PAGE + `?redirect=${redirect}`);
    } else {
        router.replace(import.meta.env.VITE_LOGIN_PAGE);
    }
};

export default router;
