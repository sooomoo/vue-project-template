<script setup lang="ts">
import { RouterView } from "vue-router";
import TitleBar from "@/desktop/components/TitleBar.vue";

const isDesktop = isRunAsDesktop();
</script>

<template>
    <component :is="isDesktop ? TitleBar : null" />
    <h1>123</h1>
    <RouterView />
</template>
