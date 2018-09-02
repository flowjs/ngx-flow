import { Transfer } from './transfer';

export interface UploadState {
  totalProgress: number;
  transfers: Transfer[];
}
