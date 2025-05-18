<script setup lang="ts">
import { onMounted, ref } from "vue";
import ChangeThemeButton from "@/components/ChangeThemeButton.vue";
import {
    EventsOn,
    Quit,
    WindowIsMaximised,
    WindowMinimise,
    WindowToggleMaximise,
} from "../wailsjs/runtime/runtime.js";

const isMaximized = ref(false);

EventsOn("window_changed", (info) => {
    const { maximised } = info;
    isMaximized.value = maximised;
    // console.log("isMaximized", maximised, window.wails);
});

onMounted(async () => {
    // const fullscreen = await WindowIsFullscreen()
    const maximised = await WindowIsMaximised();
    isMaximized.value = maximised;
});
</script>

<template>
    <Teleport to="body">
        <header class="drag titlebar" @dblclick="WindowToggleMaximise">
            <div class="titlebar__icon"></div>
            <div class="titlebar__left"></div>
            <div>Wails App</div>
            <div class="titlebar__right">
                <slot></slot>
            </div>
            <ChangeThemeButton />
            <button class="nodrag flex-center titlebar__sys-btn" @click="WindowMinimise">
                <svg viewBox="0 0 32 32">
                    <line x1="10" y1="16" x2="22" y2="16" />
                </svg>
            </button>
            <button class="nodrag flex-center titlebar__sys-btn" @click="WindowToggleMaximise">
                <svg v-if="isMaximized" viewBox="0 0 32 32">
                    <rect x="10.15" y="13.25" width="8" height="8" />
                    <polyline points="13.25,13.25 13.15,10.75 21.25,10.75 21.25,18.75 19,18.75" />
                </svg>
                <svg v-else viewBox="0 0 32 32">
                    <rect x="11.25" y="11.25" width="10" height="10" />
                </svg>
            </button>
            <button class="nodrag flex-center titlebar__sys-btn titlebar__close" @click="Quit">
                <svg viewBox="0 0 32 32">
                    <line x1="11" y1="11" x2="21" y2="21" />
                    <line x1="11" y1="21" x2="21" y2="11" />
                </svg>
            </button>
        </header>
    </Teleport>
</template>

<style lang="scss" scoped>
.titlebar {
    z-index: 10;
    height: var(--header-height);
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: flex-start;
    position: fixed;
    left: 0;
    top: 0;
    right: 0;
}

.titlebar__left {
    flex: 0;
}

.titlebar__sys-btn {
    appearance: none;
    outline: none;
    border: none;
    background-color: var(--color-titlebar-btn-back);
    transition: background-color 0.5s ease;
    shape-rendering: crispEdges;
    width: 32px;
    height: 28px;
    border-radius: 4px;
    cursor: pointer;
    margin-right: 4px;

    svg {
        stroke: var(--color-text);
        stroke-width: 1px;
        fill: none;
    }
}

.titlebar__icon {
    width: 16px;
    height: 16px;
    pointer-events: none;
    margin: 0 6px;
    background-size: contain;
    background-repeat: no-repeat;
    background-position: center;
    background-image: url("@/assets/logo.svg");
}

.titlebar__right {
    flex: 1;
}

.titlebar .titlebar__sys-btn:hover {
    background-color: var(--color-titlebar-btn-back-hover);
}

.titlebar__close {
    &:hover {
        background-color: var(--color-titlebar-btn-close-hover) !important;
    }

    & svg {
        stroke-width: 1px;
    }
}

:root[data-platform="mac"] {
    .titlebar {
        justify-content: center;
        /* padding-left: 74px; */
    }

    .titlebar__left {
        flex: 1;
    }

    .titlebar__icon {
        display: none;
    }

    .titlebar__sys-btn {
        display: none;
    }
}
</style>
