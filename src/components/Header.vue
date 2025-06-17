<script setup lang="ts">
import ChangeThemeButton from "@/components/ChangeThemeButton.vue";
</script>

<template>
    <header class="header">
        <div class="logo"></div>
        <div>Header Vue App</div>
        <div class="spacer"></div>
        <ChangeThemeButton />
    </header>
</template>

<style lang="scss" scoped>
.header {
    height: var(--header-height);
    min-height: var(--header-height);
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: flex-start;
    position: fixed;
    top: 0; 
    left: 0;
    right: 0;
    z-index: 10;
    background-color: var(--color-header-background);
    backdrop-filter: blur(8px);
    box-shadow: 0 0 1px rgba(0, 0, 0, 0.25);

    & .logo {
        width: 16px;
        height: 16px;
        pointer-events: none;
        margin: 0 6px;
        background-size: contain;
        background-repeat: no-repeat;
        background-position: center;
        background-image: url("@/assets/logo.svg");
    }

    & .change-theme-button {
        margin-right: 8px;
    }
}
</style>
