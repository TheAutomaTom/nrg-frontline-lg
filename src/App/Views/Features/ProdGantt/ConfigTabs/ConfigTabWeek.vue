<template>
  <n-tab-pane name="week" tab="Week">
    <n-space vertical :size="24">
      <n-alert type="info" closable>
        Configure the default work week for all workflows. In the future, you'll be able to set unique schedules per
        workflow.
      </n-alert>

      <n-spin :show="workWeek$.IsLoadingWorkWeek">
        <n-form v-if="localWeek" label-placement="left" label-width="140">
          <n-form-item label="Hours Per Day">
            <n-input-number v-model:value="localWeek.HoursPerDay" :min="0.5" :max="24" :step="0.5" @blur="handleSave" />
          </n-form-item>

          <n-form-item label="Start of Day">
            <n-time-picker v-model:formatted-value="localWeek.StartOfDay" format="HH:mm" value-format="HH:mm"
              @blur="handleSave" />
          </n-form-item>

          <n-form-item label="Typical Work Days">
            <n-checkbox-group v-model:value="localWeek.WorkingDays.Typical" @update:value="handleSave">
              <n-space>
                <n-checkbox v-for="day in allDays" :key="day" :value="day" :label="day" />
              </n-space>
            </n-checkbox-group>
          </n-form-item>

          <n-form-item label="Overtime Days">
            <n-checkbox-group v-model:value="localWeek.WorkingDays.Overtime" @update:value="handleSave">
              <n-space>
                <n-checkbox v-for="day in allDays" :key="day" :value="day" :label="day" />
              </n-space>
            </n-checkbox-group>
          </n-form-item>

          <n-form-item>
            <n-space>
              <n-button type="primary" @click="handleSave">
                Save Work Week
              </n-button>
              <n-button @click="handleReset">
                Reset to Default
              </n-button>
            </n-space>
          </n-form-item>
        </n-form>
      </n-spin>
    </n-space>
  </n-tab-pane>
</template>
<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useWorkWeekState } from '@/Data/States/App/ProdGantt/work-week-state';
import { WeekDay } from '@/Core/Models/ProdGantt/WeekDay';
import type { WorkWeek } from '@/Core/Models/ProdGantt/WorkWeek';

const workWeek$ = useWorkWeekState();

const allDays = Object.values(WeekDay);

const localWeek = ref<WorkWeek | null>(null);

const initLocalWeek = () => {
  if (workWeek$.DefaultWorkWeek) {
    localWeek.value = JSON.parse(JSON.stringify(workWeek$.DefaultWorkWeek));
  }
};

const handleSave = () => {
  if (localWeek.value) {
    workWeek$.SaveWorkWeek(localWeek.value);
  }
};

const handleReset = () => {
  workWeek$.ResetWorkWeek();
  initLocalWeek();
};

onMounted(async () => {
  if (!workWeek$.DefaultWorkWeek) {
    await workWeek$.LoadWorkWeek();
  }
  initLocalWeek();
});

watch(() => workWeek$.DefaultWorkWeek, () => {
  initLocalWeek();
}, { deep: true });
</script>

<style scoped></style>
