const darkModeQuery = window.matchMedia("(prefers-color-scheme: dark)");

export type ThemeMode = "light" | "dark" | "auto";

const setDarkMode = (darkMode: boolean) => {
    if (darkMode) {
        document.documentElement.setAttribute("data-theme", "dark");
    } else {
        document.documentElement.setAttribute("data-theme", "light");
    }
};

const darkModeChangeEvent = (event: MediaQueryListEvent) => {
    setDarkMode(event.matches);
};

/**
 * 初始化主题, 从localStorage读取相关的配置
 */
export const initTheme = () => {
    const theme = useLocalStorage<ThemeMode>("theme", "auto");
    changeTheme(theme.value);
};

/**
 * 切换主题
 * @param theme 主题模式
 */
export const changeTheme = (theme: ThemeMode) => {
    try {
        const themeStorage = useLocalStorage<ThemeMode>("theme", "auto");
        themeStorage.value = theme;
    } catch (error) {
        console.error("切换主题失败", error);
    }

    if (theme === "auto") {
        setDarkMode(darkModeQuery.matches);
        darkModeQuery.addEventListener("change", darkModeChangeEvent);
    } else {
        setDarkMode(theme === "dark");
        darkModeQuery.removeEventListener("change", darkModeChangeEvent);
    }
};
