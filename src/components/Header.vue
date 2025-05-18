<script setup lang="ts">
import ChangeThemeButton from "@/components/ChangeThemeButton.vue";
</script>

<template>
    <header class="header">
        <div class="logo"></div>
        <div>Hello Vue App</div>
        <div class="spacer"></div>
        <ChangeThemeButton />
    </header>
</template>

<style lang="scss" scoped>
.header {
    height: var(--header-height);
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: flex-start;
    position: fixed;
    left: 0;
    top: 0;
    right: 0;
    z-index: 10;
    font-size: 1.5rem;

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
