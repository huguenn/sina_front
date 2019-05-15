import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { AutenticacionService } from '../autenticacion.service';
import { SharedService } from '../shared.service';

@Component({
  selector: 'app-confirmacion',
  templateUrl: './confirmacion.component.html',
  styleUrls: ['./confirmacion.component.css']
})
export class ConfirmacionComponent implements OnInit {
  sub: Subscription
  respuesta: string = "Esperando respuesta"
  constructor(
    private route:  ActivatedRoute,
    private router: Router,
    private http:   HttpClient,
    private auth:   AutenticacionService,
    private data: SharedService
  ) { }

  ngOnInit() {
    this.data.updatePageTitle()
    this.data.closeLoginModal()
    this.sub = this.route
    .queryParams
    .subscribe(params => {
      if(params['codigo'] || 0) {
        this.auth.get("public/cliente/confirmar_email/" + params['codigo'])
        .then(($response)  =>{
          this.respuesta = $response.response
        })
        .catch($error => {
          this.respuesta = $error.error.response
          console.log($error)
        })        

      }
    });
  }
  ngOnDestroy() {
    this.sub.unsubscribe();
  }

}
