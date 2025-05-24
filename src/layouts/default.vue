<script setup lang="ts">
import { RouterView } from "vue-router";
import TitleBar from "@/desktop/components/TitleBar.vue";
import Header from "@/components/Header.vue";

const isDesk = isDesktop();
const platform = getPlatform();
console.log("windows", window);
</script>

<template>
    <component :is="isDesk ? TitleBar : Header" />
    {{ isDesk }}, {{ platform }}
    <RouterView />
</template>
