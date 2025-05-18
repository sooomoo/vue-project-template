<script setup lang="ts">
import IconThemeDark from "@/components/icons/IconThemeDark.vue";
import IconThemeLight from "@/components/icons/IconThemeLight.vue";
import IconThemeAuto from "@/components/icons/IconThemeAuto.vue";

const themeMode = useThemeMode();
const themeIcon = computed(() => {
    if (themeMode.value === "dark") return IconThemeDark;
    if (themeMode.value === "light") return IconThemeLight;
    return IconThemeAuto;
});

const handleChangeTheme = () => {
    const nextTheme = themeMode.value === "dark" ? "auto" : themeMode.value === "light" ? "dark" : "light";
    console.log("nextTheme", nextTheme);
    themeMode.value = nextTheme;
};
</script>

<template>
    <button class="flex-center change-theme-button" @click="handleChangeTheme">
        <component :is="themeIcon" />
    </button>
</template>

<style scoped lang="scss">
.change-theme-button {
    width: 32px;
    height: 100%;
    cursor: pointer;

    & svg {
        fill: currentColor;
        width: 18px;
        height: 18px;
    }
}
</style>