import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { PreguntasFrecuentesComponent } from './preguntas-frecuentes.component';

const routes: Routes = [
  {
    path: '',
    component: PreguntasFrecuentesComponent,
  },
];

@NgModule({
  imports: [
    RouterModule.forChild(routes),
    NgbModule.forRoot(),
  ],
  exports: [RouterModule],
  declarations: [PreguntasFrecuentesComponent],
})
export class PreguntasFrecuentesModule { }
