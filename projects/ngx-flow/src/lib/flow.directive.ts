import { isPlatformBrowser } from '@angular/common';
import { Directive, inject, Input, OnDestroy, PLATFORM_ID } from '@angular/core';
import { fromEvent, merge, Observable, ReplaySubject, Subject } from 'rxjs';
import { map, shareReplay, startWith, switchMap } from 'rxjs/operators';
import { FlowInjectionToken } from './flow-injection-token';
import type {
  FlowChangeEvent,
  FlowEvent,
  FlowEventDetailMap,
  FlowEventName,
  FlowFile,
  FlowInstance,
  FlowOptions,
  UploadSummary,
} from './flow-js';
import { flowFile2Transfer } from './helpers/flow-file-to-transfer';
import { Transfer } from './transfer';
import { UploadState } from './upload-state';

export interface NgxFlowEvent {
  type: 'pauseOrResume' | 'newFlowJsInstance';
}

const FLOW_EVENTS = [
  'upload-start',
  'upload-resume',
  'file-progress',
  'progress',
  'file-success',
  'file-error',
  'error',
  'file-retry',
  'file-removed',
  'complete',
] as const satisfies readonly FlowEventName[];

@Directive({
  selector: '[flowConfig]',
  exportAs: 'flow',
})
export class FlowConfig implements OnDestroy {
  protected flowConstructor = inject(FlowInjectionToken);
  protected platform = inject(PLATFORM_ID);

  @Input()
  set flowConfig(options: FlowOptions) {
    if (isPlatformBrowser(this.platform)) {
      this.flowJs = new this.flowConstructor(options);
      this.flow$.next(this.flowJs);
    }
  }

  flowJs!: FlowInstance;

  protected flow$ = new ReplaySubject<FlowInstance>(1);

  pauseOrResumeEvent$ = new Subject<void>();

  events$: Observable<
    FlowChangeEvent<FlowEventName> | NgxFlowEvent
  > = this.flow$.pipe(
    switchMap((flow) => merge(this.flowEvents(flow), this.ngxFlowEvents()))
  );

  transfers$: Observable<UploadState> = this.events$.pipe(
    map(() => this.flowJs.files),
    map((files: FlowFile[] = []) => ({
      transfers: files.map((flowFile) => flowFile2Transfer(flowFile)),
      flow: this.flowJs,
      totalProgress: this.flowJs.progress(),
    })),
    shareReplay(1)
  );

  somethingToUpload$ = this.transfers$.pipe(
    map((state) => state.transfers.some((file) => !file.success)),
    startWith(false)
  );

  ngOnDestroy(): void {
    this.flow$.complete();
    this.pauseOrResumeEvent$.complete();
  }

  upload(): Promise<UploadSummary> {
    return this.flowJs.upload();
  }

  cancel(): Promise<void> {
    return this.flowJs.cancel();
  }

  cancelFile(file: Transfer): Promise<void> {
    return file.flowFile.cancel();
  }

  async pauseFile(file: Transfer): Promise<void> {
    await file.flowFile.pause();
    this.pauseOrResumeEvent$.next();
  }

  resumeFile(file: Transfer): void {
    void file.flowFile.resume().catch(() => undefined);
    this.pauseOrResumeEvent$.next();
  }

  protected flowEvents(
    flow: FlowInstance
  ): Observable<FlowChangeEvent<FlowEventName>> {
    const events = FLOW_EVENTS.map((eventName) =>
      this.listenForEvent(flow, eventName)
    );
    return merge(...events);
  }

  protected ngxFlowEvents(): Observable<NgxFlowEvent> {
    const pauseOrResumeEvent$ = this.pauseOrResumeEvent$.pipe(
      map(
        () =>
          ({
            type: 'pauseOrResume',
          }) as NgxFlowEvent
      )
    );
    const newFlowInstanceEvent$ = this.flow$.pipe(
      map(
        () =>
          ({
            type: 'newFlowJsInstance',
          }) as NgxFlowEvent
      )
    );
    return merge(pauseOrResumeEvent$, newFlowInstanceEvent$);
  }

  protected listenForEvent<TType extends FlowEventName>(
    flow: FlowInstance,
    eventName: TType
  ): Observable<FlowChangeEvent<TType>> {
    return fromEvent(flow, eventName).pipe(
      map((event) => {
        const flowEvent = event as FlowEvent<TType>;
        return {
          type: eventName,
          event: flowEvent,
          detail: flowEvent.detail as FlowEventDetailMap[TType],
        };
      })
    );
  }
}
