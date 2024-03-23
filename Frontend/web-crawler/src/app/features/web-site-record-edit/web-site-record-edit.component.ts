import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { WebSiteEditMode, WebSiteRecord } from 'src/app/models/web-site-record';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipInputEvent, MatChipsModule } from '@angular/material/chips';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { WebSiteRecordsService } from 'src/app/services/web-site-records.service';
import { LoadingBarService } from 'src/app/services/loading-bar.service';
import { MessagesService } from 'src/app/services/messages.service';
import { MessageType } from 'src/app/models/message';

@Component({
  selector: 'app-web-site-records-edit',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatInputModule,
    MatCheckboxModule,
    MatChipsModule,
    MatIconModule,
    MatFormFieldModule,
    MatButtonModule,
  ],
  templateUrl: './web-site-record-edit.component.html',
  styleUrls: ['./web-site-record-edit.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WebSiteRecordEditComponent implements OnInit {
  websiteForm: FormGroup;
  readonly separatorKeysCodes = [ENTER, COMMA] as const;
  currentMode = WebSiteEditMode.NEW;
  currentEditedId: number | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private webSiteRecordsService: WebSiteRecordsService,
    private loadingService: LoadingBarService,
    private messagesService: MessagesService
  ) {
    this.websiteForm = this.createForm();
  }

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      const id = params['id'] as number | null;
      const mode = params['mode'] as WebSiteEditMode;

      if (mode == WebSiteEditMode.NEW) {
        this.currentMode = WebSiteEditMode.NEW;
      } else {
        this.currentMode = WebSiteEditMode.EDIT;
        this.currentEditedId = id;
      }
    });
  }

  createForm() {
    return this.fb.group({
      label: ['', [Validators.required]],
      url: ['', [Validators.required]],
      periodicity: ['', [Validators.required, Validators.pattern('[0-9]+')]],
      boundaryRegExp: ['', []],
      tags: [[], []],
      isActive: [true],
    });
  }

  onSubmit() {
    if (!this.websiteForm.valid) {
      return;
    }

    const newWebSiteRecord: WebSiteRecord = {
      label: this.websiteForm.get('label')?.value ?? '',
      url: this.websiteForm.get('url')?.value ?? '',
      periodicityMinutes:
        parseInt(this.websiteForm.get('periodicity')?.value, 10) || 0,
      boundaryRegExp: this.websiteForm.get('boundaryRegExp')?.value ?? '',
      tags: this.websiteForm.get('tags')?.value ?? [],
      isActive: this.websiteForm.get('isActive')?.value ?? false,
    };

    if (this.currentMode == WebSiteEditMode.NEW) {
      const result =
        this.webSiteRecordsService.addWebSiteRecord(newWebSiteRecord);

      this.loadingService.waitFor(
        result,
        () => {
          this.messagesService.addSuccess(
            'Successfully added new web site record'
          );
          this.router.navigate(['web-sites-list'], {
            relativeTo: this.route.root,
            queryParams: { page: 1 },
          });
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

  addTag(event: MatChipInputEvent): void {
    const input = event.chipInput.inputElement;
    const newValue = (event.value || '').trim();

    if (newValue) {
      const tagsControl = this.websiteForm.get('tags');
      const currentTags = tagsControl?.value;

      tagsControl?.setValue([...currentTags, newValue]);
    }

    if (input) {
      input.value = '';
    }
  }

  removeTag(index: number) {
    const tagsControl = this.websiteForm.get('tags');
    const currentTags = tagsControl?.value as string[];

    currentTags.splice(index, 1);

    tagsControl?.setValue(currentTags);
  }
}
