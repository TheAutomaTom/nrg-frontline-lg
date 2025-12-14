<template>
  <n-tab-pane name="workflows" tab="Workflows">
    <div class="workflow-selector">
      <n-select v-model:value="selectedWorkflowId" :options="workflowOptions" :loading="workflows$.IsLoadingWorkflows"
        placeholder="Choose a workflow" clearable class="workflow-selector__select" />

      <n-alert type="info" class="text-sm workflow-selector__alert">
        This tool requires manually configuring workflow steps.
        <n-button v-if="selectedWorkflow?.Name === 'Primary Workflow'" size="small" @click="handleReset"
          style="text-decoration: line-through;">
          Reset to Default Workflow
        </n-button>
      </n-alert>
    </div>
  </n-tab-pane>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useWorkflowsState } from '@/Data/States/App/ProdGantt/workflows-state';
import type { WorkflowDto } from '@/Core/Models/nrg-dtos/WorkflowDto';

const workflows$ = useWorkflowsState();

const selectedWorkflowId = ref<string | null>(null);

const workflowOptions = computed(() => {
  if (!workflows$.Workflows) return [];
  return workflows$.Workflows.map((w) => ({
    label: w.Name,
    value: w.Id,
  }));
});

const selectedWorkflow = computed(() => {
  if (!selectedWorkflowId.value || !workflows$.Workflows) return null;
  return workflows$.Workflows.find((w) => w.Id === selectedWorkflowId.value) ?? null;
});

const handleReset = () => {
  // Confirm reset
  // If confirmed, call resetWorkflow
};
</script>

<style scoped>
.workflow-selector {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

@media (min-width: 900px) {
  .workflow-selector {
    flex-direction: row;
    align-items: center;
    gap: 16px;
  }

  .workflow-selector__alert {
    flex: 1 1 auto;
  }

  .workflow-selector__select {
    width: 320px;
  }
}
</style>
