export type Platform = "mac" | "win" | "linux" | "web";

/**
 * 获取平台类型
 * @returns {Platform} 平台类型
 */
export const getPlatform = (): Platform => {
    let platform: Platform = "web";
    const href = window.location.href.toLowerCase();
    if (
        navigator.userAgent.toLowerCase().includes("wails") ||
        href.includes("wails") ||
        (window as unknown as { wails: unknown }).wails
    ) {
        const userAgent = navigator.userAgent.toLowerCase();
        if (userAgent.includes("mac os x")) platform = "mac";
        if (userAgent.includes("windows")) platform = "win";
        if (userAgent.includes("linux")) platform = "linux";
    }
    return platform;
};
