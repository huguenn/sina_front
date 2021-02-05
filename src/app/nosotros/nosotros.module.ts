import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NosotrosComponent } from './nosotros.component';

const routes: Routes = [
  {
    path: '',
    component: NosotrosComponent,
  },
];

@NgModule({
  imports: [
    RouterModule.forChild(routes),
    CommonModule,
  ],
  exports: [RouterModule],
  declarations: [NosotrosComponent],
})
export class NosotrosModule { }
