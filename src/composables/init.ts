import { initDesktopEvents, type DesktopEventsListener } from "@/desktop/events";
import Cookies from "js-cookie";
import {
    preventDocumentDefaultEvents,
    type Secrets,
    logger,
    decodeSecureString,
    newBoxKeyPairFromArray,
    newSignKeyPairFromArray,
    getPlatformId,
} from "vuepkg";

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

    const platId = getPlatformId();
    logger.debug("platform id", platId);
    Cookies.set("pla", platId, { path: "/", sameSite: "None", secure: true });

    // client id，session id 的初始化
    const cid = getClientId();
    logger.debug("client id", cid);
};

/**
 * 获取会话密钥
 * @returns
 */
export const getSecuretsFromStorage = (): Secrets | undefined => {
    const sessionId = Cookies.get(import.meta.env.VITE_COOKIE_SK1_NAME) ?? "";
    logger.debug("sessionId", sessionId);
    const clientKey = Cookies.get(import.meta.env.VITE_COOKIE_SK2_NAME) ?? "";
    logger.debug("clientKey", clientKey);
    const pubKeys = decodeSecureString(sessionId || "");
    const priKeys = decodeSecureString(clientKey || "");
    if (pubKeys.box && pubKeys.sign && priKeys.box && priKeys.sign) {
        const boxKeyPair = newBoxKeyPairFromArray(pubKeys.box!, priKeys.box!);
        const signKeyPair = newSignKeyPairFromArray(pubKeys.sign!, priKeys.sign!);
        return {
            boxKeyPair: boxKeyPair,
            signKeyPair: signKeyPair,
            sessionId: sessionId || "",
        };
    }
};

/**
 * Only called in session_init.server.ts
 * 确保在第一次请求时会话密钥已准备好
 * @returns
 */
export const ensureSecurets = (): Secrets => {
    let sessionId = Cookies.get(import.meta.env.VITE_COOKIE_SK1_NAME) ?? "";
    logger.debug("sessionId", sessionId);
    let clientKey = Cookies.get(import.meta.env.VITE_COOKIE_SK2_NAME) ?? "";
    logger.debug("clientKey", clientKey);
    const pubKeys = decodeSecureString(sessionId || "");
    logger.debug("pubKeys", pubKeys);
    const priKeys = decodeSecureString(clientKey || "");
    logger.debug("priKeys", priKeys);
    if (!pubKeys.box || !pubKeys.sign || !priKeys.box || !priKeys.sign) {
        // 需要重新生成
        logger.debug("需要重新生成");
        const boxKeyPair = newBoxKeyPair();
        const signKeyPair = newSignKeyPair();
        sessionId = encodeSecureString(signKeyPair.publicKey, boxKeyPair.publicKey);
        clientKey = encodeSecureString(signKeyPair.privateKey, boxKeyPair.privateKey);
        Cookies.set(import.meta.env.VITE_COOKIE_SK1_NAME, sessionId, {
            path: "/",
            sameSite: "None",
            secure: true,
        });
        Cookies.set(import.meta.env.VITE_COOKIE_SK2_NAME, clientKey, {
            path: "/",
            sameSite: "None",
            secure: true,
        });
        return {
            boxKeyPair: boxKeyPair,
            signKeyPair: signKeyPair,
            sessionId: sessionId || "",
        };
    } else {
        logger.debug("不需要重新生成");
        const boxKeyPair = newBoxKeyPairFromArray(pubKeys.box!, priKeys.box!);
        const signKeyPair = newSignKeyPairFromArray(pubKeys.sign!, priKeys.sign!);
        return {
            boxKeyPair: boxKeyPair,
            signKeyPair: signKeyPair,
            sessionId: sessionId || "",
        };
    }
};
