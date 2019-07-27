import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SubjectSubscriber, Subject } from 'rxjs/Subject';
import { debounceTime } from 'rxjs/operator/debounceTime';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { Datos, DatosTransaccion } from '../data';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { SharedService, cliente } from "../shared.service";
import { AutenticacionService } from "../autenticacion.service"
import { ResponseContentType } from '@angular/http';

const datosFis : Datos[] = [
  {
    texto: "Nombre completo",
    model: "nombre"
  },
  {
    texto: "Direccion",
    model: "direccion"
  },
  {
    texto: "Localidad",
    model: "nombre"
  },
  {
    texto: "Provincia",
    model: "nombre"
  },
  {
    texto: "Telfono",
    model: "nombre"
  },    {
    texto: "E-mail",
    model: "nombre"
  }
]
const Items = [
  {
    texto: "Mi Cuenta",
    model: "./assets/images/iconos/Mi-cuenta.png",
    icon: "user"
  },
  {
    texto: "Mis Datos",
    model: "./assets/images/iconos/Mis-datos.png",
    icon: "table"
  },
  {
    texto: "Mis frecuentes",
    model: "./assets/images/iconos/Mis-frecuentes.png",
    icon: "clock-o"
  },
  {
    texto: "Últimas compras",
    model: "./assets/images/iconos/Mis-ultimas-compras.png",
    icon: "reply"
  },
  {
    texto: "Cerrar sesión",
    model: "./assets/images/iconos/Cerrar-sesion.png",
    icon: "times-circle"
  }
]

@Component({
  selector: 'app-cuenta',
  templateUrl: './cuenta.component.html',
  styleUrls: ['./cuenta.component.css']
})
export class CuentaComponent implements OnInit {
  formatMoney(n, c = undefined, d = undefined, t = undefined) {
    var c = isNaN(c = Math.abs(c)) ? 2 : c,
      d = d == undefined ? "," : d,
      t = t == undefined ? "." : t,
      s = n < 0 ? "-" : "",
      i = String(parseInt(n = Math.abs(Number(n) || 0).toFixed(c))),
      j = (j = i.length) > 3 ? j % 3 : 0;
  
    return s + (j ? i.substr(0, j) + t : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) + (c ? d + Math.abs(n - +i).toFixed(c).slice(2) : "");
  };  
  iva_usuario: string = ""
  currentJustify = 'end';  
  datosFiscales = datosFis
  transaccion: DatosTransaccion
  sub: Subscription
  ListaCompras;
  ListaItems = Items;
  loginStatus:boolean = false
  private _success = new Subject<string>();
  staticAlertClosed = false;
  successMessage: string; 

  DatosUsuario: cliente = new cliente()

  comprados = []

