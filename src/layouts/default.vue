<script setup lang="ts">
import { RouterView } from "vue-router";
import TitleBar from "@/desktop/components/TitleBar.vue";
import Header from "@/components/Header.vue";

const isDesk = isDesktop();
const log = logger.tag("LAYOUT");
const route = useRoute();
const authStore = useAuthStore();
watchEffect(() => {
    log.debug("routing...path is : ", route.fullPath);
    log.debug("authStore.user is : ", authStore.user);
});
</script>

<template>
    <component :is="isDesk ? TitleBar : Header" />
    <h1>123</h1>
    <RouterView />
</template>
