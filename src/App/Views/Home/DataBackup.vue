<template>
  <div class="page">
    <n-divider title-placement="left">Local App State</n-divider>

    <n-space vertical justify="start">
      <n-button type="tertiary" class="feature-button" :class="{ 'highlight-active': activeAction === 'newGame' }"
        @focus="activeAction = 'newGame'" @click="handleNewGame">
        ✦ New Game
      </n-button>
      <n-button type="tertiary" class="feature-button" :class="{ 'highlight-active': activeAction === 'save' }"
        @focus="activeAction = 'save'" @click="activeAction = 'save'; exportData();">
        ▼ Save Game
      </n-button>
    </n-space>

    <input ref="fileInput" class="hidden-input" type="file" accept="application/json" @change="handleFileChange" />
    <n-space justify="start">

      <template v-if="selectedFile">
        <n-button type="primary" class="feature-button highlight-active-2"
          :class="{ 'highlight-active-2': activeAction === 'load' }" @focus="activeAction = 'load'"
          @click="activeAction = 'load'; importData();">
          ▲ Load Game
        </n-button>
      </template>

      <n-button type="tertiary" :ghost="false" class="feature-button"
        :class="{ 'highlight-active': activeAction === 'choose' }" @focus="activeAction = 'choose'"
        @click="activeAction = 'choose'; triggerFileSelect();">
        {{ selectedFile?.name || '▲ Load Game' }}
      </n-button>
    </n-space>

    <n-divider title-placement="left">Current Snapshot Contents</n-divider>
    <ul class="summary">
      <li>Pli Version: 251210-1650</li>
      <li>Tenant: {{ tenantName }}</li>
      <li>Server Version: {{ serverVersion || 'Not fetched' }}</li>
    </ul>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useInstanceState } from '@/Data/States/App/instance-state';
import { useAppState } from '@/Data/States/App/app-state';
import { useUserConfigState } from '@/Data/States/App/user-config-state';
import { useModalState } from '@/Data/States/App/modal-state';
import { TenantInfoCache } from '@/Data/Caches/App/TenantInfoCache';

const router = useRouter();
const instance$ = useInstanceState();
const app$ = useAppState();
const user$ = useUserConfigState();
const modal$ = useModalState();

const fileInput = ref<HTMLInputElement | null>(null);
const selectedFile = ref<File | undefined>(undefined);
const serverVersion = ref<string | undefined>(undefined);
const tenantName = computed(() => instance$.TenantInfo?.CompanyName ?? '(unknown)');
const activeAction = ref<'newGame' | 'save' | 'load' | 'choose' | null>(null);
const handleNewGame = () => {
  activeAction.value = 'newGame';
  app$.openModal('confirm', {
    title: 'Clear All Data',
    message: 'Are you sure? This will clear 100% of your local data if you proceed.',
    confirmText: 'Yes, Clear Everything',
    cancelText: 'Cancel',
    confirmType: 'warning',
    onConfirm: async () => {
      await handleConfirmClear();
    },
  });
};

/**
 * Build a backup payload containing core app data
 */
function buildBackupPayload() {
  const payload = {
    version: 2,
    exportedAt: new Date().toISOString(),
    data: {
      tenantInfo: TenantInfoCache.load(),
    },
    stores: {
      app: {
        ActiveFeature: app$.ActiveFeature,
        AppStatus: app$.AppStatus,
        AppStatusHistory: app$.AppStatusHistory,
      },
      modal: {
        IsActive: modal$.IsActive,
      },
      userConfig: {
        Key: user$.Key,
        UserEmail: user$.UserEmail,
      },
      instance: {
        TenantInfo: instance$.TenantInfo,
        TestedTenantInfo: instance$.TestedTenantInfo,
        TestedServerVersion: instance$.TestedServerVersion,
        TestApiKeyError: instance$.TestApiKeyError,
        LastTestApiKeySuccess: instance$.LastTestApiKeySuccess,
      },
    },
  };
  return payload;
}

/**
 * Export all cached data to a JSON file
 */
