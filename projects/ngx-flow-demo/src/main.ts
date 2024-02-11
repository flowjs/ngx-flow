import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import Flow from '@flowjs/flow.js';
import { FlowInjectionToken } from '@flowjs/ngx-flow';

bootstrapApplication(AppComponent, {
  providers: [
    {
      provide: FlowInjectionToken,
      useValue: Flow
    }
  ]
}).catch((err) => console.error(err));
