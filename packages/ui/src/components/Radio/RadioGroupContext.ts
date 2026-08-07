'use client';

import { createContext, useContext } from 'react';
import type { ChangeEvent } from 'react';
import type { RadioSize } from './Radio.types';

/** What a RadioGroup provides to the Radios inside it. Internal. */
export interface RadioGroupContextValue {
  name: string;
  value: string | undefined;
  onSelect: (value: string, event: ChangeEvent<HTMLInputElement>) => void;
  disabled: boolean;
  size: RadioSize | undefined;
}

export const RadioGroupContext = createContext<RadioGroupContextValue | null>(null);

export function useRadioGroup(): RadioGroupContextValue | null {
  return useContext(RadioGroupContext);
}
