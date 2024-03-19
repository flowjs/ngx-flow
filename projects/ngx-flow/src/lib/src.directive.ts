import { Directive, ElementRef, Input } from '@angular/core';
import { Transfer } from './transfer';

@Directive({
  selector: '[flowSrc]'
})
export class SrcDirective {
  protected fileReader;

  @Input()
  set flowSrc(transfer: Transfer) {
    this.fileReader = new FileReader();
    this.fileReader.readAsDataURL(transfer.flowFile.file);
    this.fileReader.onload = (event: any) => {
      const url = event.target.result;
      this.el.nativeElement.setAttribute('src', url);
    };
  }

  constructor(private el: ElementRef) {}
}
