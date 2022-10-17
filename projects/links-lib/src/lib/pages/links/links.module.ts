import { CommonModule } from '@angular/common';
import { NgModule, ModuleWithProviders } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { LoaderComponentModule } from 'vicky-ionic-ng-lib';
import { LinksDetailsEditorPageModule } from '../links-details-editor/links-details-editor.module';
import { LinksPageRoutingModule } from './links-routing.module';
import { LinksPage } from './links.page';
import { ComponentsModule } from '../../components/components.module';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    LinksPageRoutingModule,
    LinksDetailsEditorPageModule,
    ComponentsModule,
    LoaderComponentModule,
  ],
  declarations: [LinksPage ],

  providers: [],

  exports: [LinksPage]
})
export class LinksPageModule {
}
