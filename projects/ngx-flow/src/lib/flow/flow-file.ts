export interface FlowFile {
  flowObj: any;
  file: File;
  name: string;
  relativePath: string;
  size: number;
  uniqueIdentifier: string;
  averageSpeed: number;
  currentSpeed: number;
  chunks: any;
  paused: boolean;
  error: boolean;

  progress(relative?: boolean): number;
  pause(): void;
  resume(): void;
  cancel(): void;
  retry(): void;
  bootstrap(): void;
  isUploading(): boolean;
  isComplete(): boolean;
  sizeUploaded(): number;
  timeRemaining(): number;
  getExtension(): string;
  getType(): string;
}
