import { CommonModule } from '@angular/common';  
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EnviosComponent } from './envios.component';

const routes: Routes = [
  {
    path: '',
    component: EnviosComponent,
  },
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
  ],
  exports: [RouterModule],
  declarations: [EnviosComponent],
})
export class EnviosModule { }
