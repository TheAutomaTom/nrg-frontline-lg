<template>
  <n-card title="Workflows">
    <n-space vertical :size="24">

      <n-alert type="info" class="text-sm">
        This tool cannot download your workflow durations from your server. Please configure the steps and their
        durations manually below.
      </n-alert>

      <n-alert v-if="laborItemOptions.length === 0" type="warning" title="No Labor Items">
        Labor items are required to configure workflow steps. Please return to the data refresh page to load projects
        and labor items.
      </n-alert>

      <div v-for="workflow in workflowsWithSteps" :key="workflow.workflowId" class="workflow-section">
        <n-card :title="workflow.workflowName" size="small" :bordered="false">
          <template #header-extra>
            <n-space :size="8">
              <n-button size="small" @click="resetWorkflow(workflow.workflowId)">
                Reset
              </n-button>
              <n-button size="small" @click="addStep(workflow.workflowId)">
                + Add Step
              </n-button>
            </n-space>
          </template>

          <n-space vertical :size="12">
            <div v-for="(step, index) in workflow.steps" :key="index" class="step-row">
              <hr />
              <n-flex :size="12" align="center">
                <div style="width: 60px; text-align: center; font-weight: 500;">
                  {{ index + 1 }}
                </div>

                <div style="display: flex; flex-direction: column; gap: 2px;">
                  <n-button text size="tiny" :disabled="index === 0" @click="moveStep(workflow.workflowId, index, 'up')"
                    title="Move up">
                    ▲
                  </n-button>
                  <n-button text size="tiny" :disabled="index === workflow.steps.length - 1"
                    @click="moveStep(workflow.workflowId, index, 'down')" title="Move down">
                    ▼
                  </n-button>
                </div>

                <n-input v-model:value="step.name" placeholder="Step name" style="flex: 1; min-width: 200px"
                  class="step-name-input" />
                <n-input-number v-model:value="step.duration" placeholder="Days" :min="0" :step="1" :precision="0"
                  style="width: 120px" />
                <n-button text type="error" @click="confirmRemove(workflow.workflowId, index, step.name)">
                  ✕
                </n-button>
                <n-select v-model:value="step.laborItemIds" multiple filterable placeholder="Select labor items"
                  :options="laborItemOptions" style="min-width: 240px" />
              </n-flex>
            </div>

            <n-text v-if="workflow.steps.length === 0" depth="3" class="text-sm italic">
              No steps configured. Click "+ Add Step" to begin.
            </n-text>
          </n-space>

        </n-card>
      </div>
    </n-space>
  </n-card>
</template>

<script setup lang="ts">
import type { WorkflowStep } from '@/Core/Models/ProdGantt/WorkflowStep';
import { ref, onMounted, computed, watch } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

const STORAGE_KEY = 'workflow-config';

const initializeWorkflows = () => {
  // Try to load from localStorage first
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      console.log('[WorkflowDurationConfig] Loaded from storage');
      return;
    } catch (err) {
      console.warn('[WorkflowDurationConfig] Failed to parse stored data', err);
    }
  }

  // Otherwise initialize new from workflow-state
};

const addStep = (step: WorkflowStep) => {
  // Update workflow-state
  // Update Cache
};

const removeStep = (stepId: string) => {
  // Update workflow-state by removing step with this stepId
  // Update Cache
};

const confirmRemove = (workflowId: string, stepId: string, name: string) => {
  app$.openModal('confirm', {
    title: 'Remove Step?',
    message: `Are you sure you want to remove "${name || 'this step'}"?`,
    confirmText: 'Remove',
    cancelText: 'Cancel',
    confirmType: 'error',
    onConfirm: () => removeStep(stepId),
  });
};

const moveStep = (stepIndex: number, direction: 'up' | 'down') => {
  // Update the order of steps in workflow-state
  // Update Cache
};

const handleSave = () => {
  try {

  } catch (err) {

  }
};

const resetWorkflow = (workflowId: string) => {
  // Reset the workflow steps to empty or default
  // Clear Cache
};


// options for labor items select
const laborItemOptions = computed(() =>
  laborPlanner$.LaborItems
    .slice()
    .sort((a, b) => {
      // Try to extract numeric sequence from ExternalId or Name if available
      const getSequence = (item: typeof a) => {
        const numMatch = item.ExternalId?.match(/\d+/) || item.Name.match(/\d+/);
        return numMatch ? parseInt(numMatch[0], 10) : 999999;
      };
      return getSequence(a) - getSequence(b);
    })
    .map(li => ({ label: li.Name, value: li.LaborId }))
);

// Auto-save whenever workflows change
watch(workflow, () => {
  handleSave();
}, { deep: true });

onMounted(async () => {
  // If no data in memory, check cache.
  // If no data in cache, use pinia states to call NrgClient to populate data.
  // If no data comes from NrgClient, redirect to data refresh page.
  // AppStatus Error message, "Check your api key or internet connection."

  initializeWorkflows();
});

</script>

<style scoped></style>
