import { Directive, effect, ElementRef, inject, input } from '@angular/core';

@Directive({
  selector: '[flowDrop]',
  exportAs: 'flowDrop',
  host: {
    '(dragover)': 'stop($event)',
    '(drop)': 'stop($event)',
  },
})
export class FlowDrop {
  private readonly el = inject(ElementRef);

  public readonly flow = input<flowjs.Flow | undefined>();

  constructor() {
    effect((onCleanUp) => {
      const flow = this.flow();
      if (flow) {
        this.enable(flow);
      }
      onCleanUp(() => this.disable(flow));
    });
  }

  enable(flow = this.flow()) {
    flow?.assignDrop(this.el.nativeElement);
  }

  disable(flow = this.flow()) {
    flow?.unAssignDrop(this.el.nativeElement);
  }

  protected stop(event: DragEvent): void {
    event.preventDefault();
  }
}