  ultimasCompras = [
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
  }]

  misFrecuentesLink: string = "#"

  constructor(
    private data:   SharedService,
    private route:  ActivatedRoute,
    private router: Router,
    private http:   HttpClient,
    private auth:   AutenticacionService
    ){ 
    this.transaccion = new DatosTransaccion(0);
    this.DatosUsuario = this.auth.localGet("user")
    this.http.get('assets/data/cuenta.json')
    .subscribe(res => {
      this.ListaCompras = res["lista"]
      //this.comprados    = res["comprados"]
      //this.ultimasCompras = res["ultimasCompras"]
    });
    this.auth.get("pedido/getUltimos")
    .then(($response)  =>{
      if($response.response) {
        this.ultimasCompras = $response.response
        this.ultimasCompras.forEach(compra => {
          compra["fechaPedido"].date = {
            year: (new Date(compra["fechaPedido"].date).getFullYear()),
            date: (new Date(compra["fechaPedido"].date).getDate()),
            month: (new Date(compra["fechaPedido"].date).getMonth())
          }
        })
      }
    })
    .catch($error => {
      console.log($error)
      this.router.navigate(["/"])
    })
    this.auth.get("producto/productosMasPedidos")
    .then(($response)  =>{
      if($response.response) {
        this.comprados = $response.response
        this.comprados.forEach(producto => {
          producto.cantidad = +producto["cantSugerida"]
        })
      }
    })
    .catch($error => {
      console.log($error)
      this.router.navigate(["/"])
    })
  }
  repetirPregunta($item) {
    this.repetirFlag = true
    this.repetirTemp = $item
  }
  repetirTemp = []
  repetirFlag:boolean = false
  repetirCancelar() {
    this.repetirTemp = []
    this.repetirFlag = false
  }
  repetirCompra() {
    const $item = this.repetirTemp
    this.data.cleanCarrito()
    if(this.ultimasCompras.length > 0) {
      if($item["items"].length > 0) {
        $item["items"].forEach(compra => {
          const precio = +compra.producto.precio
          const cantidad = +compra.cantidad
          this.data.changeMessage(cantidad ? cantidad : 1, compra.producto.titulo, precio, precio * (cantidad), compra.producto.id)
        })
        this.router.navigate(["/compra/"])
      }
    }
  }
  closeRepetir(event) {
    if(event.target.className === "modal__container") {
      this.repetirCancelar()
    }
  }
  ngOnInit() {
    this.data.updatePageTitle()
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
          this.loginStatus = status
        }
      )    
      this.data.currentUser.subscribe($user => {
        if ($user) {
          switch($user["codCategoriaIva"]) {
            case "CF": 
            case "INR": 
            case "RSS": this.iva_usuario = "LOS PRECIOS UNITARIOS DETALLADOS INCLUYEN IVA"; break;
            case "RI":
            case "EX":
            case "PCE":
            case "PCS":
            case "EXE":
            case "SNC":
            default: this.iva_usuario = "LOS PRECIOS UNITARIOS DETALLADOS NO INCLUYEN IVA"
          }
        }
      })
  
  }
  closeFull(event) {
    if(event.target.className === "modal__container") {
      this.transaccion.cambio(0)
    }
  }
  closeSession() {
    this.auth.desacreditar()
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
          msg["incompleto"] = true;
        }
      }
    }else {
      this.data.toggleLoginModal()
    }
  }
  descargarLista() {
    this.http.get(this.auth.getPath('producto/listaPrecio'), this.auth.getFileHeader(null))
    .subscribe(
      (res: any) => {
        var file = new Blob([res], {type: 'application/vnd.ms-excel'});
        var fileURL = URL.createObjectURL(file);
        const iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        iframe.src = fileURL;
        document.body.appendChild(iframe);
        //iframe.contentWindow.print();
      }, 
      (error) => {
        try {
          if(error["error"]["error"] === "Token no valido") {
            this.auth.desacreditar()
          }else {
            console.log(error)
          }
        } catch (error) {
          this.auth.desacreditar()
          console.log("error_persistente", error)
        }
      }
    )    

  }
  guardarDatos() {
    let body = new URLSearchParams();
    body.set("razon_social", this.DatosUsuario.razonSocial);
    body.set("nombre_fantasia", this.DatosUsuario.nombreFantasia);
    body.set("cod_categoria_iva", this.DatosUsuario.codCategoriaIva);
    body.set("domicilio_direccion", this.DatosUsuario.datosEnvio.domicilioEntrega.direccion);
    body.set("domicilio_ciudad", this.DatosUsuario.datosEnvio.domicilioEntrega.ciudad);
    body.set("domicilio_provincia", this.DatosUsuario.datosEnvio.domicilioEntrega.provincia);
    body.set("domicilio_codigo_postal", this.DatosUsuario.datosEnvio.domicilioEntrega.codPostal);

    const headers = new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' });
    this.auth.post('cliente/actualizar',body)
    .then($response => {
      console.log("respuesta", $response)
    })
    .catch(($error) => {
      let respuesta;
      try {
        Object.keys($error.response).forEach(element => {
          respuesta.mensaje += $error.response[element] + " "
        })
        console.log(respuesta)
      } catch($throw) {
        console.log($throw)
      }
    })
  }
}
