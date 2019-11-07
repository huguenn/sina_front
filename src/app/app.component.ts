import { Component, OnInit, ViewChild, ChangeDetectorRef, ElementRef, Pipe, PipeTransform } from '@angular/core';
import { SharedService, cliente, Dato } from "../app/shared.service";
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { INgxMyDpOptions, IMyDateModel } from 'ngx-mydatepicker';
import { AutenticacionService } from "./autenticacion.service"
import { DatabaseService } from "./database.service";
import { Router, NavigationEnd } from '@angular/router';
import { MenuService } from './menu.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [DatabaseService]
})
export class AppComponent implements OnInit {
  @ViewChild('ventana') el:ElementRef;
  public recuperarClave: boolean
  public recuperarOk: string
  public recuperarError: string
  public usuario = {

  }

  public mensajesEstados: any = {
    campoNoValido: ""
  }

  public contacto: any = {
    razon_social:"",
    nombre_fantasia: "",
    email: "",
    contrasena: "",
    domicilio_ciudad: "",
    domicilio_direccion: "",
    domicilio_numero: "",
    domicilio_provincia: "",
    telefono_celular: "",
    telefono: "",
    cuit: "",
    nombre_responsable_compras: "",
    domicilio_codigo_postal:"",
    cod_categoria_iva: "",
    envio_domicilio_direccion: "",
    envio_domicilio_codigo_postal:"",
    envio_domicilio_ciudad: "",
    envio_domicilio_provincia: "",
    actividad: ""
  }

  public provincia = [ "Ciudad de Buenos Aires", "Buenos Aires", "Catamarca", "Chaco", "Chubut", "Córdoba", "Corrientes", "Entre Ríos", "Formosa", "Jujuy", "La Pampa", "La Rioja", "Mendoza", "Misiones", "Neuquén", "Río Negro", "Salta", "San Juan", "San Luis", "Santa Cruz", "Santa Fe", "Santiago del Estero", "Tierra del Fuego", "Tucumán", "Otra"]
  public reponsable:Array<string> = [
    'Consumidor final', 
    "Monotributista", 
    "Responsable inscripto", 
    "Exento", 
    "Iva exento operación de exportación", 
    "Monotributista social", 
    "No responsable", 
    "Pequeño contribuyente eventual", 
    "Pequeño contribuyente eventual social", 
    "Sujeto no categorizado"
  ];

  public migracion = {
    email_original: "",
    email_repetido: "",
    pass_original: "",
    pass_repetido: ""
  }

  private cuit:any = "DNI o CUIT";
  private cativa: string = ""
  private _disabledV:string = '0';
  private disabled:boolean = false;

  cat_selected = []
  domicilio_provincia = []
  envio_provincia = []

  public refreshCUIT(value:any):void {
    this.cativa = value.text
    this.cat_selected = [{id: value.id, text: value.text}]
    if(value.text ==="Consumidor final"){
      this.cuit = "DNI"
    }
    else{
      this.cuit = "CUIT"
    }  
  }
  public deleteCUIT (){
    this.cat_selected = []
  }
  public refreshProvincia(value:any):void {
    this.domicilio_provincia = [{id: value.id, text: value.text}]
    this.contacto.domicilio_provincia = value.text
  }
  public deleteProvincia (){
    this.domicilio_provincia = []
  }
  public refreshProvincia2(value:any):void {
    this.envio_provincia = [{id: value.id, text: value.text}]
    this.contacto.envio_domicilio_provincia = value.text
  }
  public deleteProvincia2 (){
    this.envio_provincia = []
  }

  processing = {
    started:    false,
    right_now:  false,
    finished:   true,
    start: function() {
      this.started    = true
      this.right_now  = true
    },
    stop: function() {
      this.right_now  = false
      this.started    = true
    },
    finish: function() {
      this.right_now = false
      this.started = false
      this.finished = true
    }
  }

  sticky: any = {
    activo: false,
    call_to_action: "",
    link: "#",
    mensaje: "",
    inicio: "",
    fin: "",
    permanente: false
  }
  emergentes = []
  actualRoute = "/"
  actualEmergente     : any = {}
  actualEmergenteFlag : boolean = false

