import { Transfer } from './transfer';
import { Flow } from './flow/flow';

export interface UploadState {
  transfers: Transfer[];
  totalProgress: number;
  flow: Flow;
}
