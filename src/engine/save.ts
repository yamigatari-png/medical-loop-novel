import type { GameState } from "../types";

const SAVE_KEY = "medical_loop_novel_save";

export function saveGame(state: GameState) {
  localStorage.setItem(SAVE_KEY, JSON.stringify(state));
}

export function loadGame(): GameState | null {
  const raw = localStorage.getItem(SAVE_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as GameState;
  } catch {
    return null;
  }
}

export function clearSave() {
  localStorage.removeItem(SAVE_KEY);
}