import { Directive, ElementRef, Input } from '@angular/core';
import { Flow } from './flow/flow';

@Directive({
  selector: '[flowButton]'
})
export class ButtonDirective {
  _directoryOnly = false;
  @Input()
  set flowDirectoryOnly(directoriesOnly: boolean) {
    this._directoryOnly = directoriesOnly;
    this.setup();
  }

  _attributes: object;
  @Input()
  set flowAttributes(attributes: object) {
    this._attributes = attributes;
    this.setup();
  }

  private _flow: Flow = null;
  @Input()
  set flow(flow: Flow) {
    this._flow = flow;
    this.setup();
  }

  setup() {
    if (!this._flow) {
      return;
    }
    this._flow.assignBrowse(this.el.nativeElement, this._directoryOnly, this._flow.opts.singleFile, this._attributes);
  }

  constructor(private el: ElementRef) {}
}
