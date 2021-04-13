import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs/Subject';
import { AutenticacionService } from '../autenticacion.service';
import { SharedService } from '../shared.service';

@Component({
  selector: 'app-contacto',
  templateUrl: './contacto.component.html',
  styleUrls: ['./contacto.component.css'],
})
export class ContactoComponent implements OnInit, OnDestroy {
    private destroy$: Subject<void> = new Subject<void>();
    nombre: any;
    email: any;
    telefono: any;
    mensaje: any;
    respuesta: any;
    error: any;
    config: any;
    contactoEnviado: boolean = false;
    disableButton: boolean = false;
  constructor(
      private auth: AutenticacionService,
      private data: SharedService,
      private http:   HttpClient,
) { }

  ngOnInit() {
    // subscribing to config change
    this.data.currentConfig.pipe(takeUntil(this.destroy$)).subscribe(
      (configuracion) => {
        this.config = configuracion;
      },
    );
  }

  ngOnDestroy() {
    this.destroy$.next();
  }

  enviar() {
    this.disableButton = true;
    this.respuesta = '';
    this.error = '';
    const body = new URLSearchParams();
    if (this.nombre) { body.set('nombre', this.nombre); }
    if (this.email) { body.set('email', this.email); }
    body.set('telefono', this.telefono);
    if (this.mensaje) { body.set('mensaje', this.mensaje); }
    const headers = new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' });

    this.http.post(this.auth.getPath('public/cliente/contacto/nuevo_mensaje/'), body.toString(), {headers, observe: 'response'})
    .pipe(takeUntil(this.destroy$)).subscribe(($response: any) => {
      this.contactoEnviado = true;
      this.disableButton = false;
      this.respuesta = $response.body.response.message;
    }, ($error) => {
        this.disableButton = false;
        if (typeof $error.error.response.error === 'string') {
        this.error = $error.error.response.error;
      } else {
        Object.keys($error.error.response.error).forEach((element) => {
          this.error += $error.error.response.error[element] + ' ';
        });
      }
    });

    if (this.nombre && this.email) {

      const sendyUrl = 'https://mailing.leren.com.ar/';

      const body = new URLSearchParams();
      body.set('api_key', 'RCUuYdks5u0kwkTgCVlw ');
      body.set('name', this.nombre);
      body.set('email', this.email);
      body.set('list', 'cqW4SwUCeaOE36rhy8922C3A');
      body.set('country', 'AR');
      body.set('referrer', 'https://www.sina.com.ar/');
      body.set('boolean', 'true');

      if (this.data.statusLogin) {
        body.set('logueado', 'SI');

        this.auth.get('sendy/cliente/getDatosNewsletter')
        .then((result) => {
          this.data.log('response getDatosNewsletter contacto', result);

          body.set('lista_precios', result.response.lista_precios);
          body.set('tipo_lista', result.response.tipo_lista);
          body.set('perfil', result.response.perfil);

          this.auth.post(sendyUrl + 'subscribe', body)
          .then(($response) => {
            this.data.log('response suscribir contacto', $response);
          })
          .catch(($error) => {
            this.data.log('error suscribir contacto', $error);
          });
        })
        .catch((error) => {
          this.data.log('error getDatosNewsletter contacto', error);

          this.auth.post(sendyUrl + 'subscribe', body)
          .then(($response) => {
            this.data.log('response suscribir contacto', $response);
          })
          .catch(($error) => {
            this.data.log('error suscribir contacto', $error);
          });
        });
      } else {
        body.set('logueado', 'NO');

        this.auth.post(sendyUrl + 'subscribe', body)
        .then(($response) => {
          this.data.log('response suscribir contacto', $response);
        })
        .catch(($error) => {
          this.data.log('error suscribir contacto', $error);
        });
      }
    }
  }

}
