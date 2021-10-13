import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { BinAddEditPage } from './bin-add-edit';

@NgModule({
  declarations: [
    BinAddEditPage,
  ],
  imports: [
    IonicPageModule.forChild(BinAddEditPage),
  ],
})
export class TestPageModule {}
