import { AsyncPipe, DecimalPipe, NgClass, PercentPipe } from '@angular/common';
import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnDestroy, ViewChild } from '@angular/core';
import { FlowButton, FlowConfig, FlowDrop, FlowOptions, FlowSrc } from '@flowjs/ngx-flow';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  imports: [
    NgClass,
    DecimalPipe,
    PercentPipe,
    AsyncPipe,

    // NgxFlowModule,

    FlowConfig,
    FlowDrop,
    FlowSrc,
    FlowButton
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent implements AfterViewInit, OnDestroy {

  private cd = inject(ChangeDetectorRef);

  @ViewChild('flow', { static: false }) flow?: FlowConfig;

  readonly config: FlowOptions = {
    target: 'http://localhost:3000/upload',
    hooks: {
      filesSubmitted: () => {
        void this.flow?.upload();
      }
    }
  };

  flowEventsSubscription?: Subscription;

  ngAfterViewInit() {
    this.flowEventsSubscription = this.flow?.events$.subscribe(event => {
      if (event.type === 'newFlowJsInstance') {
        this.cd.detectChanges();
      }
    });
  }

  ngOnDestroy() {
    this.flowEventsSubscription?.unsubscribe();
  }

}
