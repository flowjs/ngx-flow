import { Directive, ElementRef, Input } from '@angular/core';
import { Flow } from './flow/flow';

@Directive({
  selector: '[flowButton]'
})
export class ButtonDirective {
  @Input()
  flowDirectoryOnly = false;

  @Input()
  flowAttributes = null;

  @Input()
  set flow(flow: Flow) {
    if (!flow) {
      return;
    }
    flow.assignBrowse(this.el.nativeElement, this.flowDirectoryOnly, flow.opts.singleFile, this.flowAttributes);
  }

  constructor(private el: ElementRef) {}
}
