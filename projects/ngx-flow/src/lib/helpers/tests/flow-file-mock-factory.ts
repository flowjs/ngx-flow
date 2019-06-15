export function flowFileMockFactory(filename: string, overrides?: Partial<flowjs.FlowFile>): flowjs.FlowFile {
  const mocks = {
    flowObj: null as any,
    file: {
      name: filename,
      lastModified: 0
    } as File,
    name: filename,
    relativePath: filename,
    size: 12345,
    uniqueIdentifier: 'id',
    averageSpeed: 0,
    currentSpeed: 0,
    chunks: [],
    paused: false,
    error: null,
    progress: jasmine.createSpy(),
    pause: jasmine.createSpy(),
    resume: jasmine.createSpy(),
    cancel: jasmine.createSpy(),
    retry: jasmine.createSpy(),
    bootstrap: jasmine.createSpy(),
    isUploading: jasmine.createSpy(),
    isComplete: jasmine.createSpy(),
    sizeUploaded: jasmine.createSpy(),
    timeRemaining: jasmine.createSpy(),
    getExtension: jasmine.createSpy(),
    getType: jasmine.createSpy()
  } as flowjs.FlowFile;
  return Object.assign({}, mocks, overrides);
}
