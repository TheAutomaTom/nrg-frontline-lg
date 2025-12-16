<template>
  <div class="labor-importer-footer">
    <!--
    <n-button class="footer-button" :class="{ 'highlight-active': routeName === 'pli-test-page' }" size="small"
      @click="goTest" aria-label="Test">
      <span class="icon">🧪</span>
      <span class="label hide-on-mobile">Test Eng. Sync</span>
    </n-button>
-->

    <n-button class="footer-button" :class="{ 'highlight-active': routeName === 'pg-config' }" size="small"
      @click="goConfigureProdGantt" aria-label="Config Workflow">
      <span class="icon">⚙️</span>
      <span class="label hide-on-mobile">Config Workflow</span>
    </n-button>
    <n-button class="footer-button" :class="{ 'highlight-active': routeName === 'pg-prod-gantt-data' }" size="small"
      @click="goProdGanttData" aria-label="Prod Gantt Data">
      <span class="icon">📊</span>
      <span class="label hide-on-mobile">Prod Gantt Data</span>
    </n-button>
  </div>
</template>

<script setup lang="ts">
import { useRouter, useRoute } from 'vue-router';
import { computed } from 'vue';

const router = useRouter();
const route = useRoute();

const routeName = computed(() => route?.name as string | undefined);

const goConfigureProdGantt = () => router.push({ name: 'pg-config' });
const goProdGanttData = () => router.push({ name: 'pg-prod-gantt-data' });
</script>

<style scoped>
.labor-importer-footer {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.footer-button {
  height: 32px;
}

.footer-button .icon {
  display: inline-block;
  font-size: 1rem;
  line-height: 1;
}

.footer-button .label {
  margin-left: 0.35rem;
  font-size: 0.9rem;
}
</style>
