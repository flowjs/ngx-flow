import { Directive, effect, ElementRef, inject, input } from '@angular/core';
import { Transfer } from './transfer';

@Directive({
  selector: '[flowSrc]',
})
export class FlowSrc {
  private readonly el = inject(ElementRef);

  /** Transfer that holds the file to be read. */
  public readonly flowSrc = input.required<Transfer>();

  constructor() {
    effect((onCleanup) => {
      const transfer = this.flowSrc();
      const reader = new FileReader();

      // Event handler for when the file is successfully read.
      reader.onload = (event) => {
        const url = event.target?.result;
        this.el.nativeElement.setAttribute('src', url);
      };

      // Start reading the file as a data URL.
      reader.readAsDataURL(transfer.flowFile.file);

      // Reset the onload handler and abort the reader if needed.
      onCleanup(() => {
        reader.onload = null;
        reader.abort();
      });
    });
  }
}