const exportData = () => {
  const payload = buildBackupPayload();
  const jsonStr = JSON.stringify(payload);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  link.href = url;
  link.download = `nrg-frontline-lg-backup-${timestamp}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Trigger the file input dialog
 */
function triggerFileSelect() {
  fileInput.value?.click();
}

/**
 * Handle file selection
 */
function handleFileChange(ev: Event) {
  const target = ev.target as HTMLInputElement;
  const files = target.files;
  if (files && files.length > 0) {
    selectedFile.value = files[0];
  }
}

/**
 * Import backup data and restore all caches
 */
async function importData() {
  if (!selectedFile.value) {
    console.warn('[DataBackup] No file selected');
    return;
  }

  try {
    const fileContent = await selectedFile.value.text();
    const backup = JSON.parse(fileContent);

    if (backup.version < 1) {
      throw new Error(`Unsupported backup version: ${backup.version}`);
    }

    // Restore all caches
    if (backup.data.tenantInfo) {
      TenantInfoCache.save(backup.data.tenantInfo);
      instance$.TenantInfo = backup.data.tenantInfo;
    }

    // Restore Pinia stores
    const stores = backup.stores ?? backup.data?.stores;
    if (stores) {
      if (stores.userConfig) {
        user$.setKey(stores.userConfig.Key ?? "");
        user$.setUserEmail(stores.userConfig.UserEmail ?? "");
      }

      if (stores.instance) {
        instance$.TenantInfo = stores.instance.TenantInfo ?? null;
        instance$.TestedTenantInfo = stores.instance.TestedTenantInfo ?? null;
        instance$.TestedServerVersion = stores.instance.TestedServerVersion ?? null;
        instance$.TestApiKeyError = stores.instance.TestApiKeyError ?? null;
        instance$.LastTestApiKeySuccess = stores.instance.LastTestApiKeySuccess ?? null;
      }

      if (stores.app) {
        app$.ActiveFeature = stores.app.ActiveFeature ?? null;
        app$.AppStatus = stores.app.AppStatus ?? { status: 'idle', message: '' };
        app$.AppStatusHistory = stores.app.AppStatusHistory ?? [];
      }

      if (stores.modal) {
        modal$.IsActive = stores.modal.IsActive ?? false;
      }
    }

    console.log('[DataBackup] Successfully restored backup data');
    selectedFile.value = undefined;
    activeAction.value = null;

    // Clear file input
    if (fileInput.value) {
      fileInput.value.value = '';
    }
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Failed to import backup';
    console.error('[DataBackup] Import failed:', errorMsg);
  }
}

/**
 * Handle confirmed clear cache - execute the clear and navigate back
 */
const handleConfirmClear = async () => {
  app$.setAppStatus("loading", "Clearing all application cache...");

  // Clear all localStorage caches
  TenantInfoCache.clear();

  // Clear InstanceState
  instance$.TenantInfo = null;
  instance$.TestedTenantInfo = null;
  instance$.TestedServerVersion = null;
  instance$.TestApiKeyError = null;
  instance$.LastTestApiKeySuccess = null;

  // Clear UserConfigState
  user$.setKey("");
  user$.setUserEmail("");

  // Reset active feature
  app$.setActiveFeature(null);

  app$.setAppStatus("success", "All application cache and state cleared.");

  // Navigate back to data refresh page
  setTimeout(() => {
    router.push({ name: 'data-refresh' });
  }, 300);
}

onMounted(() => {
  serverVersion.value = instance$.TestedServerVersion ?? undefined;
});
</script>


<style scoped>
.page {
  display: grid;
  gap: 12px;
}

.summary {
  margin: 0;
  padding-left: 1.25rem;
}

.text-sm {
  font-size: 12px;
}

.hidden-input {
  position: absolute;
  opacity: 0;
  width: 1px;
  height: 1px;
  overflow: hidden;
  pointer-events: none;
}

.feature-button {
  min-width: 140px;
}

/*
.highlight-active :deep(.n-button__border),
.highlight-active :deep(.n-button__state-border) {
  border-color: var(--color-highlight-vibrant) !important;
}

.highlight-active :deep(.n-button__content) {
  color: var(--color-highlight-vibrant) !important;
} */

/* .highlight-active-2:is(:hover, :focus, :focus-visible, :active) :deep(.n-button) {
  background-color: var(--color-highlight-vibrant) !important;
}

.highlight-active-2:is(:hover, :focus, :focus-visible, :active) :deep(.n-button__border),
.highlight-active-2:is(:hover, :focus, :focus-visible, :active) :deep(.n-button__state-border) {
  border-color: var(--color-highlight-vibrant) !important;
}

.highlight-active-2:is(:hover, :focus, :focus-visible, :active) :deep(.n-button__content) {
  color: var(--color-highlight-vibrant) !important;
} */
</style>