  message:string;
  childmessage:   Dato[] = []
  menuStatus:     number
  loginStatus:    boolean = true
  carritoStatus:  boolean
  representarStatus:  boolean
  registrarStatus:boolean = false
  login: any = {
    user: "",
    pass: "",
    error: false,
    errorMsg: "",
    confirMsg: ""
  }
  ventana
  eventoclick($event){
    if($event.path) {
      if(!$event.path.some($element => ($element.className === "buy" || $element.className === "login"))) {
        this.menu.notifyOther(true)
      }
    } else {
      if (!("path" in Event.prototype))
      Object.defineProperty(Event.prototype, "path", {
        get: function() {
          var path = [];
          var currentElem = this.target;
          while (currentElem) {
            path.push(currentElem);
            currentElem = currentElem.parentElement;
          }
          if (path.indexOf(window) === -1 && path.indexOf(document) === -1)
            path.push(document);
          if (path.indexOf(window) === -1)
            path.push(window);
          return path;
        }
      });
      if(!$event.path.some($element => ($element.className === "buy" || $element.className === "login"))) {
        this.menu.notifyOther(true)
      }
    }
  }
  _MODES:  Array<string> = ['over', 'push', 'slide'];  
  _opened: boolean = false;
  _option: number = 2;
  
  myOptions: INgxMyDpOptions = {
    // other options...
    dateFormat: 'dd.mm.yyyy',
  };
  // datepicker
  model: any = { };
  // optional date changed callback
  onDateChanged(event: IMyDateModel): void {
      // date selected
  }
  _step: number = 1
  _anteriorStep(){
    if(this._step > 1){
      this._step --
    }else{
      this.registrarStatus = false
    }
  }
  confirmacion: any = {
    mensaje: "Se ha enviado un correo a el mail provisto para su confirmación, por favor siga los pasos del mismo.",
    action: "Volver al inicio",
    value: () => {
      this.processing.finish(); this.registrarStatus = false; this._changeStep(1)
    }
  }
  error: any = {
    mensaje: "",
    action: "Volver al primer paso",
    value: () => {
      this.processing.finish(); this._step = (1)
    },
    reset: () => {
      this.error.mensaje = ""
    }
  }
  response: any
  validador = {}
  obligatorios = ["razon_social", "domicilio_ciudad", "email", "cuit", "telefono", "contrasena"]
  no_obligatorios = ["nombre_fantasia"]
  _changeStep($step){
    if(this._step === 3) {
      if(this.processing.finished){
        const Cat = this.data.reponsable_lista.find(element => element.texto === this.contacto.cativa)
        this.contacto["cod_categoria_iva"] = Cat ? Cat.codigo : ""
        try{
          this.no_obligatorios.forEach($item => {
            if(this.contacto[$item] === ""){
              delete this.contacto[$item]
            }
          })
        }catch($catch){}
          let validando = false
          for (const key in this.contacto) {
            if (this.contacto.hasOwnProperty(key)) {
              const element = this.contacto[key];
              if(this.obligatorios.includes(key) && element === "") {
                validando = true
                return 0;
              }
            }
          }
          if(! validando) {
            this.processing.start()
            let body = new URLSearchParams();
  
            Object.keys(this.contacto).forEach(element => {
              if(!element.includes("domicilio_direccion")) {
                body.set(element, this.contacto[element]);
              } else {
                if(element.includes("envio_domicilio_direccion")) {
                  body.set(element, this.contacto.envio_domicilio_direccion + (this.contacto.entrega_domicilio_numero ? " " + this.contacto.entrega_domicilio_numero : "") );
                } else {
                  body.set(element, this.contacto.domicilio_direccion + (this.contacto.domicilio_numero ? " " + this.contacto.domicilio_numero : ""))
                }
              }
            });
            const headers = new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' });
            this.http.post(this.auth.getPath('public/cliente/nuevo'),body.toString(), {headers, observe: 'response'})
            .subscribe($response => {
              this.processing.stop()            
              this.response = this.confirmacion
            },($error) => {
              this.processing.stop()
              this.error.reset()
              this.response = this.error
              try {
                Object.keys($error.error.response.error).forEach(element => {
                  this.response.mensaje += $error.error.response.error[element] + " "
                })
              } catch($throw) {
                console.log($throw)
              }
            })      
          } else {
            //console.log(this.contacto)
          }
        }
    }else {
      if((this._step === 1)) {
        //console.log(this.validador)
        this.obligatorios.forEach($campo_obligatorio => {
          if(!this.contacto[$campo_obligatorio]) {
            this.validador[$campo_obligatorio] = true
          } else {
            delete this.validador[$campo_obligatorio];
          }
          if($campo_obligatorio === "email") {
            if(this.contacto[$campo_obligatorio].includes("@")) {
              delete this.validador[$campo_obligatorio]
            } else{
              this.validador[$campo_obligatorio] = true
            }
          }

        })
        if(Object.keys(this.cat_selected).length === 0) {
          this.validador["cat_selected"] = true
        } else {
          delete this.validador["cat_selected"]
        }
        if(Object.keys(this.domicilio_provincia).length === 0) {
          this.validador["domicilio_provincia"] = true
        } else {
          delete this.validador["domicilio_provincia"]
        }
      } 
      if(Object.keys(this.validador).length === 0 && this.validador.constructor === Object) {
        this._step = $step ? $step : (this._step < 3 ? this._step + 1 : 3) 
      }
    }
  }

