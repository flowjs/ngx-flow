import { flowFile2Transfer } from './flow-file-to-transfer';
import { flowFileMockFactory } from './tests/flow-file-mock-factory';

describe('flowFile2Transfer', () => {
  it('should expose v3 file state and error details', () => {
    const flowFile = flowFileMockFactory('file.txt', {
      error: true,
      errorMessage: 'upload failed',
      cancelled: false,
      streaming: true,
      isComplete() {
        return true;
      },
      isSuccessful() {
        return false;
      },
      progress() {
        return 1;
      },
      timeRemaining() {
        return 0;
      },
    });

    expect(flowFile2Transfer(flowFile)).toEqual(
      jasmine.objectContaining({
        id: 'id',
        name: 'file.txt',
        error: true,
        errorMessage: 'upload failed',
        cancelled: false,
        complete: true,
        success: false,
        streaming: true,
      })
    );
  });

  it('should treat a successful file as successful only through isSuccessful()', () => {
    const flowFile = flowFileMockFactory('file.txt', {
      isComplete() {
        return true;
      },
      isSuccessful() {
        return true;
      },
      progress() {
        return 1;
      },
      timeRemaining() {
        return 0;
      },
    });

    expect(flowFile2Transfer(flowFile).success).toBeTrue();
  });
});
