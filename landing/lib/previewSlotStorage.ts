const STORAGE_KEY = 'ladderless_preview_slot';

export function readPreviewSlot(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return sessionStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

export function writePreviewSlot(slot: string | null): void {
  if (typeof window === 'undefined') return;
  try {
    if (slot) sessionStorage.setItem(STORAGE_KEY, slot);
    else sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore quota / private mode
  }
}