import { NgModule } from '@angular/core';
import { FlowButton } from './button.directive';
import { FlowDrop } from './drop.directive';
import { Flow } from './flow.directive';
import { FlowSrc } from './src.directive';

const directives = [
  FlowButton,
  FlowSrc,
  FlowDrop,
  Flow,
];

@NgModule({
  imports: [...directives],
  exports: directives,
})
export class NgxFlowModule {}
