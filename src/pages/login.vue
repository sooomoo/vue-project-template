<script setup lang="ts">
import LoginView from "@/components/LoginView.vue";
</script>

<template>
    <Suspense>
        <LoginView class="page-login" />
    </Suspense>
</template>

<style lang="scss" scoped>
.page-login {
    position: fixed;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    height: fit-content;
    margin: auto;
}
</style>
