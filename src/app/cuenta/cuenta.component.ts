import { Component, OnInit, NgZone } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SubjectSubscriber, Subject } from 'rxjs/Subject';
import { debounceTime } from 'rxjs/operator/debounceTime';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { Datos, DatosTransaccion } from '../data';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { SharedService, cliente } from '../shared.service';
import { AutenticacionService } from '../autenticacion.service';
import * as XLSX from 'xlsx';


const datosFis: Datos[] = [
  {
    texto: 'Nombre completo',
    model: 'nombre'
  },
  {
    texto: 'Direccion',
    model: 'direccion'
  },
  {
    texto: 'Localidad',
    model: 'nombre'
  },
  {
    texto: 'Provincia',
    model: 'nombre'
  },
  {
    texto: 'Telfono',
    model: 'nombre'
  },    {
    texto: 'E-mail',
    model: 'nombre'
  }
];
const Items = [
  {
    texto: 'Mi Cuenta',
    model: './assets/images/iconos/Mi-cuenta.png',
    icon: 'user'
  },
  {
    texto: 'Mis Datos',
    model: './assets/images/iconos/Mis-datos.png',
    icon: 'table'
  },
  {
    texto: 'Mis frecuentes',
    model: './assets/images/iconos/Mis-frecuentes.png',
    icon: 'clock-o'
  },
  {
    texto: 'Últimas compras',
    model: './assets/images/iconos/Mis-ultimas-compras.png',
    icon: 'reply'
  },
  {
    texto: 'Cerrar sesión',
    model: './assets/images/iconos/Cerrar-sesion.png',
    icon: 'times-circle'
  }
];

@Component({
  selector: 'app-cuenta',
  templateUrl: './cuenta.component.html',
  styleUrls: ['./cuenta.component.css']
})
export class CuentaComponent implements OnInit {
  formatMoney(n, c = undefined, d = undefined, t = undefined) {
    var c = isNaN(c = Math.abs(c)) ? 2 : c,
      d = d == undefined ? ',' : d,
      t = t == undefined ? '.' : t,
      s = n < 0 ? '-' : '',
      i = String(parseInt(n = Math.abs(Number(n) || 0).toFixed(c))),
      j = (j = i.length) > 3 ? j % 3 : 0;

    return s + (j ? i.substr(0, j) + t : '') + i.substr(j).replace(/(\d{3})(?=\d)/g, '$1' + t) + (c ? d + Math.abs(n - +i).toFixed(c).slice(2) : '');
  }
  iva_usuario: string = '';
  currentJustify = 'end';
  datosFiscales = datosFis;
  transaccion: DatosTransaccion;
  sub: Subscription;
  ListaCompras;
  ListaItems = Items;

  desplegar = 'none';
  loginStatus:boolean = false;
  private _success = new Subject<string>();
  staticAlertClosed = false;
  successMessage: string;

  DatosUsuario: cliente = new cliente();

  comprados;

  ultimasCompras = [];
  listadoProductos = [];



  /*ultimasCompras = [
    {
      fecha:"",
      lista: [
        {
          cantidad: "",
          descripcion : "",
          precioUnitario: "",
          precioTotal: ""
        }
      ],
      total: ""
  }]*/

  misFrecuentesLink: string = '#';

  transporte_lista: Array<any> = [];
  initialLista: Array<any> = [];
  procesando_info: boolean = false;
  procesando_info_entrega: boolean = false;
  procesando_info_error: string = '';
  procesando_info_entrega_error: string = '';
  procesando_info_ok: string = '';
  procesando_info_entrega_ok: string = '';
  constructor(
    private _ngZone: NgZone,
    private data:   SharedService,
    private route:  ActivatedRoute,
    private router: Router,
    private http:   HttpClient,
    private auth:   AutenticacionService
    ){
    this.transaccion = new DatosTransaccion(0);

    this.http.get('assets/data/cuenta.json')
    .subscribe(res => {
      this.ListaCompras = res['lista'];
      //this.comprados    = res["comprados"]
      //this.ultimasCompras = res["ultimasCompras"]
    });
    this.auth.get('pedido/getUltimos')
    .then(($response)  =>{
      if($response.response) {
        this.ultimasCompras = $response.response;
        console.log(this.ultimasCompras, 'ko');
        this.ultimasCompras.forEach(compra => {
          compra['fechaPedido'].date = {
            year: (new Date(compra['fechaPedido'].date).getFullYear()),
            date: (new Date(compra['fechaPedido'].date).getDate()),
            month: (new Date(compra['fechaPedido'].date).getMonth())
          };
        });
      }
    })
    .catch($error => {
      console.log($error);
      this.router.navigate(['/']);
    });
    this.auth.get('producto/productosMasPedidos')
    .then(($response) => {
      if($response.response) {
        this.comprados = $response.response;
        console.log(this.comprados);
        this.comprados.forEach(producto => {
          producto.cantidad = +producto['cantSugerida'];
        });
      }
    })
    .catch($error => {
      console.log($error);
      this.router.navigate(['/']);
    });
  }
  public refreshTransporte(value:any):void {
    //this.medioTransporte = value.text
    this.DatosUsuario.datosEnvio.codigoTransporte = value;
  }
  public refreshCategoria(value:any):void {
    //this.medioTransporte = value.text
    this.DatosUsuario.codCategoriaIva = value;
  }
  repetirPregunta($item) {
    this.repetirFlag = true;
    this.repetirTemp = $item;
  }
  repetirTemp = [];
  repetirFlag:boolean = false;
  repetirCancelar() {
    this.repetirTemp = [];
    this.repetirFlag = false;
  }
  repetirCompra() {
    const $item = this.repetirTemp;
    this.data.cleanCarrito();
    if(this.ultimasCompras.length > 0) {
      if($item['items'].length > 0) {
        $item['items'].forEach(compra => {
          const precio = +compra.producto.precio;
          const cantidad = +compra.cantidad;
          this.data.changeMessage(cantidad ? cantidad : 1, compra.producto.titulo, precio, precio * (cantidad), compra.producto.id);
        });
        this.router.navigate(['/compra/']);
      }
    }
  }
  closeRepetir(event) {
    if(event.target.className === 'modal__container') {
      this.repetirCancelar();
    }
  }
  ngOnInit() {
    this.data.updatePageTitle();
    setTimeout(() => this.staticAlertClosed = true, 5000);
    this._success.subscribe((message) => this.successMessage = message);
    //debounceTime.call(this._success, 5000).subscribe(() => this.successMessage = null);

    this.sub = this.route
      .queryParams
      .subscribe(params => {
        this.transaccion.cambio(+params['tab'] || 0);
      });
      //subscribing to data on loginStatus
      this.data.currentLogin.subscribe(
        status => {
          this.loginStatus = status;
        }
      );
      this.data.currentUser.subscribe(($user:any) => {
        if ($user) {
          this.DatosUsuario = $user;
          new Promise(($acepto, $rechazo) => {
            this.auth.get('public/cliente/envio/getAll').then((result)=> {
                result.response.forEach(transporte => {
                  this.transporte_lista.push({
                    id: transporte.codigo,
                    text: transporte.nombre
                  });
                });
                this.DatosUsuario.datosEnvio.codigoTransporte = (this.transporte_lista.find((transporte)=>{
                  return transporte.id === this.DatosUsuario.datosEnvio.codigoTransporte;
                })).text;
              $acepto('ok');
            }).catch((error)=> $rechazo(error));
          })
          .then($respuesta => {
            console.log('okerso', this.transporte_lista, this.initialLista);
          })
          .catch($error => {
            console.log('public/cliente/envio/getAll: ', this.transporte_lista, this.initialLista);
          });
          switch($user['codCategoriaIva']) {
            case 'CF':
            case 'INR':
            case 'RSS': this.iva_usuario = 'LOS PRECIOS UNITARIOS DETALLADOS INCLUYEN IVA'; break;
            case 'RI':
            case 'EX':
            case 'PCE':
            case 'PCS':
            case 'EXE':
            case 'SNC':
            default: this.iva_usuario = 'LOS PRECIOS UNITARIOS DETALLADOS NO INCLUYEN IVA';
          }
        }
      });

  }
  closeFull(event) {
    if(event.target.className === 'modal__container') {
      this.transaccion.cambio(0);
    }
  }
  closeSession() {
    this.auth.desacreditar();
    window.location.reload();
  }
  ngOnDestroy() {
    this.sub.unsubscribe();
  }
  newMessage(msg) {
    if(this.loginStatus === true) {
      if(msg.cantidad){
        if((+msg.cantidad % +msg.cantPack === 0 &&  +msg.cantidad > +msg.cantMinima) || (+msg.cantMinima === +msg.cantidad)){
          if(!this.data.lista.some(articulo_carrito => articulo_carrito.id === msg.id)) {
            msg.comprado = true;
            this.data.changeMessage(msg.cantidad ? msg.cantidad : 1, msg.titulo, msg.precio, msg.precio * (+msg.cantidad), msg.id);
          } else {
            msg.comprado = true;
          }
        }else{
          msg['incompleto'] = true;
        }
      }
    }else {
      this.data.toggleLoginModal();
    }
  }


