import { Directive, Input, Inject, OnInit } from '@angular/core';
import { Flow, FlowConstructor } from './flow/flow';
import { ReplaySubject, Subject, Observable, merge, fromEvent } from 'rxjs';
import { switchMap, map, startWith, shareReplay, tap } from 'rxjs/operators';
import { FlowFile } from './flow/flow-file';
import { Transfer } from './transfer';
import { UploadState } from './upload-state';
import { FlowOptions } from './flow/flow-options';
import { flowFile2Transfer } from './helpers/flow-file-to-transfer';
import { FlowInjectionToken } from './flow-injection-token';
import { FlowEvent, EventName, FilesSubmitted, FileRemoved, FileRetry, FileProgress, FileSuccess, FileError } from './flow/flow-events';

interface FlowChangeEvent<T extends FlowEvent | void> {
  type: T extends FlowEvent ? EventName : NgxFlowChangeEvent;
  event: T;
}

type NgxFlowChangeEvent = 'pauseOrResume';

@Directive({
  selector: '[flowConfig]',
  exportAs: 'flow'
})
export class FlowDirective {

  @Input()
  set flowConfig(options: FlowOptions) {
    this.flowJs = new this.flowConstructor(options);
    this.flow$.next(this.flowJs);
  }

  flowJs: Flow;

  flow$ = new ReplaySubject<Flow>(1);

  pauseOrResumeEvent$ = new Subject<void>();

  events$ = this.flow$.pipe(switchMap(flow => merge(this.flowEvents(flow), this.ngxFlowEvents())));

  transfers$ = this.events$.pipe(
    map(_ => this.flowJs.files),
    map((files: FlowFile[]) => ({
      transfers: files.map(flowFile => flowFile2Transfer(flowFile)),
      flow: this.flowJs,
      totalProgress: this.flowJs.progress()
    })),
    startWith({
      transfers: [],
      flow: null,
      totalProgress: 0
    } as UploadState),
    shareReplay(1)
  );

  somethingToUpload$ = this.transfers$.pipe(map(state => state.transfers.some(file => !file.success)));

  constructor(@Inject(FlowInjectionToken) private flowConstructor: FlowConstructor) { }

  flowEvents(flow: Flow): Observable<FlowChangeEvent<FlowEvent>> {
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

  ngxFlowEvents(): Observable<FlowChangeEvent<void>> {
    return this.pauseOrResumeEvent$.pipe(
      map(
        _ =>
          ({
            type: 'pauseOrResume'
          } as FlowChangeEvent<void>)
      )
    );
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

  private listenForEvent<T extends FlowEvent>(flow: Flow, eventName: EventName): Observable<FlowChangeEvent<T>> {
    return fromEvent<T>(flow, eventName).pipe(
      map(args => ({
        type: eventName,
        event: args
      }) as FlowChangeEvent<T>)
    );
  }
}
