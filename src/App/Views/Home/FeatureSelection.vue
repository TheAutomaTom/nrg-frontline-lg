<template>
  <n-divider title-placement="left">Feature Selection</n-divider>
  <n-space :size="10">

    <n-button type="tertiary" :ghost="false" class="feature-button"
      :class="{ 'highlight-active': app$.ActiveFeature === 'prod-gantt' }" @click="onLoadProdGantt">
      Prod Gantt
    </n-button>


  </n-space>
</template>

<script setup lang="ts">
import { useAppState } from '@/Data/States/App/app-state';

const app$ = useAppState();

const onLoadProdGantt = async () => {
  app$.setActiveFeature('prod-gantt');

};

</script>


<style scoped lang="scss"></style>
