import { Transfer } from '../../transfer';
import { flowFileMockFactory } from './flow-file-mock-factory';

export function trasnferMockFactory(filename: string): Transfer {
  return {
    flowFile: flowFileMockFactory(filename)
  } as Transfer;
}
