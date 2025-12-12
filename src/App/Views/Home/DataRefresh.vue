<template>
  <div>
    <n-card title="Data Refresh">
      <!-- <template #header-extra>
        <n-space>
          <n-text><a class="periwinkle-link" href="/help/planned-labor-import" target="_blank"
              rel="noopener noreferrer">Help Page</a></n-text>
        </n-space>
      </template> -->


      <n-flex vertical>




        <n-alert type="info" class="text-sm italic">
          Enter your API key to load data from the server when a feature is selected. Find it at the bottom of <a
            href="https://app.innergy.com/#/account/settings" target="_blank" rel="noopener"
            class="periwinkle-link">this
            page</a>.
        </n-alert>
        <n-input v-model:value="user$.Key" type="password" show-password-on="click" placeholder="Api Key" required />

        <n-button type="tertiary" :ghost="false" class="feature-button"
          :class="{ 'highlight-active': app$.ActiveFeature === 'test-api-key' }"
          @click="() => { app$.setActiveFeature('test-api-key'); handleTestApiKey(); }">
          <template v-if="testApiKeyLoading">
            <n-spin size="small" />
          </template>
          <template v-else>
            {{ testApiKeyFailed ? 'Validate Api Key' : 'Validate Api Key' }}
          </template>
        </n-button>


        <ul class="info-list">
          <li>Server Version: {{ instance$.TestedServerVersion || 'Not loaded' }}</li>
          <li>Tenant: {{ instance$.TestedTenantInfo?.CompanyName || 'Not loaded' }}</li>
          <li v-if="instance$.LastTestApiKeySuccess">Last Success: {{ new
            Date(instance$.LastTestApiKeySuccess).toLocaleString()
          }}</li>
        </ul>

        <template v-if="instance$.LastTestApiKeySuccess">
          <feature-selection></feature-selection>


          <template v-if="app$.ActiveFeature === 'labor-importer'">
            <ul class="info-list">
              <span><strong>Cache Stats:</strong></span>
              <li v-for="(stat, key) in cacheStats" :key="key">
                <strong class="capitalize">{{ key }}:</strong> {{ stat.count }}
                <span v-if="stat.timestamp" class="text-xs text-gray-400 ml-2"> ({{ stat.timestamp }})</span>
              </li>
            </ul>
          </template>

        </template>
      </n-flex>
    </n-card>
  </div>
</template>

<script setup lang="ts">
const testApiKeyLoading = ref(false);
const testApiKeyFailed = computed(() => {
  return (
    instance$.TestApiKeyError ||
    !instance$.TestedTenantInfo ||
    !instance$.TestedServerVersion
  );
});

const handleTestApiKey = async () => {
  testApiKeyLoading.value = true;
  await instance$.TestApiKey(user$.Key);
  testApiKeyLoading.value = false;
};
defineOptions({ name: "RefreshPanel" });

import { computed, ref, onMounted, watch } from "vue";
import { useUserConfigState } from "../../../Data/States/App/user-config-state";
import { useInstanceState } from "@/Data/States/App/instance-state";
import { useAppState } from "@/Data/States/App/app-state";
import FeatureSelection from "./FeatureSelection.vue";

const user$ = useUserConfigState();
const instance$ = useInstanceState();
const app$ = useAppState();

const cacheStats = ref<Record<string, { count: number, timestamp: string | null }>>({});

const refreshCacheStats = () => {
  // const projects = PlannedLaborImportCache.getProjects();

  cacheStats.value = {
    // projects: {
    //   count: projects?.Items?.length ?? 0,
    //   timestamp: formatTimestamp(PlannedLaborImportCache.getProjectsTimestamp()),
    // },
  };
};

const formatTimestamp = (ts: number | null) => {
  return ts ? new Date(ts).toLocaleString() : null;
};

onMounted(async () => {
  refreshCacheStats();
});

watch(
  () => instance$.LastTestApiKeySuccess,
  async (ts) => {
    if (ts) {
      app$.setActiveFeature('labor-importer');
    } else {
      app$.setActiveFeature(null);
    }
  },
  { immediate: true },
);

</script>

<style scoped lang-="scss"></style>
