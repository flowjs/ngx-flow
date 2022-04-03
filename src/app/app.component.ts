import {
  Component,
  ChangeDetectionStrategy,
  ViewChild,
  AfterViewInit,
  OnDestroy,
  ChangeDetectorRef,
  TrackByFunction
} from '@angular/core';
import { Transfer } from 'projects/ngx-flow/src/public_api';
import { FlowDirective } from 'projects/ngx-flow/src/lib/flow.directive';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent implements AfterViewInit, OnDestroy {
  @ViewChild('flow', { static: false }) flow: FlowDirective | undefined;

  autoUploadSubscription: Subscription | undefined;

  constructor(private cd: ChangeDetectorRef) {}

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

  trackByTransfer(index: number, transfer: Transfer) {
    return transfer.id;
  }
}
