import type { FlowFile } from '../flow-js';
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
    cancelled: flowFile.cancelled,
    error: flowFile.error,
    errorMessage: flowFile.errorMessage,
    complete: flowFile.isComplete(),
    success: flowFile.isSuccessful(),
    streaming: flowFile.streaming,
    timeRemaining: flowFile.timeRemaining(),
    flowFile
  };
}
