'use client';

import { useEffect, useLayoutEffect } from 'react';

/**
 * `useLayoutEffect` that falls back to `useEffect` during server rendering,
 * avoiding React's SSR warning. Library code must use this instead of bare
 * `useLayoutEffect`, always.
 */
export const useIsomorphicLayoutEffect =
  typeof document !== 'undefined' ? useLayoutEffect : useEffect;
