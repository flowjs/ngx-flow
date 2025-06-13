import { NgModule } from '@angular/core';
import { FlowButton } from './button.directive';
import { FlowDrop } from './drop.directive';
import { FlowConfig } from './flow.directive';
import { FlowSrc } from './src.directive';

const directives = [
  FlowButton,
  FlowSrc,
  FlowDrop,
  FlowConfig,
];

@NgModule({
  imports: [...directives],
  exports: directives,
})
export class NgxFlowModule { }
