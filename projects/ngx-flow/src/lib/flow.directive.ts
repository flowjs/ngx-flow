import { Directive, Inject, Input, PLATFORM_ID } from '@angular/core';
import { fromEvent, merge, Observable, ReplaySubject, Subject } from 'rxjs';
import { map, shareReplay, startWith, switchMap } from 'rxjs/operators';
import { FlowInjectionToken } from './flow-injection-token';
import { Flow, FlowConstructor } from './flow/flow';
import { EventName, FlowEvent, FlowEventFromEventName } from './flow/flow-events';
import { FlowFile } from './flow/flow-file';
import { FlowOptions } from './flow/flow-options';
import { flowFile2Transfer } from './helpers/flow-file-to-transfer';
import { Transfer } from './transfer';
import { UploadState } from './upload-state';
import { isPlatformBrowser } from '@angular/common';

export interface FlowChangeEvent<T extends EventName> {
  type: T;
  event: FlowEventFromEventName<T>;
}

interface NgxFlowEvent {
  type: 'pauseOrResume' | 'newFlowJsInstance';
}

@Directive({
  selector: '[flowConfig]',
  exportAs: 'flow'
})
export class FlowDirective {
  @Input()
  set flowConfig(options: FlowOptions) {
    if (isPlatformBrowser(this.platform)) {
      this.flowJs = new this.flowConstructor(options);
      this.flow$.next(this.flowJs);
    }
  }

  flowJs: Flow;

  protected flow$ = new ReplaySubject<Flow>(1);

  pauseOrResumeEvent$ = new Subject<void>();

  events$ = this.flow$.pipe(switchMap(flow => merge(this.flowEvents(flow), this.ngxFlowEvents())));

  transfers$: Observable<UploadState> = this.events$.pipe(
    map(_ => this.flowJs.files),
    map((files: FlowFile[] = []) => ({
      transfers: files.map(flowFile => flowFile2Transfer(flowFile)),
      flow: this.flowJs,
      totalProgress: this.flowJs.progress()
    })),
    shareReplay(1)
  );

  somethingToUpload$ = this.transfers$.pipe(
    map(state => state.transfers.some(file => !file.success), startWith(false))
  );

  constructor(
    @Inject(FlowInjectionToken) protected flowConstructor: FlowConstructor,
    @Inject(PLATFORM_ID) protected platform: any
  ) {}

  private flowEvents(flow: Flow): Observable<FlowChangeEvent<EventName>> {
    const events = [
      this.listenForEvent(flow, 'filesSubmitted'),
      this.listenForEvent(flow, 'fileRemoved'),
      this.listenForEvent(flow, 'fileRetry'),
      this.listenForEvent(flow, 'fileProgress'),
      this.listenForEvent(flow, 'fileSuccess'),
      this.listenForEvent(flow, 'fileError')
    ];
    return merge(...events);
  }

  private ngxFlowEvents(): Observable<NgxFlowEvent> {
    const pauseOrResumeEvent$ = this.pauseOrResumeEvent$.pipe(
      map(
        _ =>
          ({
            type: 'pauseOrResume'
          } as NgxFlowEvent)
      )
    );
    const newFlowInstanceEvent$ = this.flow$.pipe(
      map(
        _ =>
          ({
            type: 'newFlowJsInstance'
          } as NgxFlowEvent)
      )
    );
    const events = [pauseOrResumeEvent$, newFlowInstanceEvent$];
    return merge(...events);
  }

  upload(): void {
    this.flowJs.upload();
  }

  cancel(): void {
    this.flowJs.cancel();
  }

  cancelFile(file: Transfer): void {
    file.flowFile.cancel();
  }

  pauseFile(file: Transfer): void {
    file.flowFile.pause();
    this.pauseOrResumeEvent$.next();
  }

  resumeFile(file: Transfer): void {
    file.flowFile.resume();
    this.pauseOrResumeEvent$.next();
  }

  protected listenForEvent<T extends EventName>(
    flow: Flow,
    eventName: T
  ): Observable<{ type: T; event: FlowEventFromEventName<T> }> {
    return fromEvent<FlowEventFromEventName<T>>(flow, eventName).pipe(
      map(args => ({
        type: eventName,
        event: args
      }))
    );
  }
}
