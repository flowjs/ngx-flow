export type FlowEvent = AddEvent | ProgressEvent | SuccessEvent | ErrorEvent;

export interface AddEvent {
  event: 'add';
  file: string;
}

export interface ProgressEvent {
  event: 'progress';
  file: string;
  value: number;
}

export interface SuccessEvent {
  event: 'success';
  file: string;
}

export interface ErrorEvent {
  event: 'error';
  file: string;
  message: string;
}
