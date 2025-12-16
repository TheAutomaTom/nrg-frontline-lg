<template>

  <n-space vertical :size="24">

    <n-alert v-if="enabledLaborOptions.length === 0" type="warning" title="No Labor Items">
      Labor items are required to configure workflow steps. Please return to the data refresh page to load projects
      and labor items.
    </n-alert>

    <n-select v-if="workflowOptions.length > 1" v-model:value="selectedWorkflowId" :options="workflowOptions"
      :loading="workflows$.IsLoadingWorkflows" placeholder="Choose a workflow" clearable class="third-at-fullscreen" />



    <div v-if="selectedWorkflow">
      <n-card :title="`${selectedWorkflow.Name} Configuration`" size="small" :bordered="false">
        <template #header-extra>
          <n-button size="small" @click="selectedWorkflow && resetWorkflow(selectedWorkflow.Id)">
            Reset
          </n-button>
        </template>
        <n-space vertical :size="12">
          <div v-for="(step, idx) in selectedWorkflowSteps" :key="step.Id" class="step-row">
            <hr />
            <n-flex :size="12" align="center">
              <div style="width: 60px; text-align: center; font-weight: 500;">{{ getStepDisplayNumber(idx) }}</div>
              <div style="display: flex; flex-direction: column; gap: 2px;">
                <n-button text size="tiny" :disabled="!canMoveUp(idx)"
                  @click="selectedWorkflow && moveStepInWorkflow(selectedWorkflow.Id, idx, 'up')"
                  title="Move up">▲</n-button>
                <n-button text size="tiny" :disabled="!canMoveDown(idx)"
                  @click="selectedWorkflow && moveStepInWorkflow(selectedWorkflow.Id, idx, 'down')"
                  title="Move down">▼</n-button>
              </div>
              <n-select v-model:value="step.WorkOrderType" :options="getAllowedTypesForStep(idx)" placeholder="Type"
                style="width: 140px" @update:value="() => selectedWorkflow && enforceTypeOrder(selectedWorkflow.Id)" />
              <n-input-number v-model:value="step.TypicalDayCount" placeholder="Days" :min="1" :step="1" :precision="0"
                style="width: 120px" @update:value="workflows$.SaveWorkflowSteps()">
                <template #suffix>
                  day(s)
                </template>
              </n-input-number>
              <n-input v-model:value="step.Name" placeholder="Step name" style="flex: 1; min-width: 200px"
                class="step-name-input" @blur="workflows$.SaveWorkflowSteps()" />
              <n-button text type="error"
                @click="selectedWorkflow && removeStepFromWorkflow(selectedWorkflow.Id, idx)">✕</n-button>
              <n-select :value="getLaborIdArray(step)" multiple filterable placeholder="Select labor items"
                :options="getFilteredLaborOptions(step.WorkOrderType)" style="min-width: 240px"
                @update:value="(ids: string[]) => updateStepLaborItems(step, ids)" />
            </n-flex>
          </div>
          <n-text v-if="selectedWorkflowSteps.length === 0" depth="3" class="text-sm italic">
            No steps configured. Click "+ Add Step" to begin.
          </n-text>
        </n-space>
        <n-space justify="space-between" style="margin-top: 16px;">
          <n-button @click="selectedWorkflow && addStepToWorkflow(selectedWorkflow.Id)">
            + Add Step
          </n-button>
          <n-button type="primary" @click="selectedWorkflow && saveWorkflowSteps(selectedWorkflow.Id)">
            Save Steps
          </n-button>
        </n-space>
      </n-card>
    </div>
  </n-space>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useWorkflowsState } from '@/Data/States/App/ProdGantt/workflows-state';
import { useLaborsAndOperationsState } from '@/Data/States/App/ProdGantt/labors-state';
import { generateGuid } from '@/Core/Features/GuidGenerator';
import type { WorkflowStep } from '@/Core/Models/ProdGantt/WorkflowStep';
import type { LaborItemDto } from '@/Core/Models/nrg-dtos/LaborItemDto';

const workflows$ = useWorkflowsState();
const labors$ = useLaborsAndOperationsState();
const selectedWorkflowId = ref<string | null>(null);

const workflowOptions = computed(() => {
  if (!workflows$.Workflows) return [];
  return workflows$.Workflows.map((w) => ({
    label: w.Name,
    value: w.Id,
  }));
});

const workOrderTypeOptions = [
  { label: 'Drafting', value: 'Drafting' as const },
  { label: 'Production', value: 'Production' as const },
  { label: 'Installation', value: 'Installation' as const },
];

const enabledLaborOptions = computed(() => {
  return labors$.AllEnhancedLabors.filter(l => l.IsEnabled).map(l => ({
    label: l.Name,
    value: l,
  }));
});

