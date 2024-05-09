import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { WebSitesListComponent } from './features/web-sites-list/web-sites-list.component';
import { WebSiteRecordEditComponent } from './features/web-site-record-edit/web-site-record-edit.component';
import { ExecutionsListComponent } from './features/executions-list/executions-list.component';
import { WebsitesGraphComponent } from './features/websites-graph/websites-graph.component';
import { OneExecutionGraphComponent } from './features/one-execution-graph/one-execution-graph.component';

const routes: Routes = [
  { path: 'web-sites-list', component: WebSitesListComponent },
  { path: 'edit-web-site-record', component: WebSiteRecordEditComponent },
  { path: 'executions-list', component: ExecutionsListComponent },
  { path: 'websites-graph', component: WebsitesGraphComponent },
  { path: 'execution-graph', component: OneExecutionGraphComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
