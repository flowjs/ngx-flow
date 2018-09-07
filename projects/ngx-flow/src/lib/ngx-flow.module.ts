import { NgModule } from '@angular/core';
import { ButtonDirective } from './button.directive';
import { SrcDirective } from './src.directive';

@NgModule({
  imports: [],
  declarations: [ButtonDirective, SrcDirective],
  exports: [ButtonDirective, SrcDirective]
})
export class NgxFlowModule {}
