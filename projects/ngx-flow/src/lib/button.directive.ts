import { Directive, ElementRef, Input } from '@angular/core';
import * as Flow from '@flowjs/flow.js';
import { fromEvent, ReplaySubject, merge, Observable } from 'rxjs';
import { switchMap, map, scan, startWith, shareReplay } from 'rxjs/operators';
import { UploadState } from './upload-state';
import { ProgressEvent, AddEvent, FlowEvent, ErrorEvent, SuccessEvent } from './flow-events';

@Directive({
  selector: '[flowButton]',
  exportAs: 'flowButton'
})
export class ButtonDirective {
  flow: any;

  flow$ = new ReplaySubject<any>(1);

  transfers$: Observable<UploadState> = this.flow$.pipe(
    switchMap(flow => {
      const add$ = fromEvent<any>(flow, 'fileAdded').pipe(
        map(
          ([flowFile]) =>
            ({
              event: 'add',
              file: flowFile.name
            } as AddEvent)
        )
      );
      const progress$ = fromEvent<any>(flow, 'fileProgress').pipe(
        map(
          ([flowFile]) =>
            ({
              event: 'progress',
              file: flowFile.name,
              value: flowFile.progress()
            } as ProgressEvent)
        )
      );
      const success$ = fromEvent<any>(flow, 'fileSuccess').pipe(
        map(
          ([flowFile]) =>
            ({
              event: 'success',
              file: flowFile.name
            } as SuccessEvent)
        )
      );
      const error$ = fromEvent<any>(flow, 'fileError').pipe(
        map(
          ([flowFile]) =>
            ({
              event: 'error',
              file: flowFile.name
            } as ErrorEvent)
        )
      );
      return merge(add$, progress$, success$, error$);
    }),
    scan((files, event: FlowEvent) => {
      switch (event.event) {
        case 'add':
          files.push({
            file: event.file
          });
          return files;
        case 'progress':
          return files.map(file => {
            if (file.file !== event.file) {
              return file;
            }
            file.progress = event.value;
            file.status = 'uploading'
            return file;
          });
        case 'success':
          return files.map(file => {
            if (file.file !== event.file) {
              return file;
            }
            file.status = 'success';
            return file;
          });
        case 'error':
          return files.map(file => {
            if (file.file !== event.file) {
              return file;
            }
            file.status = 'error';
            return file;
          });
        default:
          return files;
      }
    }, []),
    map(
      filesArray =>
        ({
          transfers: filesArray,
          totalProgress: filesArray
            .filter(file => file.progress && file.status !== 'error')
            .map(file => file.progress)
            .reduce((acc, curr, _, items) => {
              return acc + curr / items.length;
            }, 0)
        } as UploadState)
    ),
    startWith({
      transfers: [],
      totalProgress: 0
    }),
    shareReplay(1),
  );

  somethingToUpload$ = this.transfers$.pipe(
    map(state => state.transfers.some(file => !file.progress)),
  );

  @Input()
  set flowConfig(config) {
    this.flow = new Flow(config);
    this.flow.assignBrowse(this.el.nativeElement);
    this.flow$.next(this.flow);
  }

  constructor(private el: ElementRef) {}

  upload() {
    this.flow.upload();
  }
}
