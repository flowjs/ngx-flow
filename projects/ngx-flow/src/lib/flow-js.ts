export type MaybePromise<T> = T | Promise<T>;

export type FlowChunkState =
  | 'pending'
  | 'reading'
  | 'uploading'
  | 'success'
  | 'error'
  | 'cancelled';

export interface FlowHookContext {
  event: Event | null;
  flow: FlowInstance;
}

export type FlowHook<TArguments extends unknown[], TResult = void> =
  | ((...args: TArguments) => MaybePromise<TResult>)
  | ((...args: TArguments) => MaybePromise<TResult>)[];

export interface FlowHooks {
  filterFile?: FlowHook<[File, FlowHookContext], boolean | void>;
  fileAdded?: FlowHook<[FlowFile, FlowHookContext]>;
  filesAdded?: FlowHook<[FlowFile[], FlowHookContext]>;
  filesSubmitted?: FlowHook<[FlowFile[], FlowHookContext]>;
}

export interface FlowAddFileOptions {
  event?: Event | null;
  initFileFn?: FlowInitFileFn;
}

export type FlowInitFileFn = (
  file: FlowFile,
  context: FlowHookContext
) => MaybePromise<void>;

export type FlowReadFileFn = (
  file: FlowFile,
  startByte: number,
  endByte: number,
  fileType: string,
  chunk: FlowChunk,
  context: { signal: AbortSignal }
) => MaybePromise<Blob | ArrayBuffer | string | null | undefined>;

export type FlowChunkChecksumFn = (
  chunk: FlowChunk,
  payload: Blob | ArrayBuffer | string
) => MaybePromise<string>;

export type FlowOptionValue<T> =
  | T
  | ((file: FlowFile, chunk: FlowChunk, isTest: boolean) => T);

export interface FlowOptions {
  target?: FlowOptionValue<string>;
  chunkSize?: number | ((file: FlowFile) => number);
  forceChunkSize?: boolean;
  simultaneousUploads?: number;
  singleFile?: boolean;
  fileParameterName?: string;
  progressCallbacksInterval?: number;
  speedSmoothingFactor?: number;
  query?: FlowOptionValue<Record<string, unknown>>;
  headers?: FlowOptionValue<Record<string, string>>;
  withCredentials?: boolean;
  preprocess?: (chunk: FlowChunk) => MaybePromise<void>;
  changeRawDataBeforeSend?: (
    chunk: FlowChunk,
    data: BodyInit | null
  ) => MaybePromise<BodyInit | void>;
  method?: 'multipart' | 'octet';
  testMethod?: FlowOptionValue<string>;
  uploadMethod?: FlowOptionValue<string>;
  prioritizeFirstAndLastChunk?: boolean;
  allowDuplicateUploads?: boolean;
  testChunks?: boolean;
  generateUniqueIdentifier?: (file: File) => string;
  maxChunkRetries?: number;
  chunkRetryInterval?: number | null;
  chunkChecksum?: FlowChunkChecksumFn | null;
  allowShortStream?: boolean;
  streaming?: boolean;
  xhrTimeout?: number;
  permanentErrors?: number[];
  testNotFoundStatuses?: number[];
  successStatuses?: number[];
  onDropStopPropagation?: boolean;
  hooks?: FlowHooks;
  initFileFn?: FlowInitFileFn | null;
  readFileFn?: FlowReadFileFn;
}

export interface FlowChunk {
  flowObj: FlowInstance;
  fileObj: FlowFile;
  offset: number;
  state: FlowChunkState;
  startByte: number;
  endByte: number;
  chunkSize: number;
  payload: unknown;
  checksum: string | null;
  progress(): number;
  sizeUploaded(): number;
  status(): FlowChunkState;
  message(): string;
}

