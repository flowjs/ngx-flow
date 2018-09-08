import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Transfer } from 'projects/ngx-flow/src/public_api';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent {

  trackTransfer(transfer: Transfer) {
    return transfer.id;
  }
}
