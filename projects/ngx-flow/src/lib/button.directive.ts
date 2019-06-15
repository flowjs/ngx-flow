import { Directive, ElementRef, Input } from '@angular/core';

@Directive({
  selector: '[flowButton]'
})
export class ButtonDirective {
  protected _directoryOnly = false;
  @Input()
  set flowDirectoryOnly(directoriesOnly: boolean) {
    this._directoryOnly = directoriesOnly;
    this.setup();
  }

  protected _attributes: object;
  @Input()
  set flowAttributes(attributes: object) {
    this._attributes = attributes;
    this.setup();
  }

  protected _flow: flowjs.Flow = null;
  @Input()
  set flow(flow: flowjs.Flow) {
    this._flow = flow;
    this.setup();
  }

  setup() {
    if (!this._flow) {
      return;
    }
    this._flow.assignBrowse(this.el.nativeElement, this._directoryOnly, this._flow.opts.singleFile, this._attributes);
  }

  constructor(protected el: ElementRef) {}
}
