import { FlowFile } from './flow-file';
import { FlowChunk } from './flow-chunk';

interface FlowEventMap {
  fileSuccess: FileSuccessCallbackArguments;
  fileProgress: FileProgressCallbackArguments;
  fileAdded: FilesAddedCallbackArguments;
  filesAdded: FileAddedCallbackArguments;
  filesSubmitted: FilesSubmittedCallbackArguments;
  fileRemoved: FileRemovedCallbackArguments;
  fileRetry: FileRetryCallbackArguments;
  fileError: FileErrorCallbackArguments;
  uploadStart: UploadStartCallbackArguments;
  complete: UploadStartCallbackArguments;
  progress: ProgressCallbackArguments;
  error: ErrorCallbackArguments;
  catchAll: CatchAllCallbackArguments;
}

export type EventName = keyof FlowEventMap;
export type FlowEvent = FlowEventMap[keyof FlowEventMap];

export type FlowEventFromEventName<T extends EventName> = FlowEventMap[T];
export type FlowEventTypeFromFlowEvent<T extends FlowEvent> = T extends FlowEventFromEventName<infer U> ? U : never;

export type FileSuccessCallbackArguments = [FlowFile, string, FlowChunk];
export type FileProgressCallbackArguments = [FlowFile, FlowChunk];
export type FileAddedCallbackArguments = [FlowFile, Event];
export type FilesAddedCallbackArguments = [FlowFile[], Event];
export type FilesSubmittedCallbackArguments = [FlowFile[], Event];
export type FileRemovedCallbackArguments = [FlowFile];
export type FileRetryCallbackArguments = [FlowFile, FlowChunk];
export type FileErrorCallbackArguments = [FlowFile, string, FlowChunk];
export type UploadStartCallbackArguments = null;
export type CompleteCallbackArguments = null;
export type ProgressCallbackArguments = null;
export type ErrorCallbackArguments = [string, FlowFile, FlowChunk];
export type CatchAllCallbackArguments = [Event];