function getFilteredLaborOptions(workOrderType: "Drafting" | "Production" | "Installation") {
  return labors$.AllEnhancedLabors
    .filter(l => l.IsEnabled && l.WorkOrderType === workOrderType)
    .map(l => ({ label: l.Name, value: l.LaborId }));
}

function getLaborIdArray(step: WorkflowStep): string[] {
  return step.LaborItems?.map(l => l.LaborId) || [];
}

function updateStepLaborItems(step: WorkflowStep, laborIds: string[]) {
  // Convert LaborId array back to LaborItemDto objects (extracting base properties from EnhancedLaborItem)
  step.LaborItems = laborIds
    .map(id => {
      const enhancedLabor = labors$.AllEnhancedLabors.find(l => l.LaborId === id);
      if (!enhancedLabor) return undefined;

      // Extract only LaborItemDto properties
      const laborDto: LaborItemDto = {
        LaborId: enhancedLabor.LaborId,
        Name: enhancedLabor.Name,
        Department: enhancedLabor.Department,
        JobCosting: enhancedLabor.JobCosting,
        Type: enhancedLabor.Type,
        WorkOrderType: enhancedLabor.WorkOrderType,
        HideInKiosk: enhancedLabor.HideInKiosk
      };
      return laborDto;
    })
    .filter((l): l is LaborItemDto => l !== undefined);
  workflows$.SaveWorkflowSteps();
}

function getAllowedTypesForStep(idx: number) {
  const typeOrder = ['Drafting', 'Production', 'Installation'];
  const steps = selectedWorkflowSteps.value;

  let minType = 0; // Drafting
  let maxType = 2; // Installation

  // Check previous step
  if (idx > 0) {
    const prevType = steps[idx - 1]?.WorkOrderType;
    if (prevType) {
      minType = typeOrder.indexOf(prevType);
    }
  }

  // Check next step
  if (idx < steps.length - 1) {
    const nextType = steps[idx + 1]?.WorkOrderType;
    if (nextType) {
      maxType = typeOrder.indexOf(nextType);
    }
  }

  return workOrderTypeOptions.filter((opt, i) => i >= minType && i <= maxType);
}

function enforceTypeOrder(workflowId: string | null) {
  if (!workflowId) return;
  const steps = workflows$.WorkflowStepsMap[workflowId] || [];
  const typeOrder = ['Drafting', 'Production', 'Installation'];

  // Check each step and adjust if it violates order
  for (let i = 1; i < steps.length; i++) {
    const prevTypeIdx = typeOrder.indexOf(steps[i - 1]!.WorkOrderType);
    const currTypeIdx = typeOrder.indexOf(steps[i]!.WorkOrderType);

    if (currTypeIdx < prevTypeIdx) {
      // Current step type is earlier than previous, adjust it
      steps[i]!.WorkOrderType = steps[i - 1]!.WorkOrderType;
      steps[i]!.LaborItems = []; // Clear incompatible labor items
    }
  }

  workflows$.WorkflowStepsMap[workflowId] = steps;
  workflows$.SaveWorkflowSteps();
}

function getStepDisplayNumber(idx: number): string {
  const step = selectedWorkflowSteps.value[idx];
  if (!step) return `${idx + 1}`;

  let typeSeq = 1;
  for (let i = 0; i < idx; i++) {
    if (selectedWorkflowSteps.value[i]?.WorkOrderType === step.WorkOrderType) {
      typeSeq++;
    }
  }

  const typePrefix = step.WorkOrderType[0]; // D, P, or I
  return `${typePrefix}${typeSeq}`;
}

function canMoveUp(idx: number): boolean {
  if (idx === 0) return false;
  const step = selectedWorkflowSteps.value[idx];
  const prevStep = selectedWorkflowSteps.value[idx - 1];
  if (!step || !prevStep) return false;

  // Can only move within same WorkOrderType
  return step.WorkOrderType === prevStep.WorkOrderType;
}

function canMoveDown(idx: number): boolean {
  if (idx === selectedWorkflowSteps.value.length - 1) return false;
  const step = selectedWorkflowSteps.value[idx];
  const nextStep = selectedWorkflowSteps.value[idx + 1];
  if (!step || !nextStep) return false;

  // Can only move within same WorkOrderType
  return step.WorkOrderType === nextStep.WorkOrderType;
}

const selectedWorkflow = computed(() => {
  if (!selectedWorkflowId.value || !workflows$.Workflows) return null;
  return workflows$.Workflows.find((w) => w.Id === selectedWorkflowId.value) ?? null;
});

