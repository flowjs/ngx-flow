import { AsyncPipe, DecimalPipe, NgClass, PercentPipe } from '@angular/common';
import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, inject, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { FlowButton, FlowConfig, FlowDrop, FlowSrc } from '@flowjs/ngx-flow';

@Component({
  selector: 'app-root',
  imports: [
    NgClass,
    DecimalPipe,
    PercentPipe,
    AsyncPipe,
    FormsModule,

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
export class AppComponent implements AfterViewInit {
  private destroyRef = inject(DestroyRef);
  private cd = inject(ChangeDetectorRef);

  flow = viewChild<FlowConfig>('flow');

  chunkSize = 100;

  ngAfterViewInit() {
    this.flow()?.events$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(event => {
        switch (event.type) {
          case 'filesSubmitted':
            return this.flow()?.upload();
          case 'newFlowJsInstance':
            this.cd.detectChanges();
        }
      });
  }

}
