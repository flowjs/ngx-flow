import { Directive, Inject, Input, PLATFORM_ID } from '@angular/core';
import { fromEvent, merge, Observable, ReplaySubject, Subject } from 'rxjs';
import { map, shareReplay, startWith, switchMap } from 'rxjs/operators';
import { FlowInjectionToken } from './flow-injection-token';
import { flowFile2Transfer } from './helpers/flow-file-to-transfer';
import { Transfer } from './transfer';
import { UploadState } from './upload-state';
import { isPlatformBrowser } from '@angular/common';
import { FlowConstructor } from './flow-constructor';

export interface FlowChangeEvent<T extends flowjs.EventName> {
  type: T;
  event: flowjs.FlowEventFromEventName<T>;
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
  set flowConfig(options: flowjs.FlowOptions) {
    if (isPlatformBrowser(this.platform)) {
      this.flowJs = new this.flowConstructor(options);
      this.flow$.next(this.flowJs);
    }
  }

  flowJs: flowjs.Flow;

  protected flow$ = new ReplaySubject<flowjs.Flow>(1);

  pauseOrResumeEvent$ = new Subject<void>();

  events$ = this.flow$.pipe(switchMap(flow => merge(this.flowEvents(flow), this.ngxFlowEvents())));

  transfers$: Observable<UploadState> = this.events$.pipe(
    map(_ => this.flowJs.files),
    map((files: flowjs.FlowFile[] = []) => ({
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

  private flowEvents(flow: flowjs.Flow): Observable<FlowChangeEvent<flowjs.EventName>> {
    const events = [
      this.listenForEvent(flow, 'fileSuccess'),
      this.listenForEvent(flow, 'fileProgress'),
      this.listenForEvent(flow, 'fileAdded'),
      this.listenForEvent(flow, 'filesAdded'),
      this.listenForEvent(flow, 'filesSubmitted'),
      this.listenForEvent(flow, 'fileRemoved'),
      this.listenForEvent(flow, 'fileRetry'),
      this.listenForEvent(flow, 'fileError'),
      this.listenForEvent(flow, 'uploadStart'),
      this.listenForEvent(flow, 'complete'),
      this.listenForEvent(flow, 'progress')
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

  protected listenForEvent<T extends flowjs.EventName>(
    flow: flowjs.Flow,
    eventName: T
  ): Observable<{ type: T; event: flowjs.FlowEventFromEventName<T> }> {
    return fromEvent<flowjs.FlowEventFromEventName<T>>(flow, eventName).pipe(
      map(args => ({
        type: eventName,
        event: args
      }))
    );
  }
}
