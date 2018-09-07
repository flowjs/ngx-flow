import { Directive, ElementRef, Input } from '@angular/core';
import * as FlowJs from '@flowjs/flow.js';
import { fromEvent, ReplaySubject, merge, Observable, Subject } from 'rxjs';
import { switchMap, map, scan, startWith, shareReplay, tap } from 'rxjs/operators';
import { UploadState } from './upload-state';
import { FileAdded, FileProgress, FileSuccess, FileError, FlowEvent, FileRemoved, EventName } from './flow/flow-events';
import { Flow } from './flow/flow';
import { FlowFile } from './flow/flow-file';
import { Transfer } from './transfer';

interface FlowChangeEvent<T extends FlowEvent | void> {
  type: T extends FlowEvent ? EventName : NgxFlowChangeEvent;
  event: T;
}

type NgxFlowChangeEvent = 'pauseOrResume';
type ListenedEvents = FileProgress | FileSuccess | FileError;
type FileManipulationEvents = FileAdded | FileRemoved;

function flowFile2Transfer(flowFile: FlowFile): Transfer {
  return {
    name: flowFile.name,
    progress: flowFile.progress(),
    averageSpeed: flowFile.averageSpeed,
    currentSpeed: flowFile.currentSpeed,
    size: flowFile.size,
    paused: flowFile.paused,
    error: flowFile.error,
    timeRemaining: flowFile.timeRemaining(),
    flowFile
  };
}

@Directive({
  selector: '[flowButton]',
  exportAs: 'flowButton'
})
export class ButtonDirective {
  flow: Flow;

  flow$ = new ReplaySubject<Flow>(1);

  pauseOrResumeEvent$ = new Subject<void>();

  transfers$: Observable<UploadState> = this.flow$.pipe(
    switchMap(flow => {
      return merge(this.flowChangeEvents(flow), this.fileManipulationEvents(flow), this.ngxFlowEvents());
    }),
    scan<FlowChangeEvent<FileManipulationEvents>, FlowFile[]>(
      (files, { type, event }) => {
        let file;
        switch (type) {
          case 'fileAdded':
            file = event[0];
            if (this.singleFileOnly) {
              files = [file];
            } else {
              files.push(file);
            }
            return files;
          case 'fileRemoved':
            file = event;
            return files.filter(item => item !== file);
          default:
            return files;
        }
      },
      [] as FlowFile[]
    ),
    map((files: FlowFile[]) => ({
      transfers: files.map(flowFile => flowFile2Transfer(flowFile)),
      flow: this.flow,
      totalProgress: this.flow.progress()
    })),
    startWith({
      transfers: [],
      flow: null,
      totalProgress: 0
    } as UploadState),
    shareReplay(1),
  );

  somethingToUpload$ = this.transfers$.pipe(map(state => state.transfers.some(file => !file.progress)));

  @Input()
  directoryOnly = false;

  @Input()
  singleFileOnly = false;

  @Input()
  set flowConfig(config) {
    this.flow = new FlowJs(config);
    this.flow.assignBrowse(this.el.nativeElement, this.directoryOnly, this.singleFileOnly);
    this.flow$.next(this.flow);
  }

  @Input()
  set existingFlow(flow) {
    this.flow = flow;
    this.flow.assignBrowse(this.el.nativeElement, this.directoryOnly, this.singleFileOnly);
    this.flow$.next(this.flow);
  }

  constructor(private el: ElementRef) {}

  flowChangeEvents(flow: Flow): Observable<FlowChangeEvent<ListenedEvents>> {
    const progress$ = this.listenForEvent<FileProgress>(flow, 'fileProgress');
    const success$ = this.listenForEvent<FileSuccess>(flow, 'fileSuccess');
    const error$ = this.listenForEvent<FileError>(flow, 'fileError');
    return merge(progress$, success$, error$);
  }

  fileManipulationEvents(flow: Flow): Observable<FlowChangeEvent<FileManipulationEvents>> {
    const add$ = this.listenForEvent<FileAdded>(flow, 'fileAdded');
    const remove$ = this.listenForEvent<FileRemoved>(flow, 'fileRemoved');
    return merge(add$, remove$);
  }

  ngxFlowEvents(): any {
    return this.pauseOrResumeEvent$.pipe(
      map(
        _ =>
          ({
            type: 'pauseOrResume'
          } as FlowChangeEvent<void>)
      )
    );
  }

  upload() {
    this.flow.upload();
  }

  cancel() {
    this.flow.cancel();
  }

  cancelFile(file: Transfer) {
    file.flowFile.cancel();
  }

  pauseFile(file: Transfer) {
    file.flowFile.pause();
    this.pauseOrResumeEvent$.next();
  }

  resumeFile(file: Transfer) {
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
