import { NgModule, InjectionToken, Type } from '@angular/core';
import { ButtonDirective } from './button.directive';
import { SrcDirective } from './src.directive';
import { DropDirective } from './drop.directive';
import { FlowDirective } from './flow.directive';
import * as Flow from '@flowjs/flow.js';
import { FlowInjectionToken } from './flow-injection-token';

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
