import { Directive, ElementRef, Input } from '@angular/core';
import * as FlowJs from '@flowjs/flow.js';
import { fromEvent, ReplaySubject, merge, Observable } from 'rxjs';
import { switchMap, map, scan, startWith, shareReplay } from 'rxjs/operators';
import { UploadState } from './upload-state';
import { FileAdded, FileProgress, FileSuccess, FileError, FlowEvent, FileRemoved, EventName } from './flow/flow-events';
import { Flow } from './flow/flow';
import { FlowFile } from './flow/flow-file';
import { Transfer } from './transfer';

interface FlowChangeEvent<T extends FlowEvent> {
  type: EventName;
  event: T;
}

type ListenedEvents = FileProgress | FileSuccess | FileError;
type FileManipulationEvents = FileAdded | FileRemoved;

@Directive({
  selector: '[flowButton]',
  exportAs: 'flowButton'
})
export class ButtonDirective {
  flow: Flow;

  flow$ = new ReplaySubject<Flow>(1);

  transfers$: Observable<UploadState> = this.flow$.pipe(
    switchMap(flow => {
      return merge(this.flowChangeEvents(flow), this.fileManipulationEvents(flow));
    }),
    scan<FlowChangeEvent<FileManipulationEvents>, FlowFile[]>((files, {type, event}) => {
      let file;
      switch (type) {
        case 'fileAdded':
          file = event[0];
          files.push(file);
          return files;
        case 'fileRemoved':
          file = event;
          return files.filter(item => item !== file);
        default:
          return files;
      }
    }, [] as FlowFile[]),
    map((files: FlowFile[]) => ({
      transfers: files.map(flowFile => ({
        name: flowFile.name,
        progress: flowFile.progress(),
        flowFile
      })),
      flow: this.flow,
      totalProgress: this.flow.progress()
    })),
    startWith({
      transfers: [],
      flow: null,
      totalProgress: 0.
    } as UploadState),
    shareReplay(1),
  );

  somethingToUpload$ = this.transfers$.pipe(
    map(state => state.transfers.some(file => !file.progress)),
  );

  @Input()
  set flowConfig(config) {
    this.flow = new FlowJs(config);
    this.flow.assignBrowse(this.el.nativeElement);
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
  }

  resumeFile(file: Transfer) {
    file.flowFile.resume();
  }

  private listenForEvent<T extends FlowEvent>(flow: Flow, eventName: EventName): Observable<FlowChangeEvent<T>> {
    return fromEvent<T>(flow, eventName).pipe(
      map(args => ({
        type: eventName,
        event: args
      }))
    );
  }
}
