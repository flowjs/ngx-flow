import type { FlowFile } from '../../flow-js';

export function flowFileMockFactory(
  filename: string,
  overrides?: Partial<FlowFile>
): FlowFile {
  const mocks = {
    flowObj: null as any,
    file: {
      name: filename,
      lastModified: 0,
    } as File,
    name: filename,
    relativePath: filename,
    size: 12345,
    uniqueIdentifier: 'id',
    averageSpeed: 0,
    currentSpeed: 0,
    chunks: [],
    paused: false,
    cancelled: false,
    error: false,
    errorMessage: null,
    streaming: false,
    eof: false,
    progress: jasmine.createSpy(),
    pause: jasmine.createSpy(),
    resume: jasmine.createSpy(),
    cancel: jasmine.createSpy(),
    retry: jasmine.createSpy(),
    sizeUploaded: jasmine.createSpy(),
    timeRemaining: jasmine.createSpy(),
    isUploading: jasmine.createSpy(),
    isReading: jasmine.createSpy(),
    isComplete: jasmine.createSpy(),
    isSuccessful: jasmine.createSpy(),
    getExtension: jasmine.createSpy(),
    getType: jasmine.createSpy(),
  } as unknown as FlowFile;
  return Object.assign({}, mocks, overrides);
}
