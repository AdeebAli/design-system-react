import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';
import './src/styles';
import { resetWarnings } from './src/utils/warn';

afterEach(cleanup);
afterEach(resetWarnings);
