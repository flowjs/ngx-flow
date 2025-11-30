import { Transfer } from '../../transfer';
import { flowFileMockFactory } from './flow-file-mock-factory';

export function transferMockFactory(filename: string): Transfer {
  return {
    flowFile: flowFileMockFactory(filename)
  } as Transfer;
}
