import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { NgxFlowModule, FlowInjectionToken } from '@flowjs/ngx-flow';
import Flow from '@flowjs/flow.js';

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, NgxFlowModule],
  providers: [
    {
      provide: FlowInjectionToken,
      useValue: Flow
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
