/**
 * Chrome Storage Helpers — wraps chrome.storage.local so that
 * core/ and assistant/ modules never call chrome.* directly.
 *
 * This keeps the UI/logic layers portable for a potential Firefox port.
 */

import type { AvatarPosition, StorageData, AvatarStyle } from "@/types";

const STORAGE_KEYS = {
  AVATAR_POSITION: "avatarPosition",
  ASSISTANT_ENABLED: "assistantEnabled",
  AVATAR_STYLE: "avatarStyle",
  AVATAR_IMAGE: "avatarImage",
  AVATAR_SIZE: "avatarSize",
} as const;

/** Read the avatar position from storage, or return null if unset. */
export async function getAvatarPosition(): Promise<AvatarPosition | null> {
  try {
    const result = await chrome.storage.local.get(STORAGE_KEYS.AVATAR_POSITION);
    return (result[STORAGE_KEYS.AVATAR_POSITION] as AvatarPosition) || null;
  } catch {
    return null;
  }
}

/** Save the avatar position to storage. */
export async function setAvatarPosition(position: AvatarPosition): Promise<void> {
  try {
    await chrome.storage.local.set({ [STORAGE_KEYS.AVATAR_POSITION]: position });
  } catch {
    // Silently fail if storage is unavailable (e.g., disconnected context)
  }
}

/** Check if the assistant is enabled. */
export async function isAssistantEnabled(): Promise<boolean> {
  try {
    const result = await chrome.storage.local.get(STORAGE_KEYS.ASSISTANT_ENABLED);
    return result[STORAGE_KEYS.ASSISTANT_ENABLED] !== false; // Default true
  } catch {
    return true;
  }
}

/** Set the assistant enabled/disabled state. */
export async function setAssistantEnabled(enabled: boolean): Promise<void> {
  try {
    await chrome.storage.local.set({ [STORAGE_KEYS.ASSISTANT_ENABLED]: enabled });
  } catch {
    // Silently fail
  }
}

export async function getAvatarPrefs(): Promise<{ style: AvatarStyle, image: string | null, size: number }> {
  try {
    const result = await chrome.storage.local.get([
      STORAGE_KEYS.AVATAR_STYLE,
      STORAGE_KEYS.AVATAR_IMAGE,
      STORAGE_KEYS.AVATAR_SIZE
    ]);
    return {
      style: (result[STORAGE_KEYS.AVATAR_STYLE] as AvatarStyle) ?? "classic",
      image: (result[STORAGE_KEYS.AVATAR_IMAGE] as string) ?? null,
      size: (result[STORAGE_KEYS.AVATAR_SIZE] as number) ?? 52,
    };
  } catch {
    return { style: "classic", image: null, size: 52 };
  }
}

export async function setAvatarStyle(style: AvatarStyle): Promise<void> {
  try {
    await chrome.storage.local.set({ [STORAGE_KEYS.AVATAR_STYLE]: style });
  } catch {
    // Silently fail
  }
}

/** Listen for changes to storage keys. */
export function onStorageChange(
  callback: (changes: Partial<StorageData>) => void,
): () => void {
  const listener = (
    changes: { [key: string]: chrome.storage.StorageChange },
    areaName: string,
  ) => {
    if (areaName !== "local") return;
    const mapped: Partial<StorageData> = {};
    if (changes[STORAGE_KEYS.ASSISTANT_ENABLED]) {
      mapped.assistantEnabled = changes[STORAGE_KEYS.ASSISTANT_ENABLED]
        .newValue as boolean;
    }
    if (changes[STORAGE_KEYS.AVATAR_POSITION]) {
      mapped.avatarPosition = changes[STORAGE_KEYS.AVATAR_POSITION]
        .newValue as AvatarPosition;
    }
    if (changes[STORAGE_KEYS.AVATAR_STYLE]) {
      mapped.avatarStyle = changes[STORAGE_KEYS.AVATAR_STYLE]
        .newValue as AvatarStyle;
    }
    if (changes[STORAGE_KEYS.AVATAR_IMAGE]) {
      mapped.avatarImage = changes[STORAGE_KEYS.AVATAR_IMAGE]
        .newValue as string | null;
    }
    if (changes[STORAGE_KEYS.AVATAR_SIZE]) {
      mapped.avatarSize = changes[STORAGE_KEYS.AVATAR_SIZE]
        .newValue as number;
    }
    callback(mapped);
  };
  chrome.storage.onChanged.addListener(listener);
  return () => chrome.storage.onChanged.removeListener(listener);
}
