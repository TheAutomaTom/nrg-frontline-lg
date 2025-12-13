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
import { ref, onMounted, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useWorkflowsState } from '@/data/states/WorkflowAsync/workflows-state';
import { useLaborPlannerState } from '@/data/states/WorkflowAsync/labor-planner-state';
import { useAppState } from '@/data/states/App/app-state';
import type { WorkflowWithSteps } from '@/core/models/WorkflowAsync/WorkflowWithSteps';

defineOptions({ name: 'WorkflowDurationConfig' });

const workflows$ = useWorkflowsState();
const laborPlanner$ = useLaborPlannerState();
const app$ = useAppState();
const router = useRouter();
const workflowsWithSteps = ref<WorkflowWithSteps[]>([]);

const STORAGE_KEY = 'workflow-durations-config';

const initializeWorkflows = () => {
  // Try to load from localStorage first
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      workflowsWithSteps.value = JSON.parse(stored);
      console.log('[WorkflowDurationConfig] Loaded from storage');
      return;
    } catch (err) {
      console.warn('[WorkflowDurationConfig] Failed to parse stored data', err);
    }
  }

  // Otherwise initialize from workflows state
  workflowsWithSteps.value = workflows$.Workflows.map((wf) => ({
    workflowId: wf.Id,
    workflowName: wf.Name,
    steps: [],
  }));
};

const addStep = (workflowId: string) => {
  const workflow = workflowsWithSteps.value.find((w) => w.workflowId === workflowId);
  if (workflow) {
    workflow.steps.push({
      phase: workflow.steps.length + 1,
      name: '',
      duration: 1,
      laborItemIds: [],
    });
  }
};

const removeStep = (workflowId: string, stepIndex: number) => {
  const workflow = workflowsWithSteps.value.find((w) => w.workflowId === workflowId);
  if (workflow) {
    workflow.steps.splice(stepIndex, 1);
  }
};

const confirmRemove = (workflowId: string, stepIndex: number, name: string) => {
  app$.openModal('confirm', {
    title: 'Remove Step?',
    message: `Are you sure you want to remove "${name || 'this step'}"?`,
    confirmText: 'Remove',
    cancelText: 'Cancel',
    confirmType: 'error',
    onConfirm: () => removeStep(workflowId, stepIndex),
  });
};

const moveStep = (workflowId: string, stepIndex: number, direction: 'up' | 'down') => {
  const workflow = workflowsWithSteps.value.find((w) => w.workflowId === workflowId);
  if (!workflow) return;

  const newIndex = direction === 'up' ? stepIndex - 1 : stepIndex + 1;
  if (newIndex < 0 || newIndex >= workflow.steps.length) return;

  // Swap the steps using splice for proper reactivity
  const [removed] = workflow.steps.splice(stepIndex, 1);
  if (removed) {
    workflow.steps.splice(newIndex, 0, removed);
  }
};

const handleSave = () => {
  try {
    // Calculate phase numbers based on position before saving
    workflowsWithSteps.value.forEach(workflow => {
      workflow.steps.forEach((step, index) => {
        step.phase = index + 1;
      });
    });

    localStorage.setItem(STORAGE_KEY, JSON.stringify(workflowsWithSteps.value));
    console.log('[WorkflowDurationConfig] Saved to storage');
    // Could show a success message here
  } catch (err) {
    console.error('[WorkflowDurationConfig] Failed to save', err);
  }
};

const resetWorkflow = (workflowId: string) => {
  const workflow = workflowsWithSteps.value.find((w) => w.workflowId === workflowId);
  if (!workflow) return;

  if (confirm(`Reset "${workflow.workflowName}" configuration? This will clear all steps.`)) {
    workflow.steps = [];
    handleSave(); // Auto-save after reset
  }
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
watch(workflowsWithSteps, () => {
  handleSave();
}, { deep: true });

onMounted(async () => {
  // Workflows and labor items are loaded from cache on store init
  // They're refreshed via the data refresh page
  if (workflows$.Workflows.length === 0 || laborPlanner$.LaborItems.length === 0) {
    app$.setAppStatus('error', 'No data available. Please refresh data first.');
    router.push({ name: 'data-refresh' });
    return;
  }

  initializeWorkflows();
});

</script>

<style scoped>
.workflow-section {
  margin-bottom: 16px;
}

.step-row {
  padding: 8px;
  border-radius: 4px;
  /* background-color: var(--n-color-target); */
}
</style>
