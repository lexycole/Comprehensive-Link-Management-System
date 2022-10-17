import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { LinksItemComponent } from './links-item/links-item.component';
import { LinksListComponent } from './links-list/links-list.component';


@NgModule({
  declarations: [
    LinksItemComponent,
    LinksListComponent
  ],
  imports: [
    CommonModule,
    IonicModule,
  ],
  exports: [LinksItemComponent,
    LinksListComponent]
})
export class ComponentsModule {
}