  private _toggleSidebar() {
    this._opened = !this._opened;
  }
  constructor(
    private menu: MenuService,
    private cdRef:ChangeDetectorRef, 
    private data: SharedService, 
    private http:HttpClient, 
    private auth: AutenticacionService, 
    private db: DatabaseService, 
    private router: Router) {
    this.recuperarClave = false
    this.recuperarOk = ""
    this.recuperarError = ""
  }
  ngAfterViewChecked()
  {
    this.cdRef.detectChanges();
  }

  ngOnInit() {
    //subscribing to data on carrito
    this.data.currentMessage.subscribe(
      message => {
        this.childmessage = message
      }
    )
    //subscribing to data on sidebar
    this.data.currentSide.subscribe(
      status => {
        this._opened = status
      }
    )
    //subscribing to data on loginStatus
    this.data.currentModal.subscribe(
      status => {
        this.loginStatus = status
      }
    )
    //subscribing to data on CarritoStatus
    this.data.currentModal2.subscribe(
      status => {
        this.carritoStatus = status
      }
    )
    //subscribing to data on representarStatus
    this.data.currentRepresentar.subscribe(
      status => {
        this.representarStatus = status
      }
    )
    //subscribing to router change
    this.router.events.subscribe(val =>{
      if(this.actualRoute !== val["url"]) {
        this.actualRoute = (val["url"])
        if(this.emergentes.length){
          this.find_index()
        }
      }
      if (!(val instanceof NavigationEnd)) {
        return;
    }
    this.el.nativeElement.parentElement.scrollTop = 0
    })
    
    //subscribing to data on Firebase
    this.db.getDocument("sticky").subscribe(value=>{
      if(value) {
        this.sticky = value
      }
    })
    //subscribing to data on Firebase
    this.db.getCollection("emergentes").subscribe(value=>{
      if(value) {
        this.emergentes = value
        this.find_index()
      }
    })

    //binding interval
    setInterval(()=> {
      this.menuStatus = this.el.nativeElement.parentElement.scrollTop
    },100); 

    //reading user data
    this.auth.get("cliente/datos")
    .then(($response)  =>{
      const datos_locales = this.auth.localGet("user")
      if($response.response["codigo"] !== datos_locales["codigo"]) {
        window.location.reload()
      } else {
        //console.log(datos_locales, $response.response)
      }
      this.auth.localSet("user",  $response.response as cliente)
      this.data.updateUser($response.response)
      //this.auth.userTypeUpdate($response.response["numeroListaPrecios"])
    })
    .catch($error => {
      console.log($error)
    })

  }

