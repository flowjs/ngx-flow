import { NgModule } from '@angular/core';
import { ButtonDirective } from './button.directive';
import { SrcDirective } from './src.directive';
import { DropDirective } from './drop.directive';
import { FlowDirective } from './flow.directive';

@NgModule({
  imports: [],
  declarations: [ButtonDirective, SrcDirective, DropDirective, FlowDirective],
  exports: [ButtonDirective, SrcDirective, DropDirective, FlowDirective]
})
export class NgxFlowModule {}
