import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { NgxFlowModule } from '../../projects/ngx-flow/src/lib/ngx-flow.module';

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, NgxFlowModule],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
