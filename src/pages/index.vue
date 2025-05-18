<script setup lang="ts">
import HelloWorld from '../components/HelloWorld.vue';

const counterStore = useCounterStore();
const onClick = () => {
    counterStore.increment();
};

const isDesk = isDesktop();

const bus = useAppEventBus();

bus.on("secondLaunchArgs", (args) => {
    console.log(args);
});

const dropFiles = reactive(new Array<string>());
bus.on("dropFiles", (evt) => {
    console.log(evt);
    dropFiles.push(...evt.files);
});

const onDragOver = (evt: DragEvent) => {
    if (!evt.dataTransfer) return;
    evt.dataTransfer.dropEffect = "copy";
};
</script>

<template>
    <HelloWorld msg="You did it!" />
    <button @click="onClick">Increment</button>
    <p>Count is: {{ counterStore.count }}</p>
    <p>isDesktop: {{ isDesk }}</p>
    <div class="main__drop-area wails-drop-target-active drop-target" @dragover.prevent.stop="onDragOver">
        drop in
    </div>
    <div v-for="file in dropFiles" :key="file">
        {{ file }}
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
