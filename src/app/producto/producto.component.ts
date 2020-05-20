import { Component, OnInit } from '@angular/core';
import { NgxGalleryOptions, NgxGalleryImage, NgxGalleryAnimation } from 'ngx-gallery';
import { SharedService } from '../shared.service';
import { Subject } from 'rxjs/Subject';
import { debounceTime } from 'rxjs/operator/debounceTime';
import { HttpClient } from '@angular/common/http';
import { Producto, ProductoCompleto } from '../data';
import { Router, ActivatedRoute } from '@angular/router';
import { AutenticacionService } from '../autenticacion.service';

@Component({
  selector: 'app-producto',
  templateUrl: './producto.component.html',
  styleUrls: ['./producto.component.css']
})
export class ProductoComponent implements OnInit {
  private _success = new Subject<string>();
  public iva_usuario: string = '';
  staticAlertClosed = false;
  successMessage: string;
  loginStatus: boolean = false;
  fullPath = [];
  galleryOptions: NgxGalleryOptions[];
  galleryImages: NgxGalleryImage[];
  producto: ProductoCompleto = new ProductoCompleto();
  relacionados: Producto[] = new Producto()[4];
  tipo_usuario: Boolean = false;

  full_link: string = '';
    constructor(private data: SharedService, private http: HttpClient, private route: ActivatedRoute, private auth: AutenticacionService) {}
  respuesta = ($response)  => {
      this.relacionados = $response.response.productosRelacionados;
      this.relacionados.forEach(item => {
        item['categoria'] = {
          nombre: 'PRODUCTO RELACIONADO'
        };
      });
      this.producto = $response.response;
      this.full_link = 'http://www.sina.com.ar/producto/'
        + (this.producto['categoria'] ? this.producto['categoria'].nombre.split(' ').join('-').toUpperCase() : '') + '/' + this.producto['id'];
      this.producto.cantidad = this.producto['cantSugerida'] ? this.producto['cantSugerida'] : 1;
      this.producto.comprado = false;
      this.fullPath = ['Limpieza', this.producto['categoria'] ? this.producto['categoria'].padre.nombre : '', this.producto['categoria'] ? this.producto['categoria'].nombre : ''];
      this.galleryImages = [
        {
        small: this.producto['urlImagen'],
        medium: this.producto['urlImagen'],
        big: this.producto['urlImagen'],
        },
        {
        small: this.producto['urlImagen'],
        medium: this.producto['urlImagen'],
        big: this.producto['urlImagen'],
        },
        {
        small: this.producto['urlImagen'],
        medium: this.producto['urlImagen'],
        big: this.producto['urlImagen'],
        },
        {
        small: this.producto['urlImagen'],
        medium: this.producto['urlImagen'],
        big: this.producto['urlImagen'],
        }];
    }
    ngOnInit(): void {
      this.data.updatePageTitle('Sina', 'Comprá con entrega a todo el país, hacé tu pedido online!');
      this.auth.userTypeStatus.subscribe( response => {this.tipo_usuario = response, error => { this.data.log('usertypestatus error producto', error); }; });
      // subscribing to data on loginStatus
      this.data.currentLogin.subscribe(
        status => {
          this.loginStatus = status;
          this.route.params.subscribe(params => {
            const id = (+params['id2']);
            const id2 = (params['id']);
            this.data.updatePageTitle(id2, 'Comprá ' + id2 + ' con entrega a todo el país, hacé tu pedido online!');
            const $public = this.loginStatus ? '' : 'public/';
            this.auth.get($public + 'producto/detalles/' + id)
            .then(this.respuesta)
            .catch($error => {
              this.data.log('currentloginstatus error producto', $error);
            });
          });
        }
      );
      // getting data via get request
      /*this.http.get('assets/data/producto.json')
      .subscribe(res => {
        var response = res as any
          //this.producto = response.detalles
          this.relacionados = response.relacionados
          this.relacionados.forEach((value, index, array) => value.comprado = false)
        });*/

      this.galleryOptions = [
          {
              width: '1000px',
              height: '600px',
              thumbnailsColumns: 4,
              imageAnimation: NgxGalleryAnimation.Slide
          },
          // max-width 800
          {
              breakpoint: 800,
              width: '100%',
              height: '600px',
              imagePercent: 80,
              thumbnailsPercent: 20,
              thumbnailsMargin: 20,
              thumbnailMargin: 20
          },
          // max-width 400
          {
              breakpoint: 400,
              preview: false
          }
      ];

    this.galleryImages = [];

    setTimeout(() => this.staticAlertClosed = true, 5000);
    this._success.subscribe((message) => this.successMessage = message);
    debounceTime.call(this._success, 5000).subscribe(() => this.successMessage = null);

    this.data.currentUser.subscribe($user => {
      if ($user) {
        switch ($user['codCategoriaIva']) {
          case 'CF':
          case 'INR':
          case 'RSS': this.iva_usuario = 'UNIT I.V.A. incluido'; break;
          case 'RI':
          case 'EX':
          case 'PCE':
          case 'PCS':
          case 'EXE':
          case 'SNC':
          default: this.iva_usuario = 'UNIT + I.V.A.';
        }
      }
    });

  }

  alertClicked() {
    this.successMessage = null;
    this.data.toggleCarritoShow();
  }
  
  newMessage(msg) {
    const precio = msg.precio;
    if (this.loginStatus === true) {
      if (msg.cantidad) {
        if ((+msg.cantidad % +msg.cantPack === 0 &&  +msg.cantidad > +msg.cantMinima) || (+msg.cantMinima === +msg.cantidad)) {
          msg.comprado = true;
          this.data.changeMessage(msg.cantidad ? msg.cantidad : 1, msg.titulo, msg.precio, precio * (+msg.cantidad), msg.id);
          this._success.next(`Agregado al Carrito!`);
        } else {
          msg['incompleto'] = true;
        }
      }
    } else {
      this.data.toggleLoginModal();
    }
  }
  removeMessage(msg) {
    if (this.loginStatus === true) {
      this.data.removeMessage(msg);
      msg.comprado = false;
    } else {
      this.data.toggleLoginModal();
    }
  }
}
