import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// Vitest runs without injected globals, so Testing Library's automatic
// cleanup (which looks for a global afterEach) never registers — do it
// explicitly or every render leaks into the next test.
afterEach(cleanup);
