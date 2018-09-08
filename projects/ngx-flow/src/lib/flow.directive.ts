import { Directive, Optional, Input } from '@angular/core';
import { Flow } from './flow/flow';
import * as FlowJs from '@flowjs/flow.js';
import { ReplaySubject, Subject, Observable, merge, fromEvent } from 'rxjs';
import { switchMap, scan, map, startWith, shareReplay } from 'rxjs/operators';
import { FlowFile } from './flow/flow-file';
import { FileProgress, FileSuccess, FileError, FileAdded, FileRemoved, EventName, FlowEvent } from './flow/flow-events';
import { Transfer } from './transfer';
import { UploadState } from './upload-state';
import { DropDirective } from './drop.directive';
import { ButtonDirective } from './button.directive';
import { FlowOptions } from './flow/flow-options';

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
    success: flowFile.isComplete(),
    timeRemaining: flowFile.timeRemaining(),
    flowFile
  };
}

@Directive({
  selector: '[flow]',
  exportAs: 'flow'
})
export class FlowDirective {

  @Input()
  set flow(options: FlowOptions) {
    this.flowJs = new FlowJs(options);
    this.flow$.next(this.flowJs);
  }

  flowJs: Flow;

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
            if (this.flowJs.opts.singleFile) {
              files[0] = file;
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
      flow: this.flowJs,
      totalProgress: this.flowJs.progress()
    })),
    startWith({
      transfers: [],
      flow: null,
      totalProgress: 0
    } as UploadState),
    shareReplay(1),
  );

  somethingToUpload$ = this.transfers$.pipe(map(state => state.transfers.some(file => !file.progress)));

  constructor() { }

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
    this.flowJs.upload();
  }

  cancel() {
    this.flowJs.cancel();
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
