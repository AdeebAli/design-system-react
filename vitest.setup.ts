import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';
import { resetWarnings } from './src/utils/warn';

afterEach(cleanup);
afterEach(resetWarnings);
