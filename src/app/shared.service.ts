import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Title, Meta } from '@angular/platform-browser';
import { environment } from '../environments/environment';

export class Dato {
  cantidad: Number;
  descripcion: String;
  precio: number;
  total: number;
  id: number;
  constructor(cantidad: Number, descripcion: String, precio: number, total: number, id: number) {
    this.cantidad     = cantidad;
    this.descripcion  = descripcion;
    this.precio       = precio;
    this.total        = total;
    this.id           = id;
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
    codigoTransporte: string
    nombreTransporte: string
    costo:            string
    diasEntrega:      any
    domicilioEntrega: domicilio
    horarioEntrega:   string
    idTransporte:     string
    telefono:         string
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

  public reponsable_lista: Array<any> = [
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

  public provincia_lista: Array<any> = [
    'Ciudad de Buenos Aires',
    'Buenos Aires',
    'Catamarca',
    'Chaco',
    'Chubut',
    'Córdoba',
    'Corrientes',
    'Entre Ríos',
    'Formosa',
    'Jujuy',
    'La Pampa',
    'La Rioja',
    'Mendoza',
    'Misiones',
    'Neuquén',
    'Río Negro',
    'Salta',
    'San Juan',
    'San Luis',
    'Santa Cruz',
    'Santa Fe',
    'Santiago del Estero',
    'Tierra del Fuego',
    'Tucumán',
    'Otra'
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
          const carrito = JSON.parse(localStorage.getItem('carrito'));
          if (carrito) {
            if (carrito.length !== 0) {
              this.toggleLoginModal2();
              this.log(JSON.parse(localStorage.getItem('carrito')));
            }
          }
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
  updateMessage() {
    this.messageSource.next([]);
  }
  changeMessage(cantidad: Number, descripcion: String, precio: number, total: number, id: number, enable?: boolean) {
    this.lista.push(new Dato(cantidad, descripcion, precio, total, id));
    window.localStorage.setItem('carrito', JSON.stringify(this.lista));
    this.messageSource.next(this.lista);
  }
  checkObjectValues(a, b) {
    const aProperties = Object.getOwnPropertyNames(a);
    const bProperties = Object.getOwnPropertyNames(b);
    if (aProperties.length != bProperties.length) {
      return false;
    }
    for (let i = 0; i < aProperties.length; i++) {
      const saveNameProperty = aProperties[i]; // The name of the property name, lastname.
      if ( a[saveNameProperty] !== b[saveNameProperty]) { // The value of the property cristina, rojas.
        return false;
      }
    }
    return true;
  }
  addMessage(msg): any {
      if (msg.cantidad) {
        if ((+msg.cantidad % +msg.cantPack === 0 &&  +msg.cantidad > +msg.cantMinima) || (+msg.cantMinima === +msg.cantidad)) {
          if (!this.lista.some(articulo_carrito => articulo_carrito.id === msg.id)) {
            msg.comprado = true;
            this.changeMessage(msg.cantidad ? msg.cantidad : 1, msg.titulo, msg.precio, msg.precio * (+msg.cantidad), msg.id);
            return {value: true, text: `Agregado al Carrito!`};
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
    window.localStorage.setItem('carrito', JSON.stringify(this.lista));
    this.messageSource.next(this.lista);
  }
  updateCarrito() {
    const carrito = JSON.parse(localStorage.getItem('carrito'));
    this.lista = carrito;
    this.messageSource.next(this.lista);
  }
  cleanCarrito() {
    localStorage.setItem('carrito', JSON.stringify([]));
    this.lista = [];
    this.messageSource.next(this.lista);
  }
  updateUser(user) {
    this.user = user;
    this.userSource.next(this.user);
    this.statusLogin = true;
    this.loginStatus.next(this.statusLogin);
  }

  updatePageTitle($title: string = 'Articulos de limpieza por mayor, articulos de bazar | Sina',
    $meta_content: string = 'Fábrica, mayorista y distribuidora de artículos de limpieza y bazar con entrega a todo el país, hacé tu pedido online!') {
    /**
     * Configura el titulo de la pagina.
     * @param $title  Titulo de la pagina.
     * @param $meta_content  Contenido del Meta dato a configurar.
     */

    this.title.setTitle($title);
    this.meta.addTag({ name: 'description', content: $meta_content });
  }

  public log(...args) {
    if (!environment.production) {
      console.log.apply(console, args);
    }
  }
}
