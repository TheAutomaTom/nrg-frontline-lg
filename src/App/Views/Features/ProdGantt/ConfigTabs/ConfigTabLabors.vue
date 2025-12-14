<template>
  <n-space vertical :size="24">
    <div class="labor-controls">
      <n-space>
        <n-button @click="labors$.SetAllLaborsEnabled(true)">All On</n-button>
        <n-button @click="labors$.SetAllLaborsEnabled(false)">All Off</n-button>
        <n-button type="primary" @click="labors$.LoadLaborItems()" :loading="labors$.IsLoadingLaborItems">
          Refresh List
        </n-button>
      </n-space>
      <n-input v-model:value="searchQuery" placeholder="Search labor items..." clearable />
    </div>

    <n-alert v-if="labors$.AllEnhancedLabors.length === 0" type="info">
      No labor items loaded. Click "Refresh List" to load labor items from server.
    </n-alert>

    <n-tabs v-else type="segment">
      <n-tab-pane name="drafting" tab="Drafting">
        <n-data-table :columns="columns" :data="filteredDrafting" :pagination="pagination" :bordered="false" />
      </n-tab-pane>
      <n-tab-pane name="production" tab="Production">
        <n-data-table :columns="columns" :data="filteredProduction" :pagination="pagination" :bordered="false" />
      </n-tab-pane>
      <n-tab-pane name="installation" tab="Installation">
        <n-data-table :columns="columns" :data="filteredInstallation" :pagination="pagination" :bordered="false" />
      </n-tab-pane>
    </n-tabs>
  </n-space>
</template>

<script setup lang="ts">
import { ref, computed, h, onMounted } from 'vue';
import { NSwitch, NButton } from 'naive-ui';
import { useLaborsAndOperationsState, type EnhancedLaborItem } from '@/Data/States/App/ProdGantt/labors-state';
import type { DataTableColumns } from 'naive-ui';

const labors$ = useLaborsAndOperationsState();
const searchQuery = ref('');

const pagination = { pageSize: 20 };

const filterList = (list: EnhancedLaborItem[]) => {
  const query = searchQuery.value.toLowerCase().trim();
  if (!query) return list;
  return list.filter((labor) => (
    labor.Name?.toLowerCase().includes(query) ||
    labor.Department?.toLowerCase().includes(query) ||
    labor.Type?.toLowerCase().includes(query)
  ));
};

const filteredDrafting = computed(() => filterList(labors$.DraftingLabors));
const filteredProduction = computed(() => filterList(labors$.ProductionLabors));
const filteredInstallation = computed(() => filterList(labors$.InstallationLabors));

const getListForLabor = (laborId: string) => {
  if (labors$.DraftingLabors.find(l => l.LaborId === laborId)) return labors$.DraftingLabors;
  if (labors$.ProductionLabors.find(l => l.LaborId === laborId)) return labors$.ProductionLabors;
  if (labors$.InstallationLabors.find(l => l.LaborId === laborId)) return labors$.InstallationLabors;
  return [];
};

const columns: DataTableColumns<EnhancedLaborItem> = [
  {
    title: 'Order',
    key: 'order',
    width: 90,
    render: (row) => {
      const list = getListForLabor(row.LaborId);
      const actualIdx = list.findIndex(l => l.LaborId === row.LaborId);
      return [
        h(NButton, {
          size: 'small',
          quaternary: true,
          disabled: actualIdx === 0,
          onClick: () => labors$.MoveLabor(row.LaborId, 'up'),
          style: 'margin-right:4px;'
        }, { default: () => '▲' }),
        h(NButton, {
          size: 'small',
          quaternary: true,
          disabled: actualIdx === list.length - 1,
          onClick: () => labors$.MoveLabor(row.LaborId, 'down'),
        }, { default: () => '▼' })
      ];
    }
  },
  {
    title: 'Enabled',
    key: 'enabled',
    width: 100,
    render: (row) =>
      h(NSwitch, {
        value: row.IsEnabled,
        onUpdateValue: () => labors$.ToggleLaborEnabled(row.LaborId),
      }),
  },
  { title: 'Name', key: 'Name', ellipsis: { tooltip: true } },
  { title: 'Department', key: 'Department', ellipsis: { tooltip: true } },
  { title: 'Type', key: 'Type', width: 120 },
  { title: 'Work Order Type', key: 'WorkOrderType', width: 150 },
];

onMounted(async () => {
  if (labors$.AllEnhancedLabors.length === 0) {
    await labors$.LoadLaborItems();
  }
});
</script>

<style scoped>
.labor-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
}

@media (max-width: 768px) {
  .labor-controls {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
