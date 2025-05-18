export type OSType = "mac" | "win" | "linux" | "unknown";

/**
 * 用于获取操作系统类型
 * @returns {OSType} The type of the operating system.
 */
export const getOSType = (): OSType => {
    const userAgent = navigator.userAgent.toLowerCase();
    if (userAgent.includes("mac os x")) return "mac";
    if (userAgent.includes("windows")) return "win";
    if (userAgent.includes("linux")) return "linux";
    return "unknown";
};

export enum Platform {
    BROWSER = 8,
    MAC = 4,
    WIN = 6,
    LINUX = 7,
}

export const getPlatformName = (): string => {
    const platform = getPlatform();
    if (platform === Platform.MAC) return "mac";
    if (platform === Platform.WIN) return "win";
    if (platform === Platform.LINUX) return "linux";
    return "web";
};

/**
 * 获取平台类型
 * @returns {Platform} The type of the platform.
 */
export const getPlatform = (): Platform => {
    if ((window as unknown as { wails: unknown }).wails) {
        const osType = getOSType();
        if (osType === "mac") return Platform.MAC;
        if (osType === "win") return Platform.WIN;
        if (osType === "linux") return Platform.LINUX;
    }
    return Platform.BROWSER;
};

/**
 * 是否运行在桌面端
 * @returns {boolean} Whether the platform is desktop.
 */
export const isRunAsDesktop = (): boolean => {
    return getPlatform() !== Platform.BROWSER;
};

/**
 * 初始化平台
 */
export const initPlatform = () => {
    document.documentElement.setAttribute("data-platform", getPlatformName());
};
