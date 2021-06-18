import { Component, Input, OnDestroy, OnInit, Pipe, PipeTransform } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs/Subject';
import { AutenticacionService } from '../autenticacion.service';
import { SharedService } from '../shared.service';

@Component({
  selector: 'app-producto-item',
  templateUrl: './producto-item.component.html',
  styleUrls: ['./producto-item.component.css'],
})
export class ProductoItemComponent implements OnInit, OnDestroy {
  private destroy$: Subject<void> = new Subject<void>();
  @Input() item;
  @Input() sesion;
  @Input() mensaje;
  @Input() relacionado;
  public iva_usuario: string = '';
  public search_term = '';
  constructor(private data: SharedService, private auth: AutenticacionService, private route: ActivatedRoute,) {}
  private replaceHash($entrada: string) {
    return $entrada ? $entrada.replace(new RegExp('/'), '~') : $entrada;
  }
  arrayCants = [];
  ngOnInit() {
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      const path = window.location.href;
      if (path.indexOf('/busqueda/') !== -1) {
        if (!params['id2'] && !params['padre']) {
          this.search_term = params['id'];
        } else {
          this.search_term = '';
        }
      } else {
        this.search_term = '';
      }
    });

    const categoria = (this.item.categorias && this.item.categorias.length > 0) ? this.item.categorias[0] : null;
    const padre = categoria ? (categoria.padre ? categoria.padre.nombre.split(' ').join('-') : 'Categoria') : 'Categoria';
    const hijo = categoria ? categoria.nombre.split(' ').join('-') : 'Subcategoria';
    this.item.fullLink = '/' + this.replaceHash(padre) + '/' + this.replaceHash(hijo) + '/' + this.replaceHash(this.item.titulo) + '/' + this.replaceHash(this.item.id);
    this.item.comprado    = false;
    this.item.cantidad    = this.item.cantSugerida ? parseInt(this.item.cantSugerida) : 1;
    if (this.item.cantPack !== '1') {
      this.item.cantidad  = this.item.cantPack ? parseInt(this.item.cantPack) : 1;
      for (let i = 0; i < 20; i++) {
        this.arrayCants[i] = this.item.cantidad * (i + 1);
      }
      for (let i = 0; i < 50; i++) {
        this.arrayCants[i + 20] = this.item.cantidad * (i + 3) * 10;
      }
    }
    this.item.oferta      = this.item.oferta === '1' ? true : false;
    this.item.imperdible  = this.item.oferta === false ? (this.item.novedad === '1' ? true : false) : false;
    this.item.precio_mostrado = this.item.precio ? this.item.precio.toString().replace(',', '.') : '0';
    this.data.lista.forEach((articulo_carrito) => {
      if (articulo_carrito.id === this.item.id) {
        this.item.comprado = true;
      }
    });
    this.data.currentUser.pipe(takeUntil(this.destroy$)).subscribe(($user) => {
      if ($user && $user['c'] === '1') {
        this.iva_usuario = '';
      } else {
        if ($user) {
          switch ($user['codCategoriaIva']) {
            case 'CF': this.iva_usuario = 'UNIT I.V.A. incluido'; break;
            case 'INR': this.iva_usuario = 'UNIT I.V.A. incluido'; break;
            case 'RS': this.iva_usuario = 'UNIT I.V.A. incluido'; break;
            case 'RSS': this.iva_usuario = 'UNIT I.V.A. incluido'; break;
            case 'RI': this.iva_usuario = 'UNIT + I.V.A.'; break;
            case 'EX': this.iva_usuario = 'UNIT I.V.A. incluido'; break;
            case 'PCE': this.iva_usuario = 'UNIT I.V.A. incluido'; break;
            case 'PCS': this.iva_usuario = 'UNIT I.V.A. incluido'; break;
            case 'EXE': this.iva_usuario = 'UNIT Final'; break;
            case 'SNC': this.iva_usuario = 'UNIT I.V.A. incluido'; break;
            default: this.iva_usuario = 'UNIT + I.V.A.';
          }
        }
      }
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
  }

  enterCheck() {
    this.newMessage(this.item);
  }
  newMessage(msg) {
    // const precio = msg.precio;
    if (this.sesion === true) {
      if (msg.cantidad) {
        if ((+msg.cantidad % +msg.cantPack === 0 &&  +msg.cantidad > +msg.cantMinima) || (+msg.cantMinima === +msg.cantidad)) {
          const body = new URLSearchParams();
          body.set('id_producto', msg.id);
          body.set('cantidad', msg.cantidad);
          this.auth.post('carrito/agregar_item', body)
          .then(($response) => {
            this.data.log('response carritoagregaritem producto-item', $response);

            const response = this.data.addMessage(msg);
            if (response.value) {
              this.mensaje.next(response.text);
            }
          })
          .catch(($error) => {
            this.data.log('error carritoagregaritem producto-item', $error);
          });
        } else {
          msg['incompleto'] = true;
        }
      }
    }else {
      this.data.toggleLoginModal();
    }
  }
  removeMessage(msg) {
    if (this.sesion === true) {
      const body = new URLSearchParams();
      body.set('id_producto', msg.id);
      this.auth.post('carrito/eliminar_item', body)
      .then(($response) => {
        this.data.log('response carritoeliminaritem compra', $response);
        this.data.removeMessage(msg);
        msg.comprado = false;
      })
      .catch(($error) => {
        this.data.log('error carritoeliminaritem compra', $error);
      });
    }else {
      this.data.toggleLoginModal();
    }
  }
  
  public revisarCantidad(e) {
    if (e.target && parseInt(e.target.value) < parseInt(e.target.min)) {
      e.target.value = e.target.min;
    }
  }
}

@Pipe({
  name: 'highlight',
  pure: true // true makes it pure and false makes it impure
})
export class HighlightSearchPipe implements PipeTransform {

  transform(text: string, search): string {
    if (search && text) {
      let pattern = search.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&');
      pattern = pattern.split(' ').filter((t) => {
        return t.length > 0;
      }).join('|');
      const regex = new RegExp(pattern, 'gi');

      return text.replace(regex, (match) => `<span class="search-highlight">${match}</span>`);
    } else {
      return text;
    }
  }

}