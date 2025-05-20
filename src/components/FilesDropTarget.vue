<script setup lang="ts">
const props = defineProps<{
    supportDesktop?: boolean;
}>();

const emit = defineEmits<{
    (e: "change", files: (string | File)[]): void;
}>();

const bus = useAppEventBus();
const elem = useTemplateRef<HTMLDivElement>("dropTarget");

bus.on("dropFiles", (evt) => {
    if (!elem.value) return;

    const rect = elem.value.getBoundingClientRect();
    if (evt.x >= rect.left && evt.x <= rect.right && evt.y >= rect.top && evt.y <= rect.bottom) {
        console.log(evt);
        emit('change', evt.files);
    }
});
const handleDragOver = (evt: DragEvent) => {
    if (!evt.dataTransfer) return;
    evt.dataTransfer.dropEffect = "copy";
};
const handleDrop = (evt: DragEvent) => {
    if (props.supportDesktop && isDesktop()) {
        return;
    }
    evt.preventDefault();
    evt.stopPropagation();
    if (!evt.dataTransfer) return;
    const files = evt.dataTransfer?.files;
    if (files && files.length > 0) {
        const arr = new Array<string | File>();
        for (const file of files) arr.push(file);
        emit("change", arr);
    }
};
</script>

<template>
    <div ref="dropTarget" class="drop-target files-drop-target" @dragover.prevent.stop="handleDragOver"
        @drop="handleDrop">
        <slot></slot>
    </div>
</template>

<style lang="scss" scoped>
.files-drop-target {
    position: relative;
}
</style>