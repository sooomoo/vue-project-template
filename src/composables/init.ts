import { initDesktopEvents, type DesktopEventsListener } from "@/desktop/events";

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

    ensureSecurets();

    // client id，session id 的初始化
    const cid = getClientId();
    logger.debug("client id", cid);
};
