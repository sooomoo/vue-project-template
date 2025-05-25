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

let _platform = "";
export const getPlatformId = () => {
    if (_platform.length > 0) {
        return _platform;
    }

    _platform = "8";
    const pla = getPlatform();
    if (pla === "mac") {
        _platform = "4";
    } else if (pla === "win") {
        _platform = "6";
    } else if (pla === "linux") {
        _platform = "7";
    }

    return _platform; // web 平台
};
