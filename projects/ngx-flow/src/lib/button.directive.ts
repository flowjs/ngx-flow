import { Directive, ElementRef, inject, Input } from '@angular/core';
import type { FlowInstance } from './flow-js';

@Directive({
  selector: '[flowButton]'
})
export class FlowButton {

  protected el = inject(ElementRef);

  protected _directoryOnly = false;
  @Input()
  set flowDirectoryOnly(directoriesOnly: boolean) {
    this._directoryOnly = directoriesOnly;
    this.setup();
  }

  protected _attributes?: Record<string, string>;
  @Input()
  set flowAttributes(attributes: Record<string, string>) {
    this._attributes = attributes;
    this.setup();
  }

  protected _flow?: FlowInstance;
  @Input()
  set flow(flow: FlowInstance) {
    this._flow = flow;
    this.setup();
  }

  protected _boundFlow?: FlowInstance;
  protected _boundAttributes?: string;
  protected _setupScheduled = false;

  setup() {
    if (!this._flow || this._setupScheduled) {
      return;
    }
    // flow, flowAttributes and flowDirectoryOnly are separate inputs. Angular
    // calls their setters in the same change-detection pass; coalesce them so
    // assignBrowse() runs once and does not attach duplicate change listeners.
    this._setupScheduled = true;
    Promise.resolve().then(() => {
      this._setupScheduled = false;
      if (!this._flow) {
        return;
      }
      const attributes = JSON.stringify(this._attributes || {});
      if (this._boundFlow === this._flow) {
        if (this._boundAttributes !== attributes) {
          this.applyAttributes();
          this._boundAttributes = attributes;
        }
        return;
      }
      this._boundFlow = this._flow;
      this._boundAttributes = attributes;
      this._flow.assignBrowse(
        this.el.nativeElement,
        this._directoryOnly,
        this._flow.opts.singleFile,
        this._attributes
      );
    });
  }

  protected applyAttributes() {
    const element = this.el.nativeElement;
    const input = element.tagName === 'INPUT'
      ? element
      : element.querySelector('input[type="file"]');
    if (!input || !this._attributes) {
      return;
    }
    for (const [name, value] of Object.entries(this._attributes)) {
      input.setAttribute(name, value);
    }
  }

}