export interface FlowFile {
  flowObj: FlowInstance;
  file: File;
  name: string;
  relativePath: string;
  size: number;
  uniqueIdentifier: string;
  chunks: FlowChunk[];
  paused: boolean;
  cancelled: boolean;
  error: boolean;
  errorMessage: string | null;
  averageSpeed: number;
  currentSpeed: number;
  streaming: boolean;
  eof: boolean;
  pause(): Promise<void>;
  resume(): Promise<UploadSummary>;
  cancel(): Promise<void>;
  retry(): Promise<UploadSummary>;
  progress(): number;
  sizeUploaded(): number;
  timeRemaining(): number;
  isUploading(): boolean;
  isReading(): boolean;
  isComplete(): boolean;
  isSuccessful(): boolean;
  getExtension(): string;
  getType(): string | undefined;
}

export interface UploadSummaryFile {
  file: FlowFile;
  status: 'complete' | 'error' | 'pending';
  error: string | null;
  uploadedBytes: number;
}

export interface UploadSummary {
  status: 'complete' | 'cancelled' | 'error';
  files: UploadSummaryFile[];
  uploadedBytes: number;
  totalBytes: number;
  error?: unknown;
}

export interface FlowEventBase<TType extends string> {
  type: TType;
  flow: FlowInstance;
}

export interface FlowEventDetailMap {
  'upload-start': FlowEventBase<'upload-start'> & { files: FlowFile[] };
  'upload-resume': FlowEventBase<'upload-resume'> & { files: FlowFile[] };
  'file-progress': FlowEventBase<'file-progress'> & {
    file: FlowFile;
    chunk: FlowChunk;
    progress: number;
  };
  progress: FlowEventBase<'progress'> & {
    file: FlowFile;
    chunk: FlowChunk;
    progress: number;
  };
  'file-success': FlowEventBase<'file-success'> & {
    file: FlowFile;
    message: string;
    chunk: FlowChunk;
  };
  'file-error': FlowEventBase<'file-error'> & {
    file: FlowFile;
    message: string;
    chunk: FlowChunk;
  };
  error: FlowEventBase<'error'> & {
    message: string;
    file?: FlowFile;
    chunk?: FlowChunk;
    error?: unknown;
    hook?: string;
  };
  'file-retry': FlowEventBase<'file-retry'> & {
    file: FlowFile;
    chunk: FlowChunk;
  };
  'file-removed': FlowEventBase<'file-removed'> & { file: FlowFile };
  complete: FlowEventBase<'complete'> & {
    files: FlowFile[];
    summary: UploadSummary;
  };
  'catch-all': { type: string; hook: boolean; detail: unknown };
}

export type FlowEventName = keyof FlowEventDetailMap;

export type FlowEvent<TType extends FlowEventName> = CustomEvent<
  FlowEventDetailMap[TType]
>;

export interface FlowChangeEvent<TType extends FlowEventName> {
  type: TType;
  event: FlowEvent<TType>;
  detail: FlowEventDetailMap[TType];
}

export interface FlowInstance extends EventTarget {
  readonly opts: FlowOptions;
  files: FlowFile[];
  supportDirectory?: boolean;
  assignBrowse(
    domNodes: Element | Element[] | ArrayLike<Element>,
    isDirectory?: boolean,
    singleFile?: boolean,
    attributes?: Record<string, string>
  ): void;
  assignDrop(domNodes: Element | Element[] | ArrayLike<Element>): void;
  unAssignDrop(domNodes: Element | Element[] | ArrayLike<Element>): void;
  addFile(
    file: File,
    options?: FlowAddFileOptions
  ): Promise<FlowFile>;
  addFiles(
    files: FileList | File[],
    options?: FlowAddFileOptions
  ): Promise<FlowFile[]>;
  upload(): Promise<UploadSummary>;
  pause(): Promise<void>;
  resume(): Promise<UploadSummary>;
  cancel(): Promise<void>;
  removeFile(file: FlowFile): Promise<void>;
  getFromUniqueIdentifier(identifier: string): FlowFile | false;
  getSize(): number;
  sizeUploaded(): number;
  timeRemaining(): number;
  progress(): number;
  isUploading(): boolean;
}
