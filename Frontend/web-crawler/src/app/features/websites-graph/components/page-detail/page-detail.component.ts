import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
} from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faComputerMouse, faSpider } from '@fortawesome/free-solid-svg-icons';
import { GraphNode } from 'src/app/models/graph';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { WebsiteRecordInDetailComponent } from '../website-record-in-detail/website-record-in-detail.component';
import { LoadingBarService } from 'src/app/services/loading-bar.service';
import { WebSiteRecordsService } from 'src/app/services/web-site-records.service';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MessagesService } from 'src/app/services/messages.service';
import { WebSiteRecord } from 'src/app/models/web-site-record';
import { MessageType } from 'src/app/models/message';

@Component({
  selector: 'app-page-detail',
  standalone: true,
  templateUrl: './page-detail.component.html',
  styleUrls: ['./page-detail.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FontAwesomeModule,
    MatButtonModule,
    MatCardModule,
    WebsiteRecordInDetailComponent,
    ReactiveFormsModule,
    MatInputModule,
    MatCheckboxModule,
    MatChipsModule,
    MatIconModule,
    MatFormFieldModule,
    MatButtonModule,
  ],
})
export class PageDetailComponent implements OnChanges {
  faMouse = faComputerMouse;
  faSpider = faSpider;

  websiteForm: FormGroup;

  @Input() nodeId: string | undefined;
  @Input() allNodes: GraphNode[] | undefined;

  @Output() newWebsiteRecordAdded = new EventEmitter<WebSiteRecord>();

  displayedNode: GraphNode | undefined;

  constructor(
    private loadingService: LoadingBarService,
    private websiteService: WebSiteRecordsService,
    private fb: FormBuilder,
    private messagesService: MessagesService
  ) {
    this.websiteForm = this.createForm();
  }

  private createForm() {
    return this.fb.group({
      label: ['', [Validators.required]],
      periodicity: ['', [Validators.required, Validators.pattern('[0-9]+')]],
      boundaryRegExp: ['', []],
    });
  }

  public ngOnChanges(): void {
    const node = this.allNodes?.find((n) => this.nodeId === n.id);

    if (node) {
      this.displayedNode = node;
    } else {
      this.displayedNode = undefined;
    }
  }

  public requestExecution(websiteId: number) {
    const request = this.websiteService.requestExecution(websiteId);

    this.loadingService.waitFor(request);
  }

  public onSubmit() {
    if (!this.websiteForm.valid) {
      return;
    }

    const formData: WebSiteRecord = {
      label: this.websiteForm.get('label')?.value ?? '',
      url: this.displayedNode?.data.url ?? '',
      periodicityMinutes:
        parseInt(this.websiteForm.get('periodicity')?.value, 10) || 0,
      boundaryRegExp: this.websiteForm.get('boundaryRegExp')?.value ?? '',
      tags: [],
      isActive: true,
    };

    const result = this.websiteService.addWebSiteRecord(formData);

    this.loadingService.waitFor(
      result,
      (record) => {
        this.messagesService.addSuccess(
          'Successfully added new web site record'
        );
        this.newWebsiteRecordAdded.emit(record);
        this.websiteForm.reset();
      },
      (err) => {
        this.messagesService.addMessage({
          type: MessageType.ERROR,
          message: `An error occurred: ${err}`,
        });
      }
    );
  }
}
