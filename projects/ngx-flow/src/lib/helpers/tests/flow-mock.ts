export class FlowMock {
  constructor(public opts: Partial<flowjs.FlowOptions>) {}
  flowJsEventEmitters = {};
  addEventListener = jasmine.createSpy().and.callFake((eventName: string, cb: () => void) => {
    this.flowJsEventEmitters[eventName] = cb;
  });
  removeEventListener = jasmine.createSpy().and.callFake((eventName: string) => {
    delete this.flowJsEventEmitters[eventName];
  });
  progress() {
    return 0;
  }
}
