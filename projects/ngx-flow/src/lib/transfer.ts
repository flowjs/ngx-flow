import { FlowFile } from './flow/flow-file';

export interface Transfer {
  name: string;
  flowFile: FlowFile;
  progress: number;
}
