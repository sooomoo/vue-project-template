<script setup lang="ts">
import FilesDropTarget from "@/components/FilesDropTarget.vue";

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
    <FilesDropTarget class="main__drop-area" @change="handleChange"> drop in </FilesDropTarget>
    <div v-for="file in dropFiles" :key="typeof file === 'string' ? file : file.name">
        {{ typeof file === "string" ? file : file.name }}
    </div>
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
