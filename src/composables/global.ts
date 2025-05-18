import { Platform, getPlatform } from "@/platforms/platform";

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

/**
 * 是否运行在桌面端
 * @returns {boolean} Whether the platform is desktop.
 */
export const isRunAsDesktop = (): boolean => {
    return getPlatform() !== Platform.BROWSER;
};
