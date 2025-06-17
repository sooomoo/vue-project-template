<script setup lang="ts">
import { RouterView } from "vue-router";
import TitleBar from "@/desktop/components/TitleBar.vue";
import Header from "@/components/Header.vue";

const isDesk = isDesktop();
</script>

<template>
    <component :is="isDesk ? TitleBar : Header" />
    <main class="default-layout__body"> 
        <RouterView />
    </main>
    <footer class="flex-center default-layout__footer">
        Copyright &copy; 2023
    </footer>
</template>

<style lang="scss" scoped>
.default-layout__body {
    flex: 1;
    margin: 0;
    height: fit-content;
    padding-top: var(--header-height);
}
.default-layout__footer {
    height: var(--footer-height);
}
</style>