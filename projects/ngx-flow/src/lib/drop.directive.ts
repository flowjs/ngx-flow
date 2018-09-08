import { Directive, Input, ElementRef, Renderer2 } from '@angular/core';
import { Flow } from './flow/flow';

@Directive({
  selector: '[flowDrop]',
  exportAs: 'flowDrop'
})
export class DropDirective {
  flowJs: Flow;

  @Input()
  set flow(flow: Flow) {
    this.flowJs = flow;
    if (!flow) {
      return;
    }
    this.enable();
  }

  enable() {
    this.flowJs.assignDrop(this.el.nativeElement);
  }

  disable() {
    this.flowJs.unAssignDrop(this.el.nativeElement);
  }

  constructor(private el: ElementRef, renderer: Renderer2) {
    renderer.listen('body', 'drop', event => event.preventDefault());
    renderer.listen('body', 'dragover', event => event.preventDefault());
  }
}
