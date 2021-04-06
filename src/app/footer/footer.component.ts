import { Component, OnInit } from '@angular/core';
import { AutenticacionService } from '../autenticacion.service';
import { SharedService } from '../shared.service';

export class Link {
  url:    string;
  texto:  string;
  urlImg?: string;
}
const LINKS: Link[] = [
  { url: '',   texto: 'Inicio' },
  { url: 'nosotros',   texto: 'Nosotros' },
  { url: 'envios',   texto: 'Envíos' },
  { url: 'como-comprar',   texto: 'Como comprar' },
];

const SOCIAL: Link[] = [
  { url: 'https://www.facebook.com/MessinaHnos',    texto: 'Facebook', urlImg: '/assets/images/iconos/facebook.png' },
  { url: 'https://www.instagram.com/messinahnos/',   texto: 'Instagram', urlImg: '/assets/images/iconos/instagram.png' },
  { url: 'https://twitter.com/MessinaHnos',     texto: 'Twitter', urlImg: '/assets/images/iconos/twitter.png' },
  { url: 'https://www.youtube.com/channel/UCXeHXMr9oWN-d-mHPU9VRuQ', texto: 'Youtube', urlImg: '/assets/images/iconos/youtube.png' },
];

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css'],
})
export class FooterComponent implements OnInit {
  LinkList = LINKS;
  SocialList = SOCIAL;
  nombre: string;
  email: string;
  suscripcion: string = 'SUSCRIBIRME';
  enableSuscribir: boolean = true;
  _existDesktop: boolean = false;
  _existMobile: boolean = false;
  year: number;
  constructor(public data: SharedService, private auth: AutenticacionService) {
    if (window.innerWidth <= 992) {
      this._existDesktop = false;
      this._existMobile = true;
    } else {
      this._existDesktop = true;
      this._existMobile = false;
    }
    this.year = new Date().getFullYear();
  }
  registrar() {
    this.data.toggleLoginModal();
  }
  suscribir() {
    this.enableSuscribir = false;

    if (this.nombre && this.email) {

      let resultado = 'OK';

      const sendyUrl = 'https://mailing.leren.com.ar/';

      const body = new URLSearchParams();
      body.set('api_key', 'RCUuYdks5u0kwkTgCVlw ');
      body.set('name', this.nombre);
      body.set('email', this.email);
      body.set('list', 'cqW4SwUCeaOE36rhy8922C3A');
      body.set('country', 'AR');
      body.set('referrer', 'https://sina.leren.com.ar/');
      body.set('boolean', 'true');

      if (this.data.statusLogin) {
        body.set('logueado', 'SI');

        this.auth.get('sendy/cliente/getDatosNewsletter')
        .then((result) => {
          this.data.log('response getDatosNewsletter footer', result);

          body.set('lista_precios', result.response.lista_precios);
          body.set('tipo_lista', result.response.tipo_lista);
          body.set('perfil', result.response.perfil);

          this.auth.post(sendyUrl + 'subscribe', body)
          .then(($response) => {
            this.data.log('response suscribir footer', $response);
          })
          .catch(($error) => {
            this.data.log('error suscribir footer', $error);
            resultado = $error.error.text;
          });
        })
        .catch((error) => {
          this.data.log('error getDatosNewsletter footer', error);

          this.auth.post(sendyUrl + 'subscribe', body)
          .then(($response) => {
            this.data.log('response suscribir footer', $response);
          })
          .catch(($error) => {
            this.data.log('error suscribir footer', $error);
            resultado = $error.error.text;
          });
        });
      } else {
        body.set('logueado', 'NO');

        this.auth.post(sendyUrl + 'subscribe', body)
        .then(($response) => {
          this.data.log('response suscribir footer', $response);
        })
        .catch(($error) => {
          this.data.log('error suscribir footer', $error);
          resultado = $error.error.text;
        });
      }

      this.suscripcion = 'ENVIANDO.';
      setTimeout(() => {
      this.suscripcion = 'ENVIANDO..';
      setTimeout(() => {
      this.suscripcion = 'ENVIANDO...';
      setTimeout(() => {
      this.suscripcion = resultado === 'Already subscribed.' ? 'YA ESTÁS SUSCRITO/A!' : 'ENVIADO!';
      setTimeout(() => {
        this.email = '';
        this.nombre = '';
        // this.suscripcion = 'SUSCRIBIRME';
        // this.enableSuscribir = true;
      }, 500);
      }, 500);
      }, 500);
      }, 1000);
    } else {
      this.suscripcion = 'CAMPOS INCOMPLETOS!';
      setTimeout(() => {
        this.suscripcion = 'SUSCRIBIRME';
        this.enableSuscribir = true;
      }, 3000);
    }

  }
  ngOnInit() {
  }

}
