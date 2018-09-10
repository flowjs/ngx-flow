import { Component, ChangeDetectionStrategy, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
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
  @ViewChild('flow')
  flow: FlowDirective;

  autoUploadSubscription: Subscription;

  ngAfterViewInit() {
    this.autoUploadSubscription = this.flow.events$.subscribe(event => {
      if (event.type === 'filesSubmitted') {
        this.flow.upload();
      }
    });
  }

  ngOnDestroy() {
    this.autoUploadSubscription.unsubscribe();
  }

  trackTransfer(transfer: Transfer) {
    return transfer.id;
  }
}
