import { FlowFile } from './flow-file';
import { FlowChunk } from './flow-chunk';

interface FlowEventMap {
  fileSuccess: FileSuccess;
  fileProgress: FileProgress;
  fileAdded: FileAdded;
  filesAdded: FilesAdded;
  filesSubmitted: FilesSubmitted;
  fileRemoved: FileRemoved;
  fileRetry: FileRetry;
  fileError: FileError;
  uploadStart: UploadStart;
  complete: Complete;
  progress: Progress;
  error: Error;
}

export type EventName = keyof FlowEventMap;
export type FlowEvent = FlowEventMap[keyof FlowEventMap];

export type FlowEventFromEventName<T extends EventName> = FlowEventMap[T];
export type FlowEventTypeFromFlowEvent<T extends FlowEvent> = T extends FlowEventFromEventName<infer U> ? U : never;

export type FileSuccess = [FlowFile, string, FlowChunk];
export type FileProgress = [FlowFile, FlowChunk];
export type FileAdded = [FlowFile, Event];
export type FilesAdded = [FlowFile[], Event];
export type FilesSubmitted = [FlowFile[], Event];
export type FileRemoved = [FlowFile];
export type FileRetry = [FlowFile, FlowChunk];
export type FileError = [FlowFile, string, FlowChunk];
export type UploadStart = null;
export type Complete = null;
export type Progress = null;
export type Error = [string, FlowFile, FlowChunk];
export type CatchAll = [Event];
