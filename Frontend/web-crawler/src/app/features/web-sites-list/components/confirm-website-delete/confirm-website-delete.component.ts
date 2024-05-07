import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { WebSiteRecord } from 'src/app/models/web-site-record';

@Component({
  selector: 'app-confirm-website-delete',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatButtonModule],
  templateUrl: './confirm-website-delete.component.html',
  styleUrls: ['./confirm-website-delete.component.css'],
})
export class ConfirmWebsiteDeleteComponent {
  constructor(
    public dialogRef: MatDialogRef<ConfirmWebsiteDeleteComponent>,
    @Inject(MAT_DIALOG_DATA) public data: WebSiteRecord
  ) {}

  public cancel() {
    this.dialogRef.close({ deleteConfirmed: false });
  }

  public confirm() {
    this.dialogRef.close({ deleteConfirmed: true });
  }
}
