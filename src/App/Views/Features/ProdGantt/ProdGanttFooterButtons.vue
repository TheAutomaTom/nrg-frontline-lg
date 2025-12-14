<template>
  <div class="labor-importer-footer">
    <!--
    <n-button class="footer-button" :class="{ 'highlight-active': routeName === 'pli-test-page' }" size="small"
      @click="goTest" aria-label="Test">
      <span class="icon">🧪</span>
      <span class="label hide-on-mobile">Test Eng. Sync</span>
    </n-button>
-->

    <n-button class="footer-button" :class="{ 'highlight-active': routeName === 'lg-config' }" size="small"
      @click="goConfigWorkflows" aria-label="Config Workflow">
      <span class="icon">⚙️</span>
      <span class="label hide-on-mobile">Config Workflow</span>
    </n-button>
  </div>
</template>

<script setup lang="ts">
import { useRouter, useRoute } from 'vue-router';
import { computed } from 'vue';

const router = useRouter();
const route = useRoute();

const routeName = computed(() => route?.name as string | undefined);

const goConfigWorkflows = () => router.push({ name: 'lg-config' });
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
