import { FlowOptions } from './flow-options';
import { FlowFile } from './flow-file';
import { EventName } from './flow-events';

export interface FlowConstructor {
  new (flowOptions: FlowOptions): Flow;
}

export interface Flow {
  support: boolean;
  supportDirectory: boolean;
  opts: FlowOptions;
  files: FlowFile[];

  assignBrowse(
    node: HTMLElement | HTMLElement[],
    isDirectory?: boolean,
    singleFile?: boolean,
    attributes?: object
  ): void;
  assignDrop(node: HTMLElement | HTMLElement[]): void;
  unAssignDrop(node: HTMLElement | HTMLElement[]): void;
  on(event: EventName, callback: Function): void;
  off(event?: EventName, callback?: Function): void;
  upload(): void;
  pause(): void;
  resume(): void;
  cancel(): void;
  progress(): number;
  isUploading(): boolean;
  addFile(file: File): void;
  removeFile(file: FlowFile): void;
  getFromUniqueIdentifier(uniqueIdentifier: string): FlowFile;
  getSize(): number;
  sizeUploaded(): number;
  timeRemaining(): number;
}
