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
