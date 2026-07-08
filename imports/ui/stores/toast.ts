import { writable } from 'svelte/store';

export interface ToastState {
  message: string;
  id: number;
}

export const toast = writable<ToastState | null>(null);

let counter = 0;

export function showToast(message: string): void {
  toast.set({ message, id: ++counter });
}

export function dismissToast(): void {
  toast.set(null);
}
