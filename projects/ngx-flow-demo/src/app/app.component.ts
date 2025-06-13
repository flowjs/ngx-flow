import { AsyncPipe, DecimalPipe, NgClass, PercentPipe } from '@angular/common';
import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnDestroy, ViewChild } from '@angular/core';
import { Flow, FlowButton, FlowDrop, FlowSrc } from '@flowjs/ngx-flow';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  imports: [
    NgClass,
    DecimalPipe,
    PercentPipe,
    AsyncPipe,

    // NgxFlowModule,

    Flow,
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

  @ViewChild('flow', { static: false }) flow?: Flow;

  autoUploadSubscription?: Subscription;

  ngAfterViewInit() {
    this.autoUploadSubscription = this.flow?.events$.subscribe(event => {
      switch (event.type) {
        case 'filesSubmitted':
          return this.flow?.upload();
        case 'newFlowJsInstance':
          this.cd.detectChanges();
      }
    });
  }

  ngOnDestroy() {
    this.autoUploadSubscription?.unsubscribe();
  }

}
