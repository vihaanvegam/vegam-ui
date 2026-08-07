import '@testing-library/jest-dom/vitest';
import * as matchers from 'vitest-axe/matchers';
import { cleanup } from '@testing-library/react';
import { afterEach, expect } from 'vitest';

// Add vitest-axe matchers for accessibility testing
expect.extend(matchers);

// Vitest runs without injected globals, so Testing Library's automatic
// cleanup (which looks for a global afterEach) never registers — do it
// explicitly or every render leaks into the next test.
afterEach(cleanup);
