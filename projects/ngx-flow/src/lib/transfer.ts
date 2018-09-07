import { FlowFile } from './flow/flow-file';

export interface Transfer {
  name: string;
  flowFile: FlowFile;
  progress: number;
  error: boolean;
  paused: boolean;
  success: boolean;
  currentSpeed: number;
  averageSpeed: number;
  size: number;
  timeRemaining: number;
}
