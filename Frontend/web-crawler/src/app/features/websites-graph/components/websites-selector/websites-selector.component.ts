import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import {
  MatSlideToggleChange,
  MatSlideToggleModule,
} from '@angular/material/slide-toggle';
import {
  WebSiteRecord,
  WebSiteRecordReference,
} from 'src/app/models/web-site-record';

@Component({
  selector: 'app-websites-selector',
  standalone: true,
  imports: [
    CommonModule,
    MatSelectModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSlideToggleModule,
  ],
  templateUrl: './websites-selector.component.html',
  styleUrls: ['./websites-selector.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WebsitesSelectorComponent implements OnChanges {
  @Input() possibleWebsites: WebSiteRecordReference[] = [];
  @Input() selectedWebsites: WebSiteRecordReference[] = [];

  @Output() selectedWebsitesChange: EventEmitter<WebSiteRecordReference[]> =
    new EventEmitter<WebSiteRecordReference[]>();

  @Output() domainViewChanged: EventEmitter<boolean> =
    new EventEmitter<boolean>();

  @Output() staticViewChanged: EventEmitter<boolean> =
    new EventEmitter<boolean>();

  public selection = new FormControl<WebSiteRecordReference[]>([]);

  public onSelectionChanged(event: { value: WebSiteRecordReference[] }) {
    this.selectedWebsitesChange.emit([...event.value]);
  }

  public ngOnChanges(): void {
    this.selection.setValue(this.selectedWebsites);
  }
}
