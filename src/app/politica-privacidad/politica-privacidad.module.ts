import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { PoliticaPrivacidadComponent } from './politica-privacidad.component';

const routes: Routes = [
  {
    path: '',
    component: PoliticaPrivacidadComponent,
  },
];

@NgModule({
  imports: [
    RouterModule.forChild(routes),
    NgbModule.forRoot(),
  ],
  exports: [RouterModule],
  declarations: [PoliticaPrivacidadComponent],
})
export class PoliticaPrivacidadModule { }