  find_index(){
    var item = this.actualRoute ==="/" ? "home" : this.actualRoute
    if(item) {
      var index = this.emergentes.findIndex(($element) => {
        return item.indexOf($element.seccion) !== -1
      })
      if(this.actualRoute.indexOf("confirmacion") === -1) {
        if(index !== -1) {
          if(this.carritoStatus && this.loginStatus) {
            if(!this.auth.localGet("actualEmergenteFlag")) {
              this.actualEmergente = this.emergentes[index]
              this.actualEmergenteFlag = true
              this.auth.localSet("actualEmergenteFlag", true)
            }
          }else{
            this.actualEmergenteFlag = false
            this.auth.localSet("actualEmergenteFlag", false)      
          }
        }
      } else {
        this.actualEmergenteFlag = false
        this.data.closeLoginModal()
      }
    }
  }

  closeFull(event) {
    if(event.target.className === "modal__container") {
      this.closeModal() 
    }
  }
  closeFull2(event) {
    if(event.target.className === "modal__container") {
      this.carritoCancelModal() 
    }
  }
  migrandoStatus: boolean = true
  migrandoCancelModal() {
    this.migrandoStatus = true
  }
  closeFull3(event) {
    if(event.target.className === "modal__container") {
      this.migrandoCancelModal()
    }
  }
  closeFullRepresentar(event) {
    if(event.target.className === "modal__container") {
      this.representarCancel()
    }
  }
  closeEmergente(event) {
    if(event.target.className === "modal__container") {
      this.closeEmergente2()
    }
  }
  closeEmergente2() {
    this.actualEmergenteFlag = false
  }

