import { Component, OnInit, OnChanges, AfterViewInit, HostListener, Input, ViewChild, ElementRef} from '@angular/core';
import { SharedService, cliente, Configuracion } from '../shared.service';
import { Dato } from '../shared.service';
import {  } from '@angular/core/src/metadata/lifecycle_hooks';
import { PopoverModule, PopoverContent, Popover } from 'ngx-popover';
import { CompraItem, Carrito, Link, MenuItem, MenuSection } from '../data';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AutenticacionService } from '../autenticacion.service';
import { element } from 'protractor';
import { link } from 'fs';
import { Router } from '@angular/router';
import { MenuService } from '../menu.service';
import { Subscription } from 'rxjs/Subscription';
import { Observable } from 'rxjs/Rx';


const COMPRA: Carrito = {
  fecha: 'hoy',
  list: [
    {texto: 'Escobas', url: '', precio: '19,90'},
    {texto: 'Escobas', url: '', precio: '19,90'},
    {texto: 'Escobas', url: '', precio: '19,90'},
    {texto: 'Escobas', url: '', precio: '19,90'},
    {texto: 'Escobas', url: '', precio: '19,90'},
    {texto: 'Escobas', url: '', precio: '19,90'},
    {texto: 'Escobas', url: '', precio: '19,90'},
    {texto: 'Escobas', url: '', precio: '19,90'}
  ]
};

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnChanges, OnInit, AfterViewInit {
  @Input() greetMessage: Dato[];
  @Input() headerStatus: Number;

  @ViewChild('inputCantidadHeader') inputCantidadHeader: ElementRef;
  inputSubHeader: Subscription;
  @ViewChild('inputCantidadHeaderVerde') inputCantidadHeaderVerde: ElementRef;
  inputSubHeaderVerde: Subscription;
  
  menuToggle = false;
  CompraList = COMPRA;
  LinkList  = [];
  MenuFilter = '/filter';
  MenuList  = [];
  MenuTitle = 'Limpieza';
  MenuClass = 'header__filter--hover';
  headerPosition = '';
  SideState =     'menuSidebar';
  SideStateIcon = '';
  UserLog = false;
  carritoStatus = false;
  SearchFocus = '';
  SearchModel = '';
  resultados: any;
  config: any;
  // user Data
  UserName: string;
  UserJob: string;
  
  actualRoute = '/';

  menuSelectedItem = 0;

  popup = {
    cuenta: false,
    compra: false
  };
  popup2 = {
    cuenta: false,
    compra: false
  };
  message: string;

  selectedItem = undefined;
  selectItem($item) {
    if (this.selectedItem) {
      this.selectedItem.show = false;
    }
    this.selectedItem = $item;
    this.selectedItem.show = true;
  }


  cuenta = [
    { texto: 'Mi cuenta', id: 0 },
    { texto: 'Mis datos', id: 1 },
    { texto: 'Mis frecuentes', id: 2 },
    { texto: 'Ultimas compras', id: 3 },
    { texto: 'Cerrar sesión', id: 4 }
  ];
  headerCuentaLink(id: number) {
    this.router.navigateByUrl('/', {skipLocationChange: true}).then(() => this.router.navigate(['/cuenta'], { queryParams: {tab: id}}));
  }
  texto_busqueda: string = '';
  ResultadoBusqueda: any;
  enterBusqueda(event) {
    if (event.keyCode == 13) {
      this.router.navigate(['/busqueda/' + this.texto_busqueda]);
      this.cerrarBusqueda();
    }
  }
  clickBusqueda(item) {
    const ruta = '/articulo/' + (item.categorias ? item.categorias[0].nombre.split(' ').join('-') : '') + '/' + item['id'];
    this.router.navigate([ruta]);
    this.cerrarBusqueda();

  }
  buscarPalabra(event) {
    if (event.target.value.length >= 3) {
      const body = new URLSearchParams();
      body.set('frase', this.texto_busqueda);
      this.auth.post('producto/busqueda', body)
      .then($response => {
          this.ResultadoBusqueda = $response.body.response.slice(0, 6);
      })
      .catch($error => {
        this.data.log('error buscarPalabra header:', $error);
      });
    }
  }
  cerrarBusqueda() {
    this.ResultadoBusqueda = [];
  }
  constructor(private menu: MenuService, private router: Router, public data: SharedService, private auth: AutenticacionService) {
    this.MenuClass = '';
    this.menu.notifyObservable$.subscribe($cambio => {
      if ($cambio) {
        this.closeCompra();
      }
    });
    this.menu.LinkList$.subscribe(($cambio_link: any) => {
      if ($cambio_link) {
        this.LinkList = $cambio_link;
      }

    });
    this.menu.MenuList$.subscribe(($cambio_menu: any) => {
      if ($cambio_menu) {
        this.MenuList = $cambio_menu;
      }
    });
    // subscribing to data on carritoStatus
    this.data.currentCarrito.subscribe(
      status => {
        this.carritoStatus = status;
        if ( (this.headerStatus > 90 && window.innerWidth > 960) ||
        (this.headerStatus > 0  && window.innerWidth <= 960) ) {
          this.popup.compra = status;
        } else {
          this.popup2.compra = status;
        }
      }
    );
    // subscribing to data on carritoStatus?? debe ser loginStatus algo asi
    this.data.currentLogin.subscribe(
      status => {
        this.UserLog = status;
        if (this.data.user) {
          try {
            this.UserName = this.data.user.razonSocial;
            this.UserJob  = this.data.user.categoriaIva;
            this.representado = JSON.parse(localStorage.getItem('login')).administrativo;
          } catch (e) {
            this.data.log('error userlog header:', e);
          }
        }
      }
    );
    this.data.currentUser.subscribe($user => {
      if (this.data.user) {
        try {
          this.data.log('user viejo header:', this.data.user.razonSocial);
          this.UserName = $user['razonSocial'];
          this.UserJob  = $user['categoriaIva'];
        }catch (e) {
          this.data.log('error user viejo header:', e);
        }
      }
    });

  }

  ngOnInit() {
    // subscribing to router change
    this.router.events.subscribe(val => {
      if(val['url']) {
        if (this.actualRoute !== val['url']) {
          this.actualRoute = (val['url']);
        }
      }
    });

    // subscribing to config change
    this.data.currentConfig.subscribe(
      configuracion => {
        this.config = configuracion;
      }
    );
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.inputSubHeader = Observable.fromEvent(this.inputCantidadHeader.nativeElement, 'input')
      .debounceTime(1000)
      .subscribe(
        () => {
          const body = new URLSearchParams();
          let array = [];
          for(let item of this.data.lista) {
            array.push({id_producto: item.id, cantidad: item.cantidad});
          }
          body.set('lista', JSON.stringify(array));

          this.auth.post('carrito/update_cantidades', body)
          .then($response => {
            this.data.log('response carritoupdatecantidades header debounced', $response);
          })
          .catch($error => {
            this.data.log('error carritoupdatecantidades header debounced', $error);
          });
        }
      );
      this.inputSubHeaderVerde = Observable.fromEvent(this.inputCantidadHeaderVerde.nativeElement, 'input')
      .debounceTime(1000)
      .subscribe(
        () => {
          const body = new URLSearchParams();
          let array = [];
          for(let item of this.data.lista) {
            array.push({id_producto: item.id, cantidad: item.cantidad});
          }
          body.set('lista', JSON.stringify(array));

          this.auth.post('carrito/update_cantidades', body)
          .then($response => {
            this.data.log('response carritoupdatecantidades header debounced verde', $response);
          })
          .catch($error => {
            this.data.log('error carritoupdatecantidades header debounced verde', $error);
          });
        }
      );
    }, 2000);
  }

  representado: boolean = false;
  // auxiliar value
  lastInput: Boolean = false;
  ngOnChanges() {
    if ( (this.headerStatus > 90 && window.innerWidth > 960) ||
        (this.headerStatus > 0  && window.innerWidth <= 960)
      ) {
      this.headerPosition = 'header--fixed';
      if (this.popup.cuenta) {
        this.popup2.cuenta = true;
      }
      if (this.popup.compra) {
        this.popup2.compra = true;
      }
      this.popup.cuenta = false;
      this.popup.compra = false;
    }else {
      if (this.popup2.cuenta) {
        this.popup.cuenta = true;
      }
      if (this.popup2.compra) {
        this.popup.compra = true;
      }
      this.headerPosition = '';
      this.popup2.cuenta = false;
      this.popup2.compra = false;
    }
  }
  actualIndex: number = 0;
  changeStyle($event, itemIndex) {
    this.actualIndex = itemIndex;

    if (window.innerWidth > 960) {
      this.MenuClass = $event.type == 'mouseover' ? 'header__filter--hover' : '';
      if (this.actualIndex >= 0) {
        this.MenuList   = this.LinkList[this.actualIndex].links;
        this.MenuTitle  = this.LinkList[this.actualIndex].texto;
      }
    }
  }
  changeStyleMenu($event, itemIndex) {
    if (window.innerWidth > 960) {
      this.MenuClass = $event.type == 'mouseover' ? 'header__filter--hover' : '';
      if (itemIndex >= 0) {
        this.MenuList   = this.LinkList[this.actualIndex].links;
        this.MenuTitle  = this.LinkList[this.actualIndex].texto;
      }else {
        this.MenuList = undefined;
      }
    }
  }
  changeStyleClick(itemIndex) {
    if (window.innerWidth >  960) {
        this.MenuList   = this.LinkList[itemIndex].links;
        this.MenuTitle  = this.LinkList[itemIndex].texto;
        this.MenuClass = this.menuToggle === false ? 'header__filter--hover' : '';
      }else {
    }

  }
  itemClicked() {
    this.MenuClass = '';
  }
  closeCompra() {
    this.popup.compra = false;
    this.popup2.compra = false;
    this.popup.cuenta = false;
    this.popup2.cuenta = false;
  }
  toggle(component) {
    if (this.UserLog) {
      if (component === 'cuenta') {
        this.popup.cuenta = !this.popup.cuenta;
        this.popup.compra = false;
      }else {
        this.popup.compra = !this.popup.compra;
        this.popup.cuenta = false;
      }
    }else {
      this.data.toggleLoginModal();
    }
  }
  toggle2(component) {
    if (this.UserLog) {
      if (component === 'cuenta') {
        this.popup2.cuenta = !this.popup2.cuenta;
        this.popup2.compra = false;
      }else {
        this.popup2.compra = !this.popup2.compra;
        this.popup2.cuenta = false;
      }
    }else {
      this.data.toggleLoginModal();
    }
  }
  toggleMenu() {
    this.data.toggleSideBar();
  }
  removeMessage(msg) {
    const body = new URLSearchParams();
    body.set('id_producto', msg.id);
    this.auth.post('carrito/eliminar_item', body)
    .then($response => {
      this.data.log('response carritoeliminaritem header', $response);
      this.data.removeMessage(msg);
    })
    .catch($error => {
      this.data.log('error carritoeliminaritem header', $error);
    });
  }
  listFilter($array) {
    if ($array.length > 8) {
      return $array.slice($array.length - 8, $array.length);
    } else {
      return $array;
    }
  }
  focusFunction() {
    this.SearchFocus = 'onSearchFocus';
  }
  focusclickFunction() {
      this.SearchFocus = 'onSearchFocus';
  }
  focusoutFunction() {
    setTimeout(() => {
      this.SearchFocus = '';
      this.cerrarBusqueda();
    }, 1000);
  }
  updatePrecio($precio, $cantidad): string {
    const subtotal = $precio * $cantidad;
    return this.formatMoney(subtotal);
  }
  formatMoney(n, c = undefined, d = undefined, t = undefined) {
      let s, i, j;
      c = isNaN(c = Math.abs(c)) ? 2 : c,
      d = d == undefined ? ',' : d,
      t = t == undefined ? '.' : t,
      s = n < 0 ? '-' : '',
      i = String(parseInt(n = Math.abs(Number(n) || 0).toFixed(c))),
      j = (j = i.length) > 3 ? j % 3 : 0;

    return s + (j ? i.substr(0, j) + t : '') + i.substr(j).replace(/(\d{3})(?=\d)/g, '$1' + t) + (c ? d + Math.abs(n - +i).toFixed(c).slice(2) : '');
  }
}
