import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PreguntasFrecuentesComponent } from './preguntas-frecuentes.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

const routes: Routes = [
  {
    path: '',
    component: PreguntasFrecuentesComponent
  }
];

@NgModule({
  imports: [
    RouterModule.forChild(routes),
    NgbModule.forRoot(),
  ],
  exports: [RouterModule],
  declarations: [PreguntasFrecuentesComponent]
})
export class PreguntasFrecuentesModule { }