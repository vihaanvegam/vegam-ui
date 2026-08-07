'use client';

import { createContext, useContext } from 'react';
import type { ToastApi } from './Toast.types';

export const ToastContext = createContext<ToastApi | null>(null);

/**
 * The toast queue for the nearest {@link ToastProvider}.
 *
 * Deliberately a hook rather than an importable `toast()` singleton: module
 * state would give a dual-package (ESM + CJS) consumer TWO queues, one of
 * which renders nothing. Same reasoning as theme state living in CSS
 * (DECISIONS 2026-07-29). Throws when no provider is mounted — a silent
 * no-op would look like a broken feature.
 */
export function useToast(): ToastApi {
  const api = useContext(ToastContext);
  if (!api) {
    throw new Error('useToast must be used inside a <ToastProvider>.');
  }
  return api;
}
