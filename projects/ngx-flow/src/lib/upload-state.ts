import type { FlowInstance } from './flow-js';
import { Transfer } from './transfer';

export interface UploadState {
  transfers: Transfer[];
  totalProgress: number;
  flow: FlowInstance;
}