  updatePrecio($precio, $cantidad):string {
    var subtotal = $precio * $cantidad 
    return this.formatMoney(subtotal)
  }
  closeModal() {
    this.data.toggleLoginModal()
    this.registrarStatus = false
  }
  loginLoading = false
  cuentasRepresentar = []
  cuentaSeleccionada: any
  cuentaLoading: boolean = false
  cuentaRespuesta: string = ""
  seleccionarCuenta(cuenta) {
      this.cuentaSeleccionada = Object.assign({}, cuenta);
  }
  loginModal($user, $pass) {
    this.loginLoading = true
    this.login.error    = false
    this.auth.autorizar($user, $pass)
    .then($response => {
      if(this.auth.localGet("login").primer_login) {
        this.migrandoStatus = false
        this.loginLoading = false
        this.loginStatus = true
        //this.data.toggleLoginModal2()
      } else if(!this.auth.localGet("login").administrativo) {
        this.auth.get("cliente/datos")
        .then(($response)  =>{
          this.auth.localSet("user",  $response.response as cliente)
          this.data.toggleLoginStatus(true)
          this.loginLoading = false
          this.auth.userTypeUpdate($response.response["numeroListaPrecios"])  
        })
        .catch($error => {
          this.loginLoading = false        
          console.log($error)
        })
      } else {
        this.auth.get("cliente/getAll")
        .then(($response)  =>{
          this.data.toggleLoginStatus(true)
          this.loginLoading = false
          this.cuentasRepresentar = $response.response
          this.data.toggleRepresentar()
          this.cuentaLoading = true
        })
        .catch($error => {
          this.loginLoading = false        
          console.log($error)
        })

      }
    })
    .catch($catch    => {
      this.loginLoading = false        
      console.log($catch)
      this.login.errorMsg = ($catch.error.message)
      this.login.error    = true
    })
  }
  migrandoModal() {
    this.loginLoading = true
    this.login.error    = false
    this.login.errorMsg = ""
    let body = new URLSearchParams()

    body.set("email", this.migracion.email_original)
    body.set("confirmacion_email", this.migracion.email_repetido)
    body.set("contrasena", this.migracion.pass_original)
    body.set("confirmacion_contrasena", this.migracion.pass_repetido)

    this.auth.post('public/cliente/verificacion_datos', body)
    .then(($response)  =>{
      this.loginLoading = false
              this.login.confirMsg = ($response.body.response)
      /*this.auth.localSet("user",  $response.response as cliente)
      this.data.toggleLoginStatus(true)
      this.auth.userTypeUpdate($response.response["numeroListaPrecios"])  */
    })
    .catch($error => {
      this.loginLoading = false     
      if(typeof $error.error.response === "string") {
        this.login.errorMsg = $error.error.response
      } else {
        Object.keys($error.error.response).forEach(element => {
          this.login.errorMsg += $error.error.response[element] + " "
        })
      }
      this.login.error    = true
      console.log($error)
    })
  }
  cerrarRepresentarCuenta() {
    window.location.reload()
  }
  representarCuenta(cuenta) {
    this.cuentaRespuesta = "Esperando respuesta..."
    if(cuenta) {
      let body = new URLSearchParams();
      body.set("cuit_cliente", cuenta.cuit)
      this.auth.post('auth/admin/representar', body)
      .then($response => {
        this.cuentaRespuesta = $response.body.response
        setTimeout(()=>{
          let login = this.auth.localGet("login")
          login.token = $response.body.token
          this.auth.localSet("login", login)
          this.auth.tokenUpdate($response.body.token)
          this.auth.get("cliente/datos")
          .then(($response)  =>{
            this.auth.localSet("user",  $response.response as cliente)
            this.auth.userTypeUpdate($response.response["numeroListaPrecios"])  
            this.representarCancel()
            window.location.reload(true)
          })
          .catch($error => console.log($error))
        }, 1000)
      })
      .catch(($error) => {
        this.cuentaRespuesta = $error.error.response
      })
    }
  }
  representarCancel() {
    this.data.toggleRepresentar()
    this.loginStatus = true
  }
  enterLogin($event) {
    if($event.keyCode == 13) {
      this.loginModal(this.login.user, this.login.pass)
    }  
  }
  enterRecuperarEvento() {
    let body = new URLSearchParams();
    body.set("email", this.login.user);

    const headers = new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' });
    this.http.post(this.auth.getPath('public/cliente/recuperar_contrasena'),body.toString(), {headers, observe: 'response'})
    .subscribe(($response:any) => {
      //console.log("response", $response.body.response.mensaje)
      if($response.body.response.mensaje) {
        this.recuperarOk = $response.body.response.mensaje
      }
    },($error) => {
      try {
        Object.keys($error.error.response.error).forEach(element => {
          this.recuperarError += $error.error.response.error[element] + " "
        })
      } catch($throw) {
        console.log($throw)
      }
    })     
  }
  enterRecuperar($event) {
    this.recuperarOk = ""
    this.recuperarError = ""
    if($event.keyCode == 13) {
      //this.loginModal(this.login.user, this.login.pass)
      this.enterRecuperarEvento()

    }  
  }
  carritoModal() {
    this.data.toggleLoginModal2()
  }
  carritoCancelModal() {
    window.localStorage.setItem("carrito", JSON.stringify([]))
    this.data.lista = []
    this.data.updateMessage()
    this.data.toggleLoginModal2()
  }

  ckeckItem($item) {
    return {
      status: $item !== "" ? "" : "complete",
      text: $item !== "" ? $item : "¡Campo incompleto!"
    }
  }
  filterBusqueda:string
  formatMoney(n, c = undefined, d = undefined, t = undefined) {
    var c = isNaN(c = Math.abs(c)) ? 2 : c,
      d = d == undefined ? "," : d,
      t = t == undefined ? "." : t,
      s = n < 0 ? "-" : "",
      i = String(parseInt(n = Math.abs(Number(n) || 0).toFixed(c))),
      j = (j = i.length) > 3 ? j % 3 : 0;
  
    return s + (j ? i.substr(0, j) + t : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) + (c ? d + Math.abs(n - +i).toFixed(c).slice(2) : "");
  };  

}

@Pipe({
  name: 'cuentasFilter'
})
export class BusquedaCuentaPipe implements PipeTransform {
  transform(items: any[], searchText: string): any[] {
    if(!items) return [];
    if(!searchText) return items;
    
    searchText = searchText.toLowerCase();
        return items.filter( it => {
          return it.razon_social.toLowerCase().includes(searchText) || it.cuit.includes(parseInt(searchText))
        });
   } 
}
