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
