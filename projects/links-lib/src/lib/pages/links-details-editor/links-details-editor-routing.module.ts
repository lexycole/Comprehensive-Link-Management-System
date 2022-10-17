import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LinksDetailsEditorPage } from './links-details-editor.page';

const routes: Routes = [
  {
    path: '',
    component: LinksDetailsEditorPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LinksDetailsEditorPageRoutingModule {}
