<script setup lang="ts">
import FilesDropTarget from "@/components/FilesDropTarget.vue";

const counterStore = useCounterStore();
const onClick = () => {
    counterStore.increment();
};

const isDesk = isDesktop();

const bus = useAppEventBus();

bus.on("secondLaunchArgs", (args) => {
    console.log(args);
});

const dropFiles = reactive<Array<string | File>>([]);

const handleChange = (files: Array<string | File>) => {
    dropFiles.push(...files);
};
</script>

<template>
    <button @click="onClick">Increment</button>
    <p>Count is: {{ counterStore.count }}</p>
    <p>isDesktop: {{ isDesk }}</p>
    <FilesDropTarget class="main__drop-area" @change="handleChange">
        drop in
    </FilesDropTarget>
    <div v-for="file in dropFiles" :key="typeof file === 'string' ? file : file.name">
        {{ typeof file === 'string' ? file : file.name }}
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
