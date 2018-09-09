import { FlowFile } from './flow-file';
import { FlowChunk } from './flow-chunk';

export interface FlowOptions {
  target: string;
  singleFile: boolean;
  chunkSize: number;
  forceChunkSize: boolean;
  simultaneousUploads: number;
  fileParameterName: 'file' | string;
  query: object | ((flowFile: FlowFile, chunk: FlowChunk, isTest: boolean) => object);
  headers: object | ((flowFile: FlowFile, chunk: FlowChunk, isTest: boolean) => object);
  withCredentials: boolean;
  method: 'multipart' | string;
  testMethod: 'GET' | ((flowFile: FlowFile, chunk: FlowChunk) => string);
  uploadMethod: 'POST' | ((flowFile: FlowFile, chunk: FlowChunk) => string);
  allowDuplicateUploads: boolean;
  prioritizeFirstAndLastChunk: boolean;
  testChunks: boolean;
  preprocess: (chunk: FlowChunk) => void;
  initFileFn: (flowFile: FlowFile, chunk: FlowChunk) => void;
  readFileFn: (flowFile: FlowFile, startByte: any, endByte: any, fileType: any, chunk: FlowChunk) => void;
  generateUniqueIdentifier: (flowFile: FlowFile) => string;
  maxChunkRetries: number;
  chunkRetryInterval: number | undefined;
  progressCallbacksInterval: number;
  speedSmoothingFactor: number;
  successStatuses: number[];
  permanentErrors: number[];
}
