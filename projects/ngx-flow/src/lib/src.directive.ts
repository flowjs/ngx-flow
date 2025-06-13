import { Directive, ElementRef, inject, Input } from '@angular/core';
import { Transfer } from './transfer';

@Directive({
  selector: '[flowSrc]'
})
export class FlowSrc {

  private el = inject(ElementRef);

  protected fileReader;

  @Input()
  set flowSrc(transfer: Transfer) {
    this.fileReader = new FileReader();
    this.fileReader.readAsDataURL(transfer.flowFile.file);
    this.fileReader.onload = (event) => {
      const url = event.target.result;
      this.el.nativeElement.setAttribute('src', url);
    };
  }

}
