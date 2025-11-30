import { booleanAttribute, computed, Directive, effect, ElementRef, inject, input } from '@angular/core';

@Directive({
  selector: '[flowButton]',
})
export class FlowButton {
  private readonly el = inject(ElementRef);

  public readonly flowDirectoryOnly = input(false, { transform: booleanAttribute });
  public readonly flowAttributes = input<object | undefined>(undefined);
  public readonly flow = input<flowjs.Flow | undefined>();

  private readonly browseConfig = computed(() => {
    const flow = this.flow();
    if (!flow) {
      return null;
    }

    return {
      flow,
      directoryOnly: this.flowDirectoryOnly(),
      attributes: this.flowAttributes(),
      singleFile: flow.opts.singleFile,
    };
  });

  constructor() {
    effect(() => {
      const cfg = this.browseConfig();
      if (!cfg) {
        return;
      }

      cfg.flow.assignBrowse(this.el.nativeElement, cfg.directoryOnly, cfg.singleFile, cfg.attributes);
    });
  }
}
