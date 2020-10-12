import { NgModule } from '@angular/core';
import Flow from '@flowjs/flow.js';
import { ButtonDirective } from './button.directive';
import { DropDirective } from './drop.directive';
import { FlowInjectionToken } from './flow-injection-token';
import { FlowDirective } from './flow.directive';
import { SrcDirective } from './src.directive';

const directives = [ButtonDirective, SrcDirective, DropDirective, FlowDirective];
export function flowFactory() {
  return Flow;
}

@NgModule({
  imports: [],
  declarations: directives,
  providers: [
    {
      provide: FlowInjectionToken,
      useFactory: flowFactory
    }
  ],
  exports: directives
})
export class NgxFlowModule {}
