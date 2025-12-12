<template>
  <n-divider title-placement="left">Feature Selection</n-divider>
  <n-space :size="10">

    <!-- <n-button type="tertiary" :ghost="false" class="feature-button"
      :class="{ 'highlight-active': app$.ActiveFeature === 'labor-importer' }" @click="onLoadLaborImporter">
      Planned Labor Importer
    </n-button> -->


  </n-space>
</template>

<script setup lang="ts">
import { useAppState } from '@/Data/States/App/app-state';

const app$ = useAppState();

// const onLoadLaborImporter = async () => {
//   app$.setActiveFeature('labor-importer');
//   await pliConfig$.fetchAndGroupOperations();
// };

// const onLoadProjectPakMaterialReportParser = () => {
//   app$.setActiveFeature('project-pak-material-report-parser');
// };
</script>


<style scoped lang="scss"></style>
