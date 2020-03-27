import { Component, OnInit, Input } from '@angular/core';
import { Item } from '../data';
import { SharedService } from '../shared.service';
import { AutenticacionService } from '../autenticacion.service';

@Component({
  selector: 'producto',
  templateUrl: './producto-item.component.html',
  styleUrls: ['./producto-item.component.css']
})
export class ProductoItemComponent implements OnInit {
  @Input() item;
  @Input() sesion;
  @Input() mensaje;
  @Input() relacionado;
  public iva_usuario: string = '';
  constructor(private data: SharedService, private auth: AutenticacionService) {}
  private replaceHash($entrada: string) {
    return $entrada ? $entrada.replace(new RegExp('/'), '~') : $entrada;
  }
  ngOnInit() {
    const padre = this.item.categoria ? (this.item.categoria.padre ? this.item.categoria.padre.nombre.split(' ').join('-').toUpperCase() : 'CATEGORIA') : 'CATEGORIA';
    const hijo = this.item.categoria ? this.item.categoria.nombre.split(' ').join('-').toUpperCase() : 'SUBCATEGORIA';
    this.item.fullLink = '/' + this.replaceHash(padre) + '/' + this.replaceHash(hijo) + '/' + this.replaceHash(this.item.titulo) + '/' + this.replaceHash(this.item.id);
    this.item.comprado    = false;
    this.item.cantidad    = this.item.cantSugerida ? this.item.cantSugerida : 1;
    this.item.oferta      = this.item.oferta === '1' ? true : false;
    this.item.imperdible  = this.item.oferta === false ? (this.item.novedad === '1' ? true : false) : false;
    this.item.precio_mostrado = this.item.precio ? this.item.precio.toString().replace(',', '.') : '0';
    this.data.lista.forEach(articulo_carrito => {
      if (articulo_carrito.id === this.item.id) {
        this.item.comprado = true;
      }
    });
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
  enterCheck() {
    this.newMessage(this.item);
  }
  newMessage(msg) {
    const precio = msg.precio;
    if (this.sesion === true) {
      const response = this.data.addMessage(msg);
      if (response.value) {
        this.mensaje.next(response.text);
      }
    }else {
      this.data.toggleLoginModal();
    }
  }
  removeMessage(msg) {
    if (this.sesion === true) {
      this.data.removeMessage(msg);
      msg.comprado = false;
    }else {
      this.data.toggleLoginModal();
    }
  }


}
