<script setup lang="ts">
import FilesDropTarget from "@/components/FilesDropTarget.vue";
import { getPlatform } from "vuepkg";

const counterStore = useCounterStore();
const onClick = () => {
    counterStore.increment();
};
const authStore = useAuthStore();

const isDesk = isDesktop();

const bus = useAppEventBus();

bus.on("secondLaunchArgs", (args) => {
    console.log(args);
});

const wsMsg = ref("");
bus.on("websocketMessage", (message) => {
    console.log("websocketMessage", message);
    wsMsg.value = JSON.stringify(message, null, 2) + "\n" + Date.now().toString();
});

const dropFiles = reactive<Array<string | File>>([]);

const handleChange = (files: Array<string | File>) => {
    dropFiles.push(...files);
};

const url = ref("");
onMounted(() => {
    url.value = window.location.href;
});
const platform = getPlatform();
console.log("windows", window);
</script>

<template>
    <button @click="onClick">Increment</button>
    <div>Count is: {{ counterStore.count }}</div>
    <p>isDesktop: {{ isDesk }}, platform: {{ platform }}</p>
    <pre>{{ authStore.user }}</pre>
    <div>{{ url }}</div>
    <pre>{{ wsMsg }}</pre>
    <FilesDropTarget class="main__drop-area" @change="handleChange"> drop in </FilesDropTarget>
    <div v-for="file in dropFiles" :key="typeof file === 'string' ? file : file.name">
        {{ typeof file === "string" ? file : file.name }}
    </div>
    <p>
        总结来说，WebSocket 是一种为现代 Web 应用量身定制的协议，具有实时、双向通信的优势，而 Socket 是一种底层的网络通信机制，提供更灵活的使用方式。选择使用哪种技术取决于具体的应用场景和需求。对于需要实时交互的 Web 应用，WebSocket 是更合适的选择；而对于底层或高性能要求的网络通信，Socket 提供了更多的控制和灵活性。
    </p>
</template>

<style lang="scss" scoped>
.main__drop-area {
    width: 200px;
    min-height: 160px;
    background-color: var(--color-card-background);
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 8px;
} 
</style>
