import { Transfer } from '../transfer';

export function flowFile2Transfer(flowFile: flowjs.FlowFile): Transfer {
  return {
    id: flowFile.uniqueIdentifier,
    name: flowFile.name,
    progress: flowFile.progress(),
    averageSpeed: flowFile.averageSpeed,
    currentSpeed: flowFile.currentSpeed,
    size: flowFile.size,
    paused: flowFile.paused,
    error: flowFile.error,
    complete: flowFile.isComplete(),
    success: flowFile.isComplete() && !flowFile.error,
    timeRemaining: flowFile.timeRemaining(),
    flowFile
  };
}
