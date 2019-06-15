export interface Transfer {
  id: string;
  name: string;
  flowFile: flowjs.FlowFile;
  progress: number;
  error: boolean;
  paused: boolean;
  success: boolean;
  complete: boolean;
  currentSpeed: number;
  averageSpeed: number;
  size: number;
  timeRemaining: number;
}
