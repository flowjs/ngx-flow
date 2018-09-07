import { Directive, Input, ElementRef } from '@angular/core';
import { Transfer } from './transfer';

@Directive({
  selector: '[flowSrc]'
})
export class SrcDirective {

  fileReader = new FileReader();

  @Input()
  set flowSrc(transfer: Transfer) {
    this.fileReader.readAsDataURL(transfer.flowFile.file);
    this.fileReader.onload = (event: any) => {
      const url = event.target.result;
      this.el.nativeElement.setAttribute('src', url);
    };
  }

  constructor(private el: ElementRef) { }
}
