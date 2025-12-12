import { ref } from "vue";
import { defineStore } from "pinia";
import { ApiKeyStore } from "@/Data/Caches/App/ApiKeyStore";

const USER_EMAIL_STORAGE_KEY = "nrg-frontline.userEmail";

export const useUserConfigState = defineStore("userConfigState", () => {
  const Key = ref("" as string);
  const UserEmail = ref("" as string);

  function setKey(newKey: string) {
    Key.value = newKey;
    ApiKeyStore.save(newKey);
  }

  function setUserEmail(newEmail: string) {
    UserEmail.value = newEmail;
    try {
      if (newEmail && newEmail.trim().length > 0) {
        localStorage.setItem(USER_EMAIL_STORAGE_KEY, newEmail.trim());
      } else {
        localStorage.removeItem(USER_EMAIL_STORAGE_KEY);
      }
    } catch (error) {
      console.warn("[user-config-state] Failed to persist user email", error);
    }
  }

  try {
    const storedEmail = localStorage.getItem(USER_EMAIL_STORAGE_KEY);
    if (storedEmail) {
      UserEmail.value = storedEmail;
    }
  } catch (error) {
    console.warn(
      "[user-config-state] Failed to load user email from storage",
      error,
    );
  }

  // Load key from cache on store initialization
  const storedKey = ApiKeyStore.load();
  if (storedKey) {
    Key.value = storedKey;
  } else if (import.meta.env.DEV && import.meta.env.VITE_NRG_API_KEY) {
    Key.value = import.meta.env.VITE_NRG_API_KEY as string;
  }

  const IsValid = (): boolean => {
    return !!Key.value && Key.value.length > 0;
  };

  return {
    Key,
    setKey,
    UserEmail,
    setUserEmail,
    IsValidInput: IsValid,
  };
});
