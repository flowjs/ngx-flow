import { FlowFile } from './flow-file';
import { FlowChunk } from './flow-chunk';

export type EventName =
  | 'fileSuccess'
  | 'fileProgress'
  | 'fileAdded'
  | 'filesAdded'
  | 'filesSubmitted'
  | 'fileRemoved'
  | 'fileRetry'
  | 'fileError'
  | 'uploadStart'
  | 'complete'
  | 'progress'
  | 'error';

export type FlowEvent =
  | FileSuccess
  | FileProgress
  | FileAdded
  | FilesAdded
  | FilesSubmitted
  | FileRemoved
  | FileRetry
  | FileError
  | UploadStart
  | Complete
  | Progress
  | Error;

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
