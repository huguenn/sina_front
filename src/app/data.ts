import { domicilio } from './shared.service';

export class CompraItem {
  texto: string;
  url:   string;
  precio: string;
}
export class Carrito {
  fecha: string;
  list:  CompraItem[];
}
export class Link {
  url:    string;
  texto:  string;
  img1:    string;
  img2:    string;
}
export class MenuItem {
  texto: string;
  link:  string;
  constructor( texto: string, link: string ) {
    this.texto = texto;
    this.link = link;
  }
}
export class MenuSection {
  head: MenuItem;
  items: MenuItem[];
  constructor( head: MenuItem, items: MenuItem[] ) {
    this.head = head;
    this.items = items;
  }
}
export class Item {
  /* Variables globales */
  imagen:     string;
  texto1:     string;
  texto2:     string;
  precio:     string;
  indice:     number;
  oferta:     boolean;
  imperdible: boolean;
  comprado:   boolean;
  constructor( imagen: string, texto1: string, texto2: string, precio: string, indice: number, oferta: boolean, imperdible: boolean, comprado: boolean) {
    this.imagen     = imagen;
    this.texto1     = texto1;
    this.texto2     = texto2;
    this.precio     = precio;
    this.indice     = indice;
    this.oferta     = oferta;
    this.imperdible = imperdible;
    this.comprado = comprado;
  }
}
export class Resultado {
  head:   Head;
  lista:  Item[];
  public addResult(item) {
    this.lista.push(item);
  }
  constructor( head: Head, lista: Item[]) {
    this.head   = head;
    this.lista  = lista;
  }
}
export class ItemFilter {
  texto: string;
  link: string;
  constructor( texto: string, link: string) {
    this.texto    = texto;
    this.link     = link;
  }
}
export class FilterItemHead extends ItemFilter {
  constructor( texto: string, link: string, ) {
    super(texto, link);
  }
}
export class FilterItemSection extends ItemFilter {
  id: number;
  constructor( texto: string, link: string, id: number) {
    super(texto, link);
    this.id = id;
  }
}
export class FilterSection {
  head: FilterItemHead;
  items: FilterItemSection[];
  constructor( head: FilterItemHead, items: FilterItemSection[] ) {
    this.head = head;
    this.items = items;
  }
}
export class Head {
  imagen: string;
  texto: string;
  link: string;
  constructor( imagen: string, texto: string, link: string ) {
    this.imagen = imagen;
    this.texto = texto;
    this.link = link;
  }
}
export class Producto {
  /* Variables globales */
  imagen:     string;
  texto1:     string;
  texto2:     string;
  precio:     number;
  indice:     number;
  oferta:     boolean;
  imperdible: boolean;
  comprado:   boolean;
  cantidad:   number;

  constructor( imagen: string = '', texto1: string = '', texto2: string = '', precio: number = 0, indice: number = 1,
    oferta: boolean = false, imperdible: boolean = false, comprado: boolean = true, cantidad: number = 0) {
    this.imagen     = imagen;
    this.texto1     = texto1;
    this.texto2     = texto2;
    this.precio     = precio;
    this.indice     = indice;
    this.oferta     = oferta;
    this.imperdible = imperdible;
    this.comprado = comprado;
    this.cantidad = cantidad;
  }
}
export class ProductoCompleto extends Producto {
  /* Variables globales */
  descripcion: String;
  condicion:  String;
  id: number;
  constructor( ) {
      super();
      this.descripcion = '';
      this.condicion  = '';
  }
}

export class DatosTransaccion {
  paso: number;
  cambio(item) {
    this.paso = item;
  }
  check(item) {
    return this.paso === item;
  }
  constructor(paso: number) { this.paso = paso; }
}
export class Datos {
  texto: string;
  model: string;
  constructor(texto: string, model: string) {
    this.texto = texto;
    this.model = model;
  }
}

export class clienteActualizar {
  cod_categoria_iva:              string;
  categoria_iva:                  string;
  razon_social:                   string;
  nombre_fantasia:                string;
  telefono:                       string;
  telefono_celular:               string;
  nombre_responsable_compras:     string;
  facturacion_nombre_responsable: string;
  facturacion_email:              string;
  facturacion_telefono:           string;
  domicilio_direccion:            string;
  domicilio_ciudad:               string;
  domicilio_provincia:            string;
  domicilio_codigo_postal:        string;
}

export class clientEnvioActualizarDatos {
  cod_transporte:                 string;
  domicilio_direccion:            string;
  domicilio_ciudad:               string;
  domicilio_provincia:            string;
  domicilio_codigo_postal:        string;
  telefono:                       string;
  horario_entrega:                string;
  entrega_lunes:                  string;
  entrega_martes:                 string;
  entrega_miercoles:              string;
  entrega_jueves:                 string;
  entrega_viernes:                string;
  entrega_sabado:                 string;
  cargar:                         any = ($datosEnvio) => {
    this.cod_transporte           = $datosEnvio.codigoTransporte;
    if ($datosEnvio.domicilioEntrega) {
      this.domicilio_direccion      = $datosEnvio.domicilioEntrega.direccion;
      this.domicilio_ciudad         = $datosEnvio.domicilioEntrega.ciudad;
      this.domicilio_provincia      = $datosEnvio.domicilioEntrega.provincia;
      this.domicilio_codigo_postal  = $datosEnvio.domicilioEntrega.codPostal;
    }
    this.telefono                 = $datosEnvio.telefono;
    this.horario_entrega          = $datosEnvio.horarioEntrega;
    if ($datosEnvio.diasEntrega) {
      this.entrega_lunes            = $datosEnvio.diasEntrega.lunes;
      this.entrega_martes           = $datosEnvio.diasEntrega.martes;
      this.entrega_miercoles        = $datosEnvio.diasEntrega.miercoles;
      this.entrega_jueves           = $datosEnvio.diasEntrega.jueves;
      this.entrega_viernes          = $datosEnvio.diasEntrega.viernes;
      this.entrega_sabado           = $datosEnvio.diasEntrega.sabado;
    }
  }
  enviar:                         any = () => {
    return {
      cod_transporte:             this.cod_transporte,
      domicilio_direccion:        this.domicilio_direccion,
      domicilio_ciudad:           this.domicilio_ciudad,
      domicilio_provincia:        this.domicilio_provincia,
      domicilio_codigo_postal:    this.domicilio_codigo_postal,
      telefono:                   this.telefono,
      /*horario_entrega:            this.horario_entrega,
      entrega_lunes:              this.entrega_lunes,
      entrega_martes:             this.entrega_martes,
      entrega_miercoles:          this.entrega_miercoles,
      entrega_jueves:             this.entrega_jueves,
      entrega_viernes:            this.entrega_viernes,
      entrega_sabado:             this.entrega_sabado*/
    };
  }
}
