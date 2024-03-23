import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-web-sites-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './web-sites-list.component.html',
  styleUrls: ['./web-sites-list.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WebSitesListComponent {}
