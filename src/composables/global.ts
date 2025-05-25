import Cookies from "js-cookie";

export interface DropFilesEvent {
    x: number;
    y: number;
    files: string[];
}

interface AppEvent {
    secondLaunchArgs: string[];
    dropFiles: DropFilesEvent;
}

let appBus: EventBus<AppEvent> | null = null;

export const useAppEventBus = () => {
    if (!appBus) {
        appBus = new EventBus<AppEvent>("appbus");
    }
    return appBus;
};

export const isWeb = () => getPlatform() === "web";
export const isDesktop = () => getPlatform() !== "web";
export const isMac = () => getPlatform() === "mac";
export const isWin = () => getPlatform() === "win";
export const isLinux = () => getPlatform() === "linux";

/**
 * 获取客户端的Id，如果不存在则生成一个新的Id并存储在Cookie中
 * @returns 客户端Id
 */
export const getClientId = () => {
    let cid = Cookies.get("cli") ?? "";
    if (cid.length !== 32) {
        cid = newUid();
        Cookies.set("cli", cid, { path: "/", sameSite: "None", secure: true });
    }
    return cid;
};
