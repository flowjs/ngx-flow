import { Transfer } from './transfer';

export interface UploadState {
  transfers: Transfer[];
  totalProgress: number;
  flow: flowjs.Flow;
}
