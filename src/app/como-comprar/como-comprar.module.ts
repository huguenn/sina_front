import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ComoComprarComponent } from './como-comprar.component';

const routes: Routes = [
  {
    path: '',
    component: ComoComprarComponent,
  },
];

@NgModule({
  imports: [
    RouterModule.forChild(routes),
  ],
  exports: [RouterModule],
  declarations: [ComoComprarComponent],
})
export class ComoComprarModule { }
