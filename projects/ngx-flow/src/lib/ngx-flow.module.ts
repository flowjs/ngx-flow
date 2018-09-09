import { NgModule } from '@angular/core';
import * as Flow from '@flowjs/flow.js';
import { ButtonDirective } from './button.directive';
import { DropDirective } from './drop.directive';
import { FlowInjectionToken } from './flow-injection-token';
import { FlowDirective } from './flow.directive';
import { SrcDirective } from './src.directive';

@NgModule({
  imports: [],
  declarations: [ButtonDirective, SrcDirective, DropDirective, FlowDirective],
  providers: [
    {
      provide: FlowInjectionToken,
      useValue: Flow
    }
  ],
  exports: [ButtonDirective, SrcDirective, DropDirective, FlowDirective]
})
export class NgxFlowModule {}
