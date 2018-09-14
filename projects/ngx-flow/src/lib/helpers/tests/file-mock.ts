import { Transfer } from '../../transfer';

export function trasnferMockFactory(): Transfer {
  return {
    flowFile: {
      pause: jasmine.createSpy(),
      cancel: jasmine.createSpy(),
      resume: jasmine.createSpy()
    }
  } as any;
}
