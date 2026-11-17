import type {
  FlowEventDetailMap,
  FlowEventName,
  FlowFile,
  FlowOptions,
} from '../../flow-js';

type FlowEventEmitter = (event: Event) => void;

export class FlowMock {
  constructor(public opts: FlowOptions) {}

  files: FlowFile[] = [];

  flowJsEventEmitters: Record<string, FlowEventEmitter> = {};

  addEventListener = jasmine
    .createSpy('addEventListener')
    .and.callFake((eventName: string, callback: FlowEventEmitter) => {
      this.flowJsEventEmitters[eventName] = callback;
    });

  removeEventListener = jasmine
    .createSpy('removeEventListener')
    .and.callFake((eventName: string) => {
      delete this.flowJsEventEmitters[eventName];
    });

  emit<TType extends FlowEventName>(
    eventName: TType,
    detail: Omit<FlowEventDetailMap[TType], 'type' | 'flow'>
  ): void {
    const eventDetail = {
      type: eventName,
      flow: this,
      ...detail,
    } as unknown as FlowEventDetailMap[TType];
    this.flowJsEventEmitters[eventName]?.(
      new CustomEvent(eventName, { detail: eventDetail })
    );
  }

  progress() {
    return 0;
  }
}
