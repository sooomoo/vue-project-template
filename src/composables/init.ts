import { initDesktopEvents } from "@/platforms/desktop/events";
import { preventDocumentDefaultEvents } from "@/platforms/prevent_defaults";
import { getPlatformName } from "@/platforms/platform";

/**
 * 初始化应用
 */
export const initApp = () => {
    document.documentElement.setAttribute("data-platform", getPlatformName());

    preventDocumentDefaultEvents();
    if (isRunAsDesktop()) {
        initDesktopEvents();
    }
    initTheme();
    const cid = useLocalStorage("cid", "");
    if (cid.value.length !== 32) {
        cid.value = newUid();
    }
};
