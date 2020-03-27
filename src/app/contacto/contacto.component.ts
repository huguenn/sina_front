import { Component, OnInit } from '@angular/core';
import { SharedService } from '../shared.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AutenticacionService } from '../autenticacion.service';


@Component({
  selector: 'app-contacto',
  templateUrl: './contacto.component.html',
  styleUrls: ['./contacto.component.css']
})
export class ContactoComponent implements OnInit {
    nombre: any;
    email: any;
    telefono: any;
    mensaje: any;
    respuesta: any;
    error: any;
  constructor(
      private auth: AutenticacionService,
      private data: SharedService,
      private http:   HttpClient,
) { }

  ngOnInit() {
  }
  enviar() {
      this.respuesta = '';
      this.error = '';
      const body = new URLSearchParams();
      body.set('nombre', this.nombre);
      body.set('email', this.email);
      body.set('telefono', this.telefono);
      body.set('mensaje', this.mensaje);
      const headers = new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' });

      this.http.post(this.auth.getPath('public/cliente/contacto/nuevo_mensaje/'), body.toString(), {headers, observe: 'response'})
      .subscribe(($response: any) => {
        this.respuesta = $response.body.response.message;
      }, ($error) => {
          if (typeof $error.error.response.error === 'string') {
          this.error = $error.error.response.error;
        } else {
          Object.keys($error.error.response.error).forEach(element => {
            this.error += $error.error.response.error[element] + ' ';
          });
        }

      });
  }

}
