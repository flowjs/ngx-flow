import { Directive, Inject, Input, PLATFORM_ID } from '@angular/core';
import { fromEvent, merge, Observable, ReplaySubject, Subject } from 'rxjs';
import { map, shareReplay, startWith, switchMap } from 'rxjs/operators';
import { FlowInjectionToken } from './flow-injection-token';
import { Flow, FlowConstructor } from './flow/flow';
import {
  EventName,
  FileError,
  FileProgress,
  FileRemoved,
  FileRetry,
  FilesSubmitted,
  FileSuccess,
  FlowEvent
} from './flow/flow-events';
import { FlowFile } from './flow/flow-file';
import { FlowOptions } from './flow/flow-options';
import { flowFile2Transfer } from './helpers/flow-file-to-transfer';
import { Transfer } from './transfer';
import { UploadState } from './upload-state';
import { isPlatformBrowser } from '@angular/common';

interface FlowChangeEvent<T extends FlowEvent | void> {
  type: T extends FlowEvent ? EventName : NgxFlowChangeEvent;
  event: T;
}

type NgxFlowChangeEvent = 'pauseOrResume' | 'newFlowJsInstance';

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

  private flowEvents(flow: Flow): Observable<FlowChangeEvent<FlowEvent>> {
    const events = [
      this.listenForEvent<FilesSubmitted>(flow, 'filesSubmitted'),
      this.listenForEvent<FileRemoved>(flow, 'fileRemoved'),
      this.listenForEvent<FileRetry>(flow, 'fileRetry'),
      this.listenForEvent<FileProgress>(flow, 'fileProgress'),
      this.listenForEvent<FileSuccess>(flow, 'fileSuccess'),
      this.listenForEvent<FileError>(flow, 'fileError')
    ];
    return merge(...events);
  }

  private ngxFlowEvents(): Observable<FlowChangeEvent<void>> {
    const pauseOrResumeEvent$ = this.pauseOrResumeEvent$.pipe(
      map(
        _ =>
          ({
            type: 'pauseOrResume'
          } as FlowChangeEvent<void>)
      )
    );
    const newFlowInstanceEvent$ = this.flow$.pipe(
      map(
        _ =>
          ({
            type: 'newFlowJsInstance'
          } as FlowChangeEvent<void>)
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

  protected listenForEvent<T extends FlowEvent>(flow: Flow, eventName: EventName): Observable<FlowChangeEvent<T>> {
    return fromEvent<T>(flow, eventName).pipe(
      map(
        args =>
          ({
            type: eventName,
            event: args
          } as FlowChangeEvent<T>)
      )
    );
  }
}
