import { AfterViewInit, Component, ElementRef, Input, OnChanges, OnInit, ViewChild} from '@angular/core';
import { OnDestroy } from '@angular/core/src/metadata/lifecycle_hooks';
import { Router } from '@angular/router';
import { takeUntil } from 'rxjs/operators';
import { Observable } from 'rxjs/Rx';
import { Subject } from 'rxjs/Subject';
import { Subscription } from 'rxjs/Subscription';
import { AutenticacionService } from '../autenticacion.service';
import { Carrito } from '../data';
import { MenuService } from '../menu.service';
import { Dato, SharedService } from '../shared.service';

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
    {texto: 'Escobas', url: '', precio: '19,90'},
  ],
};

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent implements OnChanges, OnInit, AfterViewInit, OnDestroy {
  private destroy$: Subject<void> = new Subject<void>();
  @Input() greetMessage: Dato[];
  @Input() headerStatus: number;

  @ViewChild('inputCantidadHeader') inputCantidadHeader: ElementRef;
  inputSubHeader: Subscription;
  @ViewChild('inputCantidadHeaderVerde') inputCantidadHeaderVerde: ElementRef;
  inputSubHeaderVerde: Subscription;

  _existDesktop: boolean = false;
  _existMobile: boolean = false;

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
    compra: false,
  };
  popup2 = {
    cuenta: false,
    compra: false,
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
    { texto: 'Cerrar sesión', id: 4 },
  ];
  headerCuentaLink(id: number) {
    this.router.navigateByUrl('/', {skipLocationChange: true}).then(() => this.router.navigate(['/cuenta'], { queryParams: {tab: id}}));
  }
  texto_busqueda: string = '';
  ResultadoBusqueda: any;
  enterBusqueda(event) {
    if (event.keyCode == 13) {
      this.buscarTexto();
    }
  }
  clickBusqueda(item) {
    const ruta = '/articulo/' + ((item.categorias && item.categorias.length > 0) ? item.categorias[0].nombre.split(' ').join('-') : '') + '/' + item['id'];
    this.router.navigate([ruta]);
    this.cerrarBusqueda();

  }
  buscarPalabra(event) {
    if (event.target.value.length >= 3) {
      const body = new URLSearchParams();
      body.set('frase', this.texto_busqueda);
      this.auth.post('producto/busqueda', body)
      .then(($response) => {
          this.ResultadoBusqueda = $response.body.response.slice(0, 6);
      })
      .catch(($error) => {
        this.data.log('error buscarPalabra header:', $error);
      });
    }
  }
  buscarTexto() {
    this.texto_busqueda = this.texto_busqueda.replace('/', ' ');
    let arraySecciones = [
      'ofertas',
      'novedades'
    ];
    let arrayFamilias = [
      'ofertas',
      'novedades',
      'limpieza',
      'bazar',
      'textil',
      'liquidos', 'líquidos',
      'jardin y riego', 'jardín y riego',
      'profesional',
      'mas productos', 'más productos'
    ]

    if (arraySecciones.indexOf(this.texto_busqueda.toLowerCase()) !== -1) {
      let toUrl = this.texto_busqueda.toLowerCase();
      this.router.navigateByUrl('/', {skipLocationChange: true})
      .then(() => {   
        this.router.navigate(['/' + toUrl]);
      });
    } else if (arrayFamilias.indexOf(this.texto_busqueda.toLowerCase()) !== -1) {
      let toUrl = this.texto_busqueda.charAt(0).toUpperCase() + this.texto_busqueda.slice(1).toLowerCase();
      toUrl = toUrl.replace('á', 'a');
      toUrl = toUrl.replace('é', 'e');
      toUrl = toUrl.replace('í', 'i');
      toUrl = toUrl.replace('ó', 'o');
      toUrl = toUrl.replace('ú', 'u');
      this.router.navigateByUrl('/', {skipLocationChange: true})
      .then(() => {
        this.router.navigate(['/' + toUrl]);
      });
    } else {
      let toUrl = this.texto_busqueda;
      this.router.navigateByUrl('/', {skipLocationChange: true})
      .then(() => {
        this.router.navigate(['/busqueda/' + toUrl]);
      });
    }

    this.cerrarBusqueda();
  }
  cerrarBusqueda() {
    this.ResultadoBusqueda = [];
    this.texto_busqueda = '';
  }
  constructor(private menu: MenuService, private router: Router, public data: SharedService, private auth: AutenticacionService) {
    if (window.innerWidth <= 992) {
      this._existDesktop = false;
      this._existMobile = true;
    } else {
      this._existDesktop = true;
      this._existMobile = false;
    }
    this.MenuClass = '';
    this.menu.notifyObservable$.pipe(takeUntil(this.destroy$)).subscribe(($cambio) => {
      if ($cambio) {
        this.closeCompra();
      }
    });
    this.menu.LinkList$.pipe(takeUntil(this.destroy$)).subscribe(($cambio_link: any) => {
      if ($cambio_link) {
        this.LinkList = $cambio_link;
      }

    });
    this.menu.MenuList$.pipe(takeUntil(this.destroy$)).subscribe(($cambio_menu: any) => {
      if ($cambio_menu) {
        this.MenuList = $cambio_menu;
      }
    });
    // subscribing to data on carritoStatus
    this.data.currentCarrito.pipe(takeUntil(this.destroy$)).subscribe(
      (status) => {
        this.carritoStatus = status;
        if ( (this.headerStatus > 90 && window.innerWidth > 960) ||
        (this.headerStatus > 0  && window.innerWidth <= 960) ) {
          this.popup.compra = status;
        } else {
          this.popup2.compra = status;
        }
      },
    );
    // subscribing to data on carritoStatus?? debe ser loginStatus algo asi
    this.data.currentLogin.pipe(takeUntil(this.destroy$)).subscribe(
      (status) => {
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
      },
    );
    this.data.currentUser.pipe(takeUntil(this.destroy$)).subscribe(($user) => {
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
    this.router.events.pipe(takeUntil(this.destroy$)).subscribe((val) => {
      if (val['url']) {
        if (this.actualRoute !== val['url']) {
          this.actualRoute = (val['url']);
        }
      }
    });

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

  ngAfterViewInit() {
    setTimeout(() => {
      this.inputSubHeader = Observable.fromEvent(this.inputCantidadHeader.nativeElement, 'input')
      .debounceTime(1000)
      .pipe(takeUntil(this.destroy$)).subscribe(
        () => {
          const body = new URLSearchParams();
          const array = [];
          for (const item of this.data.lista) {
            if (item.cantidad > 0) {
              array.push({id_producto: item.id, cantidad: item.cantidad});
            }
          }
          body.set('lista', JSON.stringify(array));

          this.auth.post('carrito/update_cantidades', body)
          .then(($response) => {
            this.data.log('response carritoupdatecantidades header debounced', $response);
          })
          .catch(($error) => {
            this.data.log('error carritoupdatecantidades header debounced', $error);
          });
        },
      );
      if (this.inputCantidadHeaderVerde) {
        this.inputSubHeaderVerde = Observable.fromEvent(this.inputCantidadHeaderVerde.nativeElement, 'input')
        .debounceTime(1000)
        .pipe(takeUntil(this.destroy$)).subscribe(
          () => {
            const body = new URLSearchParams();
            const array = [];
            for (const item of this.data.lista) {
              if (item.cantidad > 0) {
                array.push({id_producto: item.id, cantidad: item.cantidad});
              }
            }
            body.set('lista', JSON.stringify(array));

            this.auth.post('carrito/update_cantidades', body)
            .then(($response) => {
              this.data.log('response carritoupdatecantidades header debounced verde', $response);
            })
            .catch(($error) => {
              this.data.log('error carritoupdatecantidades header debounced verde', $error);
            });
          },
        );
      }
    }, 2000);
  }

  representado: boolean = false;
  // auxiliar value
  lastInput: boolean = false;
  ngOnChanges() {
    if ((this.headerStatus > 90 && window.innerWidth > 960) || (this.headerStatus > 0 && window.innerWidth <= 960)) {
      this.headerPosition = 'header--fixed';
      if (this.popup.cuenta) {
        this.popup2.cuenta = true;
      }
      if (this.popup.compra) {
        this.popup2.compra = true;
      }
      this.popup.cuenta = false;
      this.popup.compra = false;
    } else {
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
      } else {
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

    if (window.innerWidth > 960) {
      this.popup.cuenta = false;
      this.popup2.cuenta = false;
    }
  }
  toggle(component: string) {
    if (this.UserLog) {
      if (component === 'cuenta') {
        this.popup.cuenta = !this.popup.cuenta;
        this.popup.compra = false;
      } else {
        this.popup.compra = !this.popup.compra;
        this.popup.cuenta = false;
      }
    } else {
      this.data.toggleLoginModal();
    }
  }
  toggle2(component: string) {
    if (this.UserLog) {
      if (component === 'cuenta') {
        this.popup2.cuenta = !this.popup2.cuenta;
        this.popup2.compra = false;
      } else {
        this.popup2.compra = !this.popup2.compra;
        this.popup2.cuenta = false;
      }
    } else {
      this.data.toggleLoginModal();
    }
  }
  carritoVerTodos() {
    this.toggle('compra');
    if (this.greetMessage && this.greetMessage.length > 0) {
      this.router.navigateByUrl('/compra/carrito');
    } else {
      this.router.navigateByUrl('/compra/carrito', {skipLocationChange: true}).then(() => this.router.navigateByUrl('/'));
    }
  }
  carritoVerTodos2() {
    this.toggle2('compra');
    if (this.greetMessage && this.greetMessage.length > 0) {
      this.router.navigateByUrl('/compra/carrito');
    } else {
      this.router.navigateByUrl('/compra/carrito', {skipLocationChange: true}).then(() => this.router.navigateByUrl('/'));
    }
  }
  toggleMenu() {
    this.data.toggleSideBar();
  }
  removeMessage(msg) {
    const body = new URLSearchParams();
    body.set('id_producto', msg.id);
    this.auth.post('carrito/eliminar_item', body)
    .then(($response) => {
      this.data.log('response carritoeliminaritem header', $response);
      this.data.removeMessage(msg);
    })
    .catch(($error) => {
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
  updatePrecio($precio, $cantidad): string { // TODO: revisar esto, mientras el popup se muestra esta llamandose en cada tick
    const subtotal = $precio * $cantidad;
    return this.formatMoney(subtotal);
  }
  updateSubtotal(listaCarrito): string { // TODO: revisar esto, mientras el popup se muestra esta llamandose en cada tick
    let subtotal = 0;
    listaCarrito.forEach((item) => {
      subtotal += item.cantidad * item.precio;
    });
    return this.formatMoney(subtotal);
  }
  formatMoney(n, c = undefined, d = undefined, t = undefined) {
    let s;
    let i;
    let j;
    c = isNaN(c = Math.abs(c)) ? 2 : c,
    d = d == undefined ? ',' : d,
    t = t == undefined ? '.' : t,
    s = n < 0 ? '-' : '',
    i = String(parseInt(n = Math.abs(Number(n) || 0).toFixed(c))),
    j = (j = i.length) > 3 ? j % 3 : 0;

    return s + (j ? i.substr(0, j) + t : '') + i.substr(j).replace(/(\d{3})(?=\d)/g, '$1' + t) + (c ? d + Math.abs(n - +i).toFixed(c).slice(2) : '');
  }
  
  public revisarCantidad(e) {
    if (e.target && parseInt(e.target.value) < parseInt(e.target.min)) {
      e.target.value = e.target.min;
    }
  }
}
