import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ViewChild,
} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatDrawer, MatSidenavModule } from '@angular/material/sidenav';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faGlobe,
  faSpider,
  faBars,
  faSquarePlus,
} from '@fortawesome/free-solid-svg-icons';
import { AppRoutingModule } from 'src/app/app-routing.module';
import { Router } from '@angular/router';
import { WebSiteEditMode } from 'src/app/models/web-site-record';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { LoadingBarService } from 'src/app/services/loading-bar.service';
import { MessagesService } from 'src/app/services/messages.service';
import { Message } from 'src/app/models/message';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatSidenavModule,
    FontAwesomeModule,
    AppRoutingModule,
    MatProgressBarModule,
  ],
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MainLayoutComponent implements AfterViewInit {
  faGlobe = faGlobe;
  faSpider = faSpider;
  faBars = faBars;
  faSquarePlus = faSquarePlus;
  newRecordMode = WebSiteEditMode.NEW;

  private messageDuration = 3000; // ms

  loadingBarShown = false;
  messages = [] as Message[];

  @ViewChild('drawer') drawer: MatDrawer | null = null;

  constructor(
    private router: Router,
    public loadingService: LoadingBarService,
    public messagesService: MessagesService,
    changeDetector: ChangeDetectorRef
  ) {
    loadingService.setShowProgressBarHandle(
      () => {
        this.loadingBarShown = true;
        changeDetector.detectChanges();
      },
      () => {
        this.loadingBarShown = false;
        changeDetector.detectChanges();
      }
    );

    messagesService.setAddMessage((m) => {
      this.messages.push(m);

      setTimeout(() => {
        this.messages.splice(0, 1);
        changeDetector.detectChanges();
      }, this.messageDuration);

      changeDetector.detectChanges();
    });
  }

  ngAfterViewInit(): void {
    this.drawer?.open();
  }
}
