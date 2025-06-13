import { Directive, ElementRef, Input, OnInit, Renderer2, inject } from '@angular/core';

@Directive({
    selector: '[flowDrop]',
    exportAs: 'flowDrop'
})
export class FlowDrop implements OnInit {

  protected el = inject(ElementRef);
  protected renderer = inject(Renderer2);

  protected flowJs?: flowjs.Flow;

  @Input()
  set flow(flow: flowjs.Flow) {
    this.flowJs = flow;
    if (!flow) {
      return;
    }
    this.enable();
  }

  enable() {
    this.flowJs?.assignDrop(this.el.nativeElement);
  }

  disable() {
    this.flowJs?.unAssignDrop(this.el.nativeElement);
  }

  ngOnInit() {
    this.renderer.listen('body', 'drop', (event) => event.preventDefault());
    this.renderer.listen('body', 'dragover', (event) => event.preventDefault());
  }
}
