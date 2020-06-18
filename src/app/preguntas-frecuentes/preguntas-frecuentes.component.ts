import { Component, OnInit } from '@angular/core';
import { SharedService } from '../shared.service';

@Component({
  selector: 'app-preguntas-frecuentes',
  templateUrl: './preguntas-frecuentes.component.html',
  styleUrls: ['./preguntas-frecuentes.component.css']
})
export class PreguntasFrecuentesComponent implements OnInit {

  constructor(private data: SharedService) { }

  config: any;

  ngOnInit() {
    // subscribing to config change
    this.data.currentConfig.subscribe(
      configuracion => {
        this.config = configuracion;
      }
    );
  }

}
