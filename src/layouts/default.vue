<script setup lang="ts">
import { RouterView } from "vue-router";
import TitleBar from "@/platforms/desktop/components/TitleBar.vue";
import Header from "@/components/Header.vue";

const isDesk = isDesktop();
</script>

<template>
    <component :is="isDesk ? TitleBar : Header" />
    <h1>123</h1>
    <RouterView />
</template>