const selectedWorkflowSteps = computed(() => {
  if (!selectedWorkflow.value) return [];
  const id = selectedWorkflow.value.Id;
  return workflows$.WorkflowStepsMap[id] || [];
});

// Auto-select the workflow if only one is available
import { watch, nextTick } from 'vue';

watch(
  () => workflowOptions.value,
  (opts) => {
    if (opts.length === 1 && !selectedWorkflowId.value) {
      nextTick(() => {
        selectedWorkflowId.value = opts[0]?.value ?? null;
      });
    }
  },
  { immediate: true }
);

// Remove disabled labor items from workflow steps
watch(
  () => labors$.AllEnhancedLabors,
  () => {
    removeDisabledLaborsFromWorkflows();
  },
  { deep: true }
);

function removeDisabledLaborsFromWorkflows() {
  if (!workflows$.WorkflowStepsMap) return;

  const enabledLaborIds = new Set(
    labors$.AllEnhancedLabors
      .filter(l => l.IsEnabled)
      .map(l => l.LaborId)
  );

  let hasChanges = false;
  Object.keys(workflows$.WorkflowStepsMap).forEach(workflowId => {
    const steps = workflows$.WorkflowStepsMap[workflowId];
    if (!steps) return;

    steps.forEach(step => {
      if (step.LaborItems && step.LaborItems.length > 0) {
        const originalLength = step.LaborItems.length;
        step.LaborItems = step.LaborItems.filter(labor =>
          enabledLaborIds.has(labor.LaborId)
        );
        if (step.LaborItems.length !== originalLength) {
          hasChanges = true;
        }
      }
    });
  });

  if (hasChanges) {
    workflows$.SaveWorkflowSteps();
  }
}



// --- Workflow Step Management Functions ---
function addStepToWorkflow(workflowId: string) {
  const steps = workflows$.WorkflowStepsMap[workflowId] || [];
  const lastStep = steps[steps.length - 1];
  const defaultType = lastStep?.WorkOrderType || 'Drafting';

  steps.push({
    Id: generateGuid(),
    Name: '',
    WorkOrderType: defaultType,
    Sequence: 1,
    TypicalDayCount: 1,
    LaborItems: [],
  });
  workflows$.WorkflowStepsMap[workflowId] = steps;
  workflows$.SaveWorkflowSteps();
}

function removeStepFromWorkflow(workflowId: string, idx: number) {
  const steps = workflows$.WorkflowStepsMap[workflowId] || [];
  steps.splice(idx, 1);
  if (steps.length === 0) {
    steps.push({
      Id: generateGuid(),
      Name: '',
      WorkOrderType: 'Drafting',
      Sequence: 1,
      TypicalDayCount: 1,
      LaborItems: [],
    });
  }
  workflows$.WorkflowStepsMap[workflowId] = steps;
  workflows$.SaveWorkflowSteps();
}

function moveStepInWorkflow(workflowId: string, idx: number, dir: 'up' | 'down') {
  const steps = workflows$.WorkflowStepsMap[workflowId] || [];
  const swapWith = dir === 'up' ? idx - 1 : idx + 1;
  if (swapWith < 0 || swapWith >= steps.length) return;
  const tmp = steps[idx]!;
  steps[idx] = steps[swapWith]!;
  steps[swapWith] = tmp;
  workflows$.WorkflowStepsMap[workflowId] = steps;
  workflows$.SaveWorkflowSteps();
}

function resetWorkflow(workflowId: string) {
  workflows$.WorkflowStepsMap[workflowId] = [
    {
      Id: generateGuid(),
      Name: '',
      WorkOrderType: 'Drafting',
      Sequence: 1,
      TypicalDayCount: 1,
      LaborItems: [],
    },
  ];
  workflows$.SaveWorkflowSteps();
}

function saveWorkflowSteps(workflowId: string) {
  const steps = workflows$.WorkflowStepsMap[workflowId] || [];

  // Sort by WorkOrderType order, then re-sequence within each type
  const typeOrder = ['Drafting', 'Production', 'Installation'];
  steps.sort((a, b) => typeOrder.indexOf(a.WorkOrderType) - typeOrder.indexOf(b.WorkOrderType));

  // Re-sequence within each WorkOrderType
  let currentType: string | null = null;
  let typeSequence = 0;

  steps.forEach((s) => {
    if (s.WorkOrderType !== currentType) {
      currentType = s.WorkOrderType;
      typeSequence = 1;
    } else {
      typeSequence++;
    }
    s.Sequence = typeSequence;
  });

  workflows$.WorkflowStepsMap[workflowId] = steps;
  workflows$.SaveWorkflowSteps();
  console.log('Saved workflow steps for', workflowId, steps);
}
</script>
