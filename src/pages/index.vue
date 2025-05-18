<script setup lang="ts">
import HelloWorld from '../components/HelloWorld.vue';

const counterStore = useCounterStore();
const onClick = () => {
    counterStore.increment();
};

const isDesktop = isRunAsDesktop();

</script>

<template>
    <HelloWorld msg="You did it!" />
    <button @click="onClick">Increment</button>
    <p>Count is: {{ counterStore.count }}</p>
    <p>isDesktop: {{ isDesktop }}</p>
</template>
