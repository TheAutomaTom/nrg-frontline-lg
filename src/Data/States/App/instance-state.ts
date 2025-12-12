import { defineStore } from "pinia";
import { ref } from "vue";
import { useUserConfigState } from "./user-config-state";
import { NrgClient } from "../../Clients/NrgClient";
import { TenantInfoCache } from "../../Caches/App/TenantInfoCache";
import { useAppState } from "./app-state";
import type { TenantDto } from "@/Core/Models/nrg-dtos/TenantDto";

export const useInstanceState = defineStore("InstanceState", () => {
  const config$ = useUserConfigState();
  const Nrg = new NrgClient();
  const app$ = useAppState();

  const TenantInfo = ref<TenantDto | null>(null);

  // For API key testing
  const TestedTenantInfo = ref<TenantDto | null>(null);
  const TestedServerVersion = ref<string | null>(null);
  const TestApiKeyError = ref<string | null>(null);
  const LastTestApiKeySuccess = ref<number | null>(null); // timestamp

  // Test API key by calling both endpoints
  const TestApiKey = async (key: string): Promise<void> => {
    app$.setAppStatus("loading", "Testing API key...");
    config$.setKey(key); // Save to user config and local storage
    TestedTenantInfo.value = null;
    TestedServerVersion.value = null;
    TestApiKeyError.value = null;
    try {
      const [tenantInfoResult, serverVersionResult] = await Promise.allSettled([
        Nrg.GetTenantInfo(key),
        Nrg.GetServerVersion(),
      ]);

      let success = true;
      if (tenantInfoResult.status === "fulfilled") {
        TestedTenantInfo.value = tenantInfoResult.value;
      } else {
        TestApiKeyError.value = `TenantInfo failed: ${tenantInfoResult.reason?.message || tenantInfoResult.reason}`;
        success = false;
      }

      if (serverVersionResult.status === "fulfilled") {
        TestedServerVersion.value = serverVersionResult.value.ServerVersion;
      } else {
        // Only set error if not already set by TenantInfo
        if (!TestApiKeyError.value) {
          TestApiKeyError.value = `ServerVersion failed: ${serverVersionResult.reason?.message || serverVersionResult.reason}`;
        }
        success = false;
      }

      if (success) {
        LastTestApiKeySuccess.value = Date.now();
        app$.setAppStatus(
          "success",
          `API key validated: ${TestedTenantInfo.value?.CompanyName || "Verified"}`,
        );
      } else {
        app$.setAppStatus(
          "error",
          `API key validation failed: ${TestApiKeyError.value || "Unknown error"}`,
        );
      }
    } catch (err) {
      app$.setAppStatus(
        "error",
        `API key test error: ${(err as Error)?.message || err}`,
      );
    }
  };

  // Load cached tenant info on store init
  const loadCachedTenantInfo = (): boolean => {
    const cached = TenantInfoCache.load();
    if (cached) {
      TenantInfo.value = cached;
      console.log("[InstanceState] Loaded cached tenant info on init");
      return true;
    }
    return false;
  };
  loadCachedTenantInfo();

  const LoadTenantInfo = async (): Promise<void> => {
    app$.setAppStatus("loading", "Loading tenant info...");
    const key = (config$.Key ?? "").trim();
    if (!key) {
      console.warn("[InstanceState] Cannot load tenant info without API key.");
      app$.setAppStatus("error", "Missing API key for tenant info.");
      return;
    }
    try {
      TenantInfo.value = await Nrg.GetTenantInfo(key);
      // Cache for offline access
      TenantInfoCache.save(TenantInfo.value);
      app$.setAppStatus("success", "Tenant info saved to cache.");
      console.log(
        "[InstanceState] Loaded tenant info:",
        TenantInfo.value?.CompanyName,
      );
      app$.setAppStatus(
        "success",
        `Tenant: ${TenantInfo.value?.CompanyName || "Loaded"}`,
      );
    } catch (err) {
      console.error("[InstanceState] Failed to load tenant info from API", err);
      // Fall back to cached data if API call fails
      if (!loadCachedTenantInfo()) {
        console.warn("[InstanceState] No cached tenant info available");
        app$.setAppStatus(
          "error",
          `Tenant info failed: ${(err as Error)?.message || err}`,
        );
      } else {
        console.log(
          "[InstanceState] Using cached tenant info due to API failure",
        );
        app$.setAppStatus("error", "API failed. Using cached tenant info.");
      }
    }
  };

  return {
    TenantInfo,
    LoadTenantInfo,
    TestedTenantInfo,
    TestedServerVersion,
    TestApiKeyError,
    TestApiKey,
    LastTestApiKeySuccess,
  };
});
