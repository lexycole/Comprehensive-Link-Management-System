import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { LinksDetailsEditorPageRoutingModule } from './links-details-editor-routing.module';
import { LinksDetailsEditorPage } from './links-details-editor.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReactiveFormsModule,
    LinksDetailsEditorPageRoutingModule
  ],
  declarations: [LinksDetailsEditorPage],
  exports: [
    LinksDetailsEditorPage
  ]
})
export class LinksDetailsEditorPageModule {}
