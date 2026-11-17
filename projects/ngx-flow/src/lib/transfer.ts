import type { FlowFile } from './flow-js';

export interface Transfer {
  id: string;
  name: string;
  flowFile: FlowFile;
  progress: number;
  error: boolean;
  errorMessage: string | null;
  paused: boolean;
  cancelled: boolean;
  success: boolean;
  complete: boolean;
  currentSpeed: number;
  averageSpeed: number;
  size: number;
  timeRemaining: number;
  streaming: boolean;
}
