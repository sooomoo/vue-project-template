import { initDesktopEvents, type DesktopEventsListener } from "@/platforms/desktop/events";
import { preventDocumentDefaultEvents } from "@/platforms/prevent_defaults";

const desktopEventsListener: DesktopEventsListener = {
    secondLaunchCallback: (args) => {
        console.log("secondLaunchCallback", args);
        useAppEventBus().emit("secondLaunchArgs", args);
    },
    dropFilesCallback: (x, y, files) => {
        console.log("dropFilesCallback", x, y, files);
        useAppEventBus().emit("dropFiles", { x, y, files });
    },
};

/**
 * 初始化应用
 */
export const initApp = () => {
    preventDocumentDefaultEvents();
    initDesktopEvents(desktopEventsListener);

    // client id，session id 的初始化
    const cid = useLocalStorage("cid", "");
    if (cid.value.length !== 32) {
        cid.value = newUid();
    }
};
