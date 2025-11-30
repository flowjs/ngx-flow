import { isPlatformBrowser } from '@angular/common';
import { DestroyRef, Directive, effect, inject, input, PLATFORM_ID, signal } from '@angular/core';
import { fromEvent, merge, Observable, ReplaySubject, Subject } from 'rxjs';
import { JQueryStyleEventEmitter } from 'rxjs/internal/observable/fromEvent';
import { map, shareReplay, startWith, switchMap } from 'rxjs/operators';
import { FlowInjectionToken } from './flow-injection-token';
import { flowFile2Transfer } from './helpers/flow-file-to-transfer';
import { Transfer } from './transfer';
import { UploadState } from './upload-state';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

export interface FlowChangeEvent<T extends flowjs.EventName> {
  type: T;
  event: flowjs.FlowEventFromEventName<T>;
}

export interface NgxFlowEvent {
  type: 'pauseOrResume' | 'newFlowJsInstance';
}

@Directive({
  selector: '[flowConfig]',
  exportAs: 'flow',
})
export class FlowConfig {
  protected readonly flowConstructor = inject(FlowInjectionToken);
  protected readonly platform = inject(PLATFORM_ID);

  /** Input configuration for FlowJS */
  public readonly flowConfig = input.required<flowjs.FlowOptions>();

  /** ReplaySubject emitting the current FlowJS instance for event streams */
  private readonly flowSjt = new ReplaySubject<flowjs.Flow>(1);

  /** Emits whenever a file is paused or resumed */
  private readonly pauseOrResumeSjt = new Subject<void>();

  /** The current FlowJS instance created from provided {@link flowConfig} */
  public flowJs!: flowjs.Flow;

  /**
   * Observable merging all `flow.js` standard events and custom `ngx-flow` events.
   *
   * - **`flow.js`** : all events from {@link flowjs.FlowEventMap} (see [flow.js README](https://github.com/flowjs/flow.js?tab=readme-ov-file#events))
   * - **`ngx-flow`** :
   *   - `pauseOrResume` When a file is paused or resumed
   *   - `newFlowJsInstance` A new FlowJS instance is created (a new {@link flowConfig} is provided)
   */
  public readonly events$ = this.flowSjt.pipe(
    takeUntilDestroyed(),
    switchMap((flow) => {
      return merge(this.flowEvents(flow), this.ngxFlowEvents());
    })
  );

  /**
   * Observable that emits the current upload state, derived from the FlowJS instance.
   *
   * Each emission is an object of type `UploadState` containing:
   * - `transfers`: an array of `Transfer` objects representing the current files in the flow
   * - `flow`: the current FlowJS instance
   * - `totalProgress`: the total upload progress as a number between 0 and 1
   *
   * The observable updates whenever any FlowJS event occurs (e.g., file added, progress, success, error),
   * ensuring subscribers always receive the latest state.
   */
  public readonly transfers$: Observable<UploadState> = this.events$.pipe(
    takeUntilDestroyed(),
    map(() => this.flowJs.files),
    map((files: flowjs.FlowFile[] = []) => ({
      transfers: files.map((flowFile) => flowFile2Transfer(flowFile)),
      flow: this.flowJs,
      totalProgress: this.flowJs.progress(),
    })),
    shareReplay(1)
  );

  /** Observable indicating whether there are any files still pending upload. */
  public readonly somethingToUpload$ = this.transfers$.pipe(
    takeUntilDestroyed(),
    map((state) => state.transfers.some((file) => !file.success)),
    startWith(false)
  );

  constructor() {
    effect(() => {
      // Create a new FlowJS instance whenever a new FlowJS configuration is provided
      const config = this.flowConfig();
      if (!config || !isPlatformBrowser(this.platform)) {
        return;
      }

      this.flowJs = new this.flowConstructor(config);
      this.flowSjt.next(this.flowJs);
    });
  }

  /** Starts uploading all pending files in the FlowJS instance */
  upload(): void {
    this.flowJs.upload();
  }

  /** Cancels all uploads in the current FlowJS instance */
  cancel(): void {
    this.flowJs.cancel();
  }

  /**
   * Cancels a specific file upload.
   * @param file transfer object representing the file
   */
  cancelFile(file: Transfer): void {
    file.flowFile.cancel();
  }

  /**
   * Pauses a specific file upload.
   * @param file transfer object representing the file
   */
  pauseFile(file: Transfer): void {
    file.flowFile.pause();
    this.pauseOrResumeSjt.next();
  }

  /**
   * Resumes a specific file upload.
   * @param file transfer object representing the file
   */
  resumeFile(file: Transfer): void {
    file.flowFile.resume();
    this.pauseOrResumeSjt.next();
  }

  /** Creates an Observable merging all standard `flow.js` events for the given instance. */
  private flowEvents(flow: flowjs.Flow): Observable<FlowChangeEvent<flowjs.EventName>> {
    return merge(
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
      this.listenForEvent(flow, 'progress'),
    );
  }

  /** Creates an Observable for custom `ngx-flow` events */
  private ngxFlowEvents(): Observable<NgxFlowEvent> {
    return merge(
      this.pauseOrResumeSjt.pipe(map(() => ({type: 'pauseOrResume'} as NgxFlowEvent))),
      this.flowSjt.pipe(map(() => ({type: 'newFlowJsInstance'} as NgxFlowEvent)))
    );
  }

  /** Creates an Observable for a specific FlowJS event. */
  private listenForEvent<T extends flowjs.EventName, R extends flowjs.FlowEventFromEventName<T>>(
    flow: flowjs.Flow,
    eventName: T
  ): Observable<FlowChangeEvent<T>> {
    return fromEvent<R>(flow as JQueryStyleEventEmitter<any, R>, eventName)
      .pipe(
        map((args) => ({
          type: eventName,
          event: args,
        }))
      );
  }
}
