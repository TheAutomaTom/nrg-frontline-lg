<template>
  <n-space vertical :size="24">
    <div class="labor-controls">
      <n-space>
        <n-button @click="handleEnableAll">All On</n-button>
        <n-button @click="handleDisableAll">All Off</n-button>
        <n-button type="primary" @click="loadLabors" :loading="labors$.IsLoadingLaborItems">
          Refresh List
        </n-button>
      </n-space>
      <n-input v-model:value="searchQuery" placeholder="Search labor items..." clearable />
    </div>

    <n-alert v-if="!labors$.LaborItems" type="info">
      No labor items loaded. Click "Refresh List" to load labor items from server.
    </n-alert>

    <n-data-table v-else :columns="columns" :data="filteredLabors" :pagination="pagination" :bordered="false" />
  </n-space>
</template>

<script setup lang="ts">
import { ref, computed, h, onMounted } from 'vue';
import { NSwitch, NButton } from 'naive-ui';
import { useLaborsAndOperationsState } from '@/Data/States/App/ProdGantt/labors-state';
import type { DataTableColumns } from 'naive-ui';
import type { LaborItemDto } from '@/Core/Models/nrg-dtos/LaborItemDto';

const labors$ = useLaborsAndOperationsState();
const searchQuery = ref('');

const pagination = { pageSize: 20 };

const filteredLabors = computed(() => {
  const items = labors$.OrderedLaborItems ? labors$.OrderedLaborItems() : labors$.LaborItems || [];
  const query = searchQuery.value.toLowerCase().trim();
  if (!query) return items;
  return items.filter((labor) => (
    labor.Name?.toLowerCase().includes(query) ||
    labor.Department?.toLowerCase().includes(query) ||
    labor.Type?.toLowerCase().includes(query)
  ));
});

const columns: DataTableColumns<LaborItemDto> = [
  {
    title: 'Order',
    key: 'order',
    width: 90,
    render: (row) => [
      h(NButton, {
        size: 'small',
        quaternary: true,
        disabled: !canMove(row, 'up'),
        onClick: () => moveRow(row, 'up'),
        style: 'margin-right:4px;'
      }, { default: () => '▲' }),
      h(NButton, {
        size: 'small',
        quaternary: true,
        disabled: !canMove(row, 'down'),
        onClick: () => moveRow(row, 'down'),
      }, { default: () => '▼' })
    ]
  },
  {
    title: 'I/O',
    key: 'enabled',
    width: 80,
    render: (row) =>
      h(NSwitch, {
        value: labors$.IsLaborEnabled(row.LaborId),
        onUpdateValue: () => labors$.ToggleLaborEnabled(row.LaborId),
      }),
  },
  { title: 'Name', key: 'Name', ellipsis: { tooltip: true } },
  { title: 'Department', key: 'Department', ellipsis: { tooltip: true } },
  { title: 'Type', key: 'Type', width: 120 },
  { title: 'Work Order Type', key: 'WorkOrderType', width: 150 },
];

function canMove(row: LaborItemDto, dir: 'up' | 'down') {
  const items = labors$.OrderedLaborItems ? labors$.OrderedLaborItems() : labors$.LaborItems || [];
  const idx = items.findIndex(l => l.LaborId === row.LaborId);
  if (dir === 'up') return idx > 0;
  if (dir === 'down') return idx < items.length - 1;
  return false;
}

function moveRow(row: LaborItemDto, dir: 'up' | 'down') {
  labors$.MoveLabor(row.LaborId, dir);
}

const handleEnableAll = () => labors$.SetAllLaborsEnabled(true);
const handleDisableAll = () => labors$.SetAllLaborsEnabled(false);
const loadLabors = async () => { await labors$.LoadLaborItems(); };

onMounted(async () => {
  if (!labors$.LaborItems || labors$.LaborItems.length === 0) {
    await labors$.LoadLaborItems();
  }
});
</script>
