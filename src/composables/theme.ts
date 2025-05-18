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
 * 获取主题模式
 * @returns {ThemeMode} 主题模式
 */
export const getThemeMode = (): ThemeMode => {
    const theme = localStorage.getItem("theme");
    if (!theme) {
        localStorage.setItem("theme", "auto");
    }
    return theme as ThemeMode;
};

/**
 * 如果是桌面环境，则改变一下窗口的主题模式
 */
const changeWindowTheme = async (theme: ThemeMode) => {
    if (isWeb()) return;
    const { WindowSetDarkTheme, WindowSetLightTheme, WindowSetSystemDefaultTheme } = await import(
        "@/desktop/wailsjs/runtime/runtime"
    );

    if (theme === "dark") {
        WindowSetDarkTheme();
    } else if (theme === "light") {
        WindowSetLightTheme();
    } else {
        WindowSetSystemDefaultTheme();
    }
};

/**
 * 切换主题
 * @param theme 主题模式
 */
export const changeTheme = (theme: ThemeMode) => {
    try {
        const themeStorage = useLocalStorage<ThemeMode>("theme", "auto");
        themeStorage.value = theme;
        changeWindowTheme(theme);
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

/**
 * 以响应式的方式处理主题模式
 * @returns 主题模式
 */
export const useThemeMode = () => {
    const themeMode = ref<ThemeMode>(getThemeMode());
    watch(
        themeMode,
        (newTheme) => {
            changeTheme(newTheme);
        },
        { immediate: true },
    );
    return themeMode;
};
