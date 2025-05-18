// 初始化平台类型，主题模式等必须的配置
const init = () => {
    let platform = "web";
    if (window.wails) {
        const userAgent = navigator.userAgent.toLowerCase();
        if (userAgent.includes("mac os x")) platform = "mac";
        if (userAgent.includes("windows")) platform = "win";
        if (userAgent.includes("linux")) platform = "linux";
    }
    console.log("platform", platform);
    document.documentElement.setAttribute("data-platform", platform);

    const theme = localStorage.getItem("theme");
    if (!theme) {
        localStorage.setItem("theme", "auto");
    }
    if (theme === "auto") {
        const darkModeQuery = window.matchMedia("(prefers-color-scheme: dark)");
        if (darkModeQuery.matches) {
            document.documentElement.setAttribute("data-theme", "dark");
        } else {
            document.documentElement.setAttribute("data-theme", "light");
        }
    } else {
        document.documentElement.setAttribute("data-theme", theme);
    }
};

init();
