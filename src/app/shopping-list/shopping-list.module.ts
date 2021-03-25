import { NgModule } from '@angular/core';
import {FormsModule} from '@angular/forms';

import {ShoppingListComponent} from './shopping-list.component';
import {ShoppingEditComponent} from './shopping-edit/shopping-edit.component';
import {RouterModule} from '@angular/router';
import {SharedModule} from '../shared/shared.module';



@NgModule({
  declarations: [
    ShoppingListComponent,
    ShoppingEditComponent,
  ],
  imports: [
    FormsModule,
    SharedModule,
    RouterModule.forChild([
      {path: '', component: ShoppingListComponent}
    ])
  ],
  exports: []
})
export class ShoppingListModule { }