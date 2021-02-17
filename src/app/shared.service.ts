import { Injectable } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { environment } from '../environments/environment';

export class Dato {
  cantidad: number;
  descripcion: string;
  precio: number;
  total: number;
  id: number;
  sku: string;
  categoria: string;
  cantPack: number;
  arrayCants = [];
  constructor(cantidad: number, descripcion: string, precio: number, total: number, id: number, sku: string, categoria: string, cantPack: number) {
    this.cantidad     = cantidad;
    this.descripcion  = descripcion;
    this.precio       = precio;
    this.total        = total;
    this.id           = id;
    this.sku          = sku;
    this.categoria    = categoria;
    this.cantPack     = cantPack;
    if (this.cantPack !== 1) {
      for (let i = 0; i < 20; i++) {
        this.arrayCants[i] = this.cantPack * (i + 1);
      }
      for (let i = 0; i < 50; i++) {
        this.arrayCants[i + 20] = this.cantPack * (i + 3) * 10;
      }
    }
  }
}
export class domicilio {
  ciudad:     string;
  codPostal:  string;
  direccion:  string;
  provincia:  string;
}
export class fecha {
  date:           string;
  timezone:       string;
  timezone_type:  number;
}
export class sector {
  email:      string;
  id:         string;
  nombre:     string;
}
export class cliente {
  activo:       string;
  categoriaIva: string;
  codCategoriaIva: string;
  codigo:       string;
  cuit:         string;
  datosEnvio:   {
    codigoTransporte: string,
    nombreTransporte: string,
    costo:            string,
    diasEntrega:      any,
    domicilioEntrega: domicilio,
    horarioEntrega:   string,
    idTransporte:     string,
    telefono:         string,
  };
  descripcion:          string;
  domicilio:            domicilio;
  email:                string;
  emailFacturacion:     string;
  fechaAlta:            fecha;
  fechaBaja:            fecha;
  id:                   string;
  nombreFantasia:       string;
  nombreResponsableCompras: string;
  nombreResponsableFacturacion: string;
  numeroListaPrecios:   string;
  razonSocial:          string;
  sector:               sector;
  telefono:             string;
  telefonoCelular:      string;
  telefonoFacturacion:  string;
}
export class Configuracion {
  montoMinimo:            number;
  montoEnvio:             number;
  montoEnvioGratis:       number;
  costoEnvio:             number;
  stickyHeaderTitulo:     string;
  stickyHeaderCta:        string;
  stickyHeaderLink:       string;
  stickyHeaderDesde:      Date;
  stickyHeaderHasta:      Date;
  stickyHeaderActivo:     boolean;
  stickyHeaderPermanente: boolean;
  stickyHeaderMarquee:    boolean;
  ventanaEmergenteTitulo: string;
  ventanaEmergenteImagen: string;
  ventanaEmergenteActivo: boolean;
  stickySocialTelActivo: boolean;
  stickySocialTelTexto: string;
  stickySocialTelUrl: string;
  stickySocialWhatsappActivo: boolean;
  stickySocialWhatsappTexto: string;
  stickySocialWhatsappUrl: string;
  stickySocialFacebookActivo: boolean;
  stickySocialFacebookTexto: string;
  stickySocialFacebookUrl: string;
  stickySocialInstagramActivo: boolean;
  stickySocialInstagramTexto: string;
  stickySocialInstagramUrl: string;
  stickySocialTwitterActivo: boolean;
  stickySocialTwitterTexto: string;
  stickySocialTwitterUrl: string;
  stickySocialYoutubeActivo: boolean;
  stickySocialYoutubeTexto: string;
  stickySocialYoutubeUrl: string;
  mensajeCompraActivo: boolean;
  mensajeCompraTitulo: string;
  mensajeCompraMensaje: string;
  switchAltasActivo: boolean;
  switchComprasActivo: boolean;
  switchContactosActivo: boolean;
  mensajeModalLoginActivo: boolean;
  mensajeModalLoginMensaje: string;
  constructor(
    montoMinimo: number, montoEnvio: number, montoEnvioGratis: number, costoEnvio: number,
    stickyHeaderTitulo: string, stickyHeaderCta: string, stickyHeaderLink: string, stickyHeaderDesde: Date,
    stickyHeaderHasta: Date, stickyHeaderActivo: boolean, stickyHeaderPermanente: boolean, stickyHeaderMarquee: boolean,
    ventanaEmergenteTitulo: string, ventanaEmergenteImagen: string, ventanaEmergenteActivo: boolean,
    stickySocialTelActivo: boolean, stickySocialTelTexto: string, stickySocialTelUrl: string,
    stickySocialWhatsappActivo: boolean, stickySocialWhatsappTexto: string, stickySocialWhatsappUrl: string,
    stickySocialFacebookActivo: boolean, stickySocialFacebookTexto: string, stickySocialFacebookUrl: string,
    stickySocialInstagramActivo: boolean, stickySocialInstagramTexto: string, stickySocialInstagramUrl: string,
    stickySocialTwitterActivo: boolean, stickySocialTwitterTexto: string, stickySocialTwitterUrl: string,
    stickySocialYoutubeActivo: boolean, stickySocialYoutubeTexto: string, stickySocialYoutubeUrl: string,
    mensajeCompraActivo: boolean, mensajeCompraTitulo: string, mensajeCompraMensaje: string,
    switchAltasActivo: boolean, switchComprasActivo: boolean, switchContactosActivo: boolean,
    mensajeModalLoginActivo: boolean, mensajeModalLoginMensaje: string) {
      this.montoMinimo = montoMinimo;
      this.montoEnvio = montoEnvio;
      this.montoEnvioGratis = montoEnvioGratis;
      this.costoEnvio = costoEnvio;
      this.stickyHeaderTitulo = stickyHeaderTitulo;
      this.stickyHeaderCta = stickyHeaderCta;
      this.stickyHeaderLink = stickyHeaderLink;
      this.stickyHeaderDesde = stickyHeaderDesde;
      this.stickyHeaderHasta = stickyHeaderHasta;
      this.stickyHeaderActivo = stickyHeaderActivo;
      this.stickyHeaderPermanente = stickyHeaderPermanente;
      this.stickyHeaderMarquee = stickyHeaderMarquee;
      this.ventanaEmergenteTitulo = ventanaEmergenteTitulo;
      this.ventanaEmergenteImagen = ventanaEmergenteImagen;
      this.ventanaEmergenteActivo = ventanaEmergenteActivo;
      this.stickySocialTelActivo = stickySocialTelActivo;
      this.stickySocialTelTexto = stickySocialTelTexto;
      this.stickySocialTelUrl = stickySocialTelUrl;
      this.stickySocialWhatsappActivo = stickySocialWhatsappActivo;
      this.stickySocialWhatsappTexto = stickySocialWhatsappTexto;
      this.stickySocialWhatsappUrl = stickySocialWhatsappUrl;
      this.stickySocialFacebookActivo = stickySocialFacebookActivo;
      this.stickySocialFacebookTexto = stickySocialFacebookTexto;
      this.stickySocialFacebookUrl = stickySocialFacebookUrl;
      this.stickySocialInstagramActivo = stickySocialInstagramActivo;
      this.stickySocialInstagramTexto = stickySocialInstagramTexto;
      this.stickySocialInstagramUrl = stickySocialInstagramUrl;
      this.stickySocialTwitterActivo = stickySocialTwitterActivo;
      this.stickySocialTwitterTexto = stickySocialTwitterTexto;
      this.stickySocialTwitterUrl = stickySocialTwitterUrl;
      this.stickySocialYoutubeActivo = stickySocialYoutubeActivo;
      this.stickySocialYoutubeTexto = stickySocialYoutubeTexto;
      this.stickySocialYoutubeUrl = stickySocialYoutubeUrl;
      this.mensajeCompraActivo = mensajeCompraActivo;
      this.mensajeCompraTitulo = mensajeCompraTitulo;
      this.mensajeCompraMensaje = mensajeCompraMensaje;
      this.switchAltasActivo = switchAltasActivo;
      this.switchComprasActivo = switchComprasActivo;
      this.switchContactosActivo = switchContactosActivo;
      this.mensajeModalLoginActivo = mensajeModalLoginActivo;
      this.mensajeModalLoginMensaje = mensajeModalLoginMensaje;
  }
}

@Injectable()
export class SharedService {
  // localdata
  lista = [];
  user  = undefined;
  statusSide      = false;
  statusModal     = true;
  statusModal2    = true;
  statusRepresentar = true;
  statusLogin     = false;
  statusCarrito   = false;
  configuracion = [];
  rutaActual = '';

  public reponsable_lista: any[] = [
    { text: 'Consumidor final',  codigo: 'CF'},
    { text: 'Monotributista',  codigo: 'RS'},
    { text: 'Responsable inscripto',  codigo: 'RI'},
    { text: 'Exento',  codigo: 'EX'},
    { text: 'Iva exento operación de exportación',  codigo: 'EXE'},
    { text: 'Monotributista social',  codigo: 'RSS'},
    { text: 'No responsable',  codigo: 'INR'},
    { text: 'Pequeño contribuyente eventual',  codigo: 'PCE'},
    { text: 'Pequeño contribuyente eventual social',  codigo: 'PCS'},
    { text: 'Sujeto no categorizado', codigo: 'SNC'},
  ];

  // observable carrito
  private userSource = new BehaviorSubject<Dato[]>([]);
  currentUser        = this.userSource.asObservable();

  // observable carrito
  private messageSource = new BehaviorSubject<Dato[]>([]);
  currentMessage = this.messageSource.asObservable();

  // observable sidebar
  private sideBar = new BehaviorSubject<boolean>(false);
  currentSide     = this.sideBar.asObservable();

  // observable loginmodal
  private loginModal  = new BehaviorSubject<boolean>(true);
  currentModal        = this.loginModal.asObservable();
  // observable loginmodal2
  private loginModal2  = new BehaviorSubject<boolean>(true);
  currentModal2        = this.loginModal2.asObservable();
  // observable statusRepresentar
  private representarModal  = new BehaviorSubject<boolean>(true);
  currentRepresentar        = this.representarModal.asObservable();

  // observable loginStatus
  private loginStatus  = new BehaviorSubject<boolean>(false);
  currentLogin         = this.loginStatus.asObservable();

  // observable carritoPopup
  private carritoPopup  = new BehaviorSubject<boolean>(false);
  currentCarrito        = this.carritoPopup.asObservable();

  // observable configuracion
  private configuracionSource = new BehaviorSubject<Configuracion[]>([]);
  currentConfig               = this.configuracionSource.asObservable();

  // constructor
  constructor(private title: Title, private meta: Meta) { }

  toggleSideBar() {
    this.statusSide = !this.statusSide;
    this.sideBar.next(this.statusSide);
  }
  closeLoginModal() {
    this.statusModal = true;
    this.loginModal.next(this.statusModal);
  }
  toggleLoginModal() {
    this.statusModal = !this.statusModal;
    this.loginModal.next(this.statusModal);
  }
  toggleLoginModal2() {
    this.statusModal2 = !this.statusModal2;
    this.loginModal2.next(this.statusModal2);
  }
  toggleRepresentar() {
    this.statusRepresentar = !this.statusRepresentar;
    this.representarModal.next(this.statusRepresentar);
  }
  toggleLoginStatus($status) {
    if ($status) {
      if (localStorage.getItem('user')) {
        const user = JSON.parse(localStorage.getItem('user'));
        if (user !== '') {
          this.user = user;
          this.userSource.next(this.user);
          setTimeout(() => {
            if (this.lista.length !== 0) {
              this.toggleLoginModal2();
            }
          }, 1200);
        }
      }else {
      }
    }
    this.toggleLoginModal();
    this.statusLogin = $status;
    this.loginStatus.next(this.statusLogin);
  }
  toggleCarritoShow() {
    this.statusCarrito = !this.statusCarrito;
    this.carritoPopup.next(this.statusCarrito);
  }
  updateMessage($next?) {
    if ($next) {
      this.messageSource.next($next);
    } else {
      this.messageSource.next(this.lista);
    }
  }
  changeMessage(cantidad: number, descripcion: string, precio: number, total: number, id: number, sku: string, categoria: string, cantPack: number, enable?: boolean) {
    this.lista.push(new Dato(cantidad, descripcion, precio, total, id, sku, categoria, cantPack));
    this.messageSource.next(this.lista);
  }
  checkObjectValues(a, b) {
    const aProperties = Object.getOwnPropertyNames(a);
    const bProperties = Object.getOwnPropertyNames(b);
    if (aProperties.length != bProperties.length) {
      return false;
    }
    for (const saveNameProperty of aProperties) { // The name of the property name, lastname.
      if (a[saveNameProperty] !== b[saveNameProperty]) { // The value of the property cristina, rojas.
        return false;
      }
    }
    return true;
  }
  addMessage(msg): any {
      if (msg.cantidad) {
        if ((+msg.cantidad % +msg.cantPack === 0 &&  +msg.cantidad > +msg.cantMinima) || (+msg.cantMinima === +msg.cantidad)) {
          if (!this.lista.some((articulo_carrito) => articulo_carrito.id === msg.id)) {
            msg.comprado = true;
            this.changeMessage(msg.cantidad ? msg.cantidad : 1, msg.titulo, msg.precio, msg.precio * (+msg.cantidad),
                                msg.id, msg.codInterno, msg.categorias ? msg.categorias[0].nombre : '', msg.cantPack);
            return {value: true, text: `Producto agregado al Carrito!`};
          } else {
            msg.comprado = true;
            return {value: true, text: `Ya se encuentra en el Carrito!`};
          }
        }else {
          msg['incompleto'] = true;
          return {value: false};
        }
      }
  }

  removeMessage(item: any) {
    const BreakException = {};
    try {
      this.lista.forEach(($item, index, object) => {
        if ($item.id === item.id) {
          object.splice(index, 1);
          throw BreakException;
        }
      });

    } catch (e) {
      if (e !== BreakException) { throw e; }
    }
    this.messageSource.next(this.lista);
  }
  cleanCarrito() {
    this.lista = [];
    this.messageSource.next(this.lista);
  }
  updateUser(user) {
    this.user = user;
    this.userSource.next(this.user);
    this.statusLogin = true;
    this.loginStatus.next(this.statusLogin);
  }

  updatePageTitle(
    $title: string = 'Productos de limpieza por mayor, fabrica de productos de limpieza | Sina',
    $meta_content: string = 'Fábrica mayorista y distribuidora de artículos de limpieza y bazar con entrega a todo el país, hacé tu pedido online!') {
    /**
     * Configura el titulo de la pagina.
     * @param $title  Titulo de la pagina.
     * @param $meta_content  Contenido del Meta dato a configurar.
     */

    this.title.setTitle($title);
    this.meta.addTag({ name: 'description', content: $meta_content });
  }

  updateConfiguracion(config) {
    this.configuracion = config;
    this.configuracionSource.next(this.configuracion);
  }

  public log(...args) {
    if (!environment.production) {
      console.log.apply(console, args);
    }
  }
}
