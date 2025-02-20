import { AsyncPipe, PercentPipe, DecimalPipe, NgClass} from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ViewChild } from '@angular/core';
import { FlowDirective, NgxFlowModule } from '@flowjs/ngx-flow';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  imports: [
    NgClass, DecimalPipe, PercentPipe, AsyncPipe,
    NgxFlowModule
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent {

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

}
