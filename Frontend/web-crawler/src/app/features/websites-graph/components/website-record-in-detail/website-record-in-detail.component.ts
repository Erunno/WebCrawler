import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { RouterModule } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faPenToSquare, faSpider } from '@fortawesome/free-solid-svg-icons';
import { WebsiteRecordShort } from 'src/app/models/graph';

@Component({
  selector: 'app-website-record-in-detail',
  standalone: true,
  imports: [
    CommonModule,
    CommonModule,
    FontAwesomeModule,
    MatButtonModule,
    MatCardModule,
    RouterModule,
  ],
  templateUrl: './website-record-in-detail.component.html',
  styleUrls: ['./website-record-in-detail.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WebsiteRecordInDetailComponent {
  public faSpider = faSpider;
  public faEdit = faPenToSquare;

  @Input({ required: true }) website!: WebsiteRecordShort;
  @Output() crawlClicked: EventEmitter<number> = new EventEmitter<number>();
}
