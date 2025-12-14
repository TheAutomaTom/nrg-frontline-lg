<template>
  <n-space vertical :size="24">


    <n-spin :show="workWeek$.IsLoadingWorkWeek">
      <div v-if="localWeek" class="week-config">
        <div class="week-row">
          <label class="week-label">Hours Per Day</label>
          <n-input-number v-model:value="localWeek.HoursPerDay" :min="0.5" :max="24" :step="0.5" @blur="handleSave" />
        </div>

        <div class="week-row">
          <label class="week-label">Start of Day</label>
          <n-time-picker v-model:formatted-value="localWeek.StartOfDay" format="HH:mm" value-format="HH:mm"
            @blur="handleSave" />
        </div>

        <div class="week-row">
          <label class="week-label">Typical Work Days</label>
          <n-checkbox-group v-model:value="localWeek.WorkingDays.Typical" @update:value="handleSave">
            <n-space>
              <n-checkbox v-for="day in allDays" :key="day" :value="day" :label="day" />
            </n-space>
          </n-checkbox-group>
        </div>

        <div class="week-row">
          <label class="week-label">Overtime Eligibile</label>
          <n-checkbox-group v-model:value="localWeek.WorkingDays.Overtime" @update:value="handleSave">
            <n-space>
              <n-checkbox v-for="day in allDays" :key="day" :value="day" :label="day" />
            </n-space>
          </n-checkbox-group>
        </div>

        <n-space>
          <n-button type="primary" @click="handleSave">Save Work Week</n-button>
          <n-button @click="handleReset">Reset to Default</n-button>
        </n-space>
      </div>
    </n-spin>
  </n-space>
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

<style scoped>
.week-config {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.week-row {
  display: grid;
  grid-template-columns: 160px 1fr;
  gap: 12px;
  align-items: center;
}

.week-label {
  color: var(--text-color);
}

@media (max-width: 640px) {
  .week-row {
    grid-template-columns: 1fr;
  }
}
</style>
