import { initDesktopEvents } from "@/platforms/desktop/events";
import { preventDocumentDefaultEvents } from "@/platforms/prevent_defaults";

/**
 * 初始化应用
 */
export const initApp = () => {
    preventDocumentDefaultEvents();
    if (isRunAsDesktop()) {
        initDesktopEvents();
    }
    const cid = useLocalStorage("cid", "");
    if (cid.value.length !== 32) {
        cid.value = newUid();
    }
};
