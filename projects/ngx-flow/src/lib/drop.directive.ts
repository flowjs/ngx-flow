import { Directive, Input, ElementRef, Renderer2, OnInit } from '@angular/core';

@Directive({
  selector: '[flowDrop]',
  exportAs: 'flowDrop'
})
export class DropDirective implements OnInit {
  protected flowJs: flowjs.Flow;

  @Input()
  set flow(flow: flowjs.Flow) {
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

  constructor(protected el: ElementRef, protected renderer: Renderer2) {}

  ngOnInit() {
    this.renderer.listen('body', 'drop', event => event.preventDefault());
    this.renderer.listen('body', 'dragover', event => event.preventDefault());
  }
}
