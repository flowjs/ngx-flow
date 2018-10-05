import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { NgxFlowModule } from '@flowjs/ngx-flow';

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, NgxFlowModule],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
