import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { ContactoComponent } from './contacto.component';

const routes: Routes = [
  {
    path: '',
    component: ContactoComponent
  }
];

@NgModule({
  imports: [
    RouterModule.forChild(routes),
    CommonModule,
    FormsModule
  ],
  exports: [RouterModule],
  declarations: [ContactoComponent]
})
export class ContactoModule { }