import type { HTMLAttributes } from 'react';

/**
 * The native div props, unchanged. Blanket is a purely presentational scrim —
 * dismissal wiring (e.g. `onClick`) is the composer's responsibility, the way
 * Modal wires its blanket click to `onClose`.
 */
export type BlanketProps = HTMLAttributes<HTMLDivElement>;