	descargarLista()
	{
		(document.querySelector('#loaderFile') as HTMLElement).style.display = 'block'
		this.auth.get('producto/listadoProductos')
		.then(($response)  =>
		{
			if($response.response)
			{
				this.listadoProductos = $response.response
				const print: any[] = []
				print.push(['Código interno', 'Título + título adicional', 'Codigo de barras', 'Unidad de medida (presentacion)', 'Precio', 'Familia', 'Categoria', 'SubCategoria', 'Oferta'])
				this.listadoProductos.forEach(producto =>
				{
					print.push
					(
						[
						  producto.codigo_interno,
						  producto.nombre + " - " + producto.nombre_adicional,
						  producto.codigo_barras,
						  producto.unidad_medida,
						  producto.precio,
						  producto.familia,
						  producto.categoria,
						  producto.subcategoria,
						  producto.es_oferta
						]
					)
				});

				const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(print)
				const wb: XLSX.WorkBook = XLSX.utils.book_new()
				XLSX.utils.book_append_sheet(wb, ws, 'Hoja 1')
				XLSX.writeFile(wb, 'Listado de productos.xlsx')
			}
			(document.querySelector('#loaderFile') as HTMLElement).style.display = 'none'

		})
		.catch($error =>
		{
			console.log($error);
		});
	}
  guardarDatos() {
    this.procesando_info = true;
    this.procesando_info_entrega = true;

    let body = new URLSearchParams();
    let body_entrega = new URLSearchParams();
    body.set('razon_social', this.DatosUsuario.razonSocial);
    body.set('nombre_fantasia', this.DatosUsuario.nombreFantasia);
    body.set('cuit', this.DatosUsuario.cuit);
    body.set('telefono', this.DatosUsuario.telefono);
    body.set('telefono_celular', this.DatosUsuario.telefonoCelular);
    body.set('body_entrega', this.DatosUsuario.telefonoCelular);
    body.set('cod_categoria_iva', this.DatosUsuario.codCategoriaIva);
    body.set('domicilio_direccion', this.DatosUsuario.domicilio.direccion);
    body.set('domicilio_ciudad', this.DatosUsuario.domicilio.ciudad);
    body.set('domicilio_provincia', this.DatosUsuario.domicilio.provincia);
    body.set('domicilio_codigo_postal', this.DatosUsuario.domicilio.codPostal);
    body.set('nombre_responsable_facturacion', this.DatosUsuario.nombreResponsableFacturacion);
    body.set('email_facturacion', this.DatosUsuario.emailFacturacion);
    body.set('telefono_facturacion', this.DatosUsuario.telefonoFacturacion);
    body.set('descripcion', this.DatosUsuario.descripcion);


    body_entrega.set('domicilio_direccion', this.DatosUsuario.datosEnvio.domicilioEntrega.direccion);
    body_entrega.set('domicilio_ciudad', this.DatosUsuario.datosEnvio.domicilioEntrega.ciudad);
    body_entrega.set('domicilio_provincia', this.DatosUsuario.datosEnvio.domicilioEntrega.provincia);
    body_entrega.set('domicilio_codigo_postal', this.DatosUsuario.datosEnvio.domicilioEntrega.codPostal);
    body_entrega.set('telefono', this.DatosUsuario.datosEnvio.telefono);
    body_entrega.set('cod_transporte', this.DatosUsuario.datosEnvio.codigoTransporte);

    console.log(body, body_entrega);
    const headers = new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' });
    this.procesando_info_ok = '';
    this.procesando_info_entrega_ok = '';

    this.auth.post('cliente/actualizar',body)
    .then($response => {
      console.log('respuesta', $response);
      this.procesando_info = false;
      this.procesando_info_error = '';
      this.procesando_info_ok = $response.body.response;
    })
    .catch(($error) => {
      this.procesando_info = false;
      this.procesando_info_error = '';
      try {
        Object.values($error.error.response).forEach(element => {
          this.procesando_info_error += element + ' ';
        });
      } catch($throw) {
        console.log($throw);
      }
    });
    this.auth.post('cliente/envio/actualizar_datos',body_entrega)
    .then($response => {
      console.log('respuesta', $response);
      this.procesando_info_entrega = false;
      this.procesando_info_entrega_error ='';
      this.procesando_info_entrega_ok = $response.body.response;
    })
    .catch(($error) => {
      this.procesando_info_entrega = false;
      this.procesando_info_entrega_error ='';
      try {
        Object.values($error.response).forEach(element => {
          this.procesando_info_entrega_error += element + ' ';
        });
      } catch($throw) {
        console.log($throw);
      }
    });
  }
}
