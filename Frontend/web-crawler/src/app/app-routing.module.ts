import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { WebSitesListComponent } from './features/web-sites-list/web-sites-list.component';
import { WebSiteRecordEditComponent } from './features/web-site-record-edit/web-site-record-edit.component';

const routes: Routes = [
  { path: 'web-sites-list', component: WebSitesListComponent },
  { path: 'edit-web-site-record', component: WebSiteRecordEditComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
