import { FlowFile } from '../flow/flow-file';
import { Transfer } from '../transfer';

export function flowFile2Transfer(flowFile: FlowFile): Transfer {
  return {
    id: flowFile.uniqueIdentifier,
    name: flowFile.name,
    progress: flowFile.progress(),
    averageSpeed: flowFile.averageSpeed,
    currentSpeed: flowFile.currentSpeed,
    size: flowFile.size,
    paused: flowFile.paused,
    error: flowFile.error,
    success: flowFile.isComplete(),
    timeRemaining: flowFile.timeRemaining(),
    flowFile
  };
}
