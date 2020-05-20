import { Component, OnInit } from '@angular/core';
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
  { url: 'como-comprar',   texto: 'Como comprar' }
];

const SOCIAL: Link[] = [
  { url: 'https://www.facebook.com/MessinaHnos',    texto: 'Facebook', urlImg: '/assets/images/iconos/facebook.png' },
  { url: 'https://www.instagram.com/messinahnos/',   texto: 'Instagram', urlImg: '/assets/images/iconos/instagram.png' },
  { url: 'https://twitter.com/MessinaHnos',     texto: 'Twitter', urlImg: '/assets/images/iconos/twitter.png' },
  { url: 'https://www.youtube.com/channel/UCXeHXMr9oWN-d-mHPU9VRuQ', texto: 'Youtube', urlImg: '/assets/images/iconos/youtube.png' }
];


@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class FooterComponent implements OnInit {
  LinkList = LINKS;
  SocialList = SOCIAL;
  nombre: String;
  email: String;
  suscripcion: string = 'SUSCRIBIRME';
  constructor(public data: SharedService) { }
  registrar() {
    this.data.toggleLoginModal();
  }
  suscribir () {
    this.suscripcion = 'ENVIANDO.';
    setTimeout(() => {
    this.suscripcion = 'ENVIANDO..';
    setTimeout(() => {
    this.suscripcion = 'ENVIANDO...';
    setTimeout(() => {
    this.suscripcion = 'ENVIADO';
    setTimeout(() => {
      this.email = '';
      this.nombre = '';
      this.suscripcion = 'SUSCRIBIRME';
    }, 500);
    }, 500);
    }, 500);
    }, 1000);

  }
  ngOnInit() {
  }

}
