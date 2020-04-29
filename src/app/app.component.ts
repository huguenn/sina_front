import { NgZone, Component, OnInit, ViewChild, ChangeDetectorRef, ElementRef, Pipe, PipeTransform } from '@angular/core';
import { SharedService, cliente, Dato, Configuracion } from '../app/shared.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { INgxMyDpOptions, IMyDateModel } from 'ngx-mydatepicker';
import { AutenticacionService } from './autenticacion.service';
import { DatabaseService } from './database.service';
import { Router, NavigationEnd } from '@angular/router';
import { MenuService } from './menu.service';
import { NgSelectComponent } from '@ng-select/ng-select';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [DatabaseService]
})
export class AppComponent implements OnInit {
  @ViewChild('ventana') el: ElementRef;
  @ViewChild('responsable') ngSelectResponsable: NgSelectComponent;
  @ViewChild('provincia_value') ngSelectProvincia: NgSelectComponent;
  @ViewChild('provincia_value2') ngSelectProvincia2: NgSelectComponent;
  @ViewChild('input_razon_social') inputRazonSocial: ElementRef;
  @ViewChild('input_email') inputEmail: ElementRef;
  @ViewChild('input_cuit') inputCuit: ElementRef;
  @ViewChild('input_telefono') inputTelefono: ElementRef;
  @ViewChild('input_ciudad') inputCiudad: ElementRef;
  @ViewChild('input_celular') inputCelular: ElementRef;
  @ViewChild('input_contrasena') inputContrasena: ElementRef;
  @ViewChild('input_check_contrasena') inputCheckContrasena: ElementRef;

  public focusingPassword: boolean;

  public recuperarClave: boolean;
  public validationCheckPassword: boolean = false;
  public validationPassword: boolean = false;
  public validationEmail: boolean = false;
  public validationCUIT: boolean = false;
  public validationTelefono: boolean = false;
  public validationCelular: boolean = false;
  public recuperarOk: string;
  public recuperarError: string;
  public usuario = {

  };

  public mensajesEstados: any = {
    campoNoValido: ''
  };

  public contacto: any = {
    razon_social: '',
    nombre_fantasia: '',
    email: '',
    contrasena: '',
    contrasenaRepetida: '',
    domicilio_ciudad: '',
    domicilio_direccion: '',
    domicilio_numero: '',
    domicilio_provincia: '',
    telefono_celular: '',
    telefono: '',
    cuit: '',
    nombre_responsable_compras: '',
    domicilio_codigo_postal: '',
    cod_categoria_iva: '',
    envio_domicilio_direccion: '',
    envio_domicilio_codigo_postal: '',
    envio_domicilio_ciudad: '',
    envio_domicilio_provincia: '',
    actividad: ''
  };

  public provincia = ['Ciudad de Buenos Aires', 'Buenos Aires', 'Catamarca', 'Chaco', 'Chubut', 'Córdoba',
    'Corrientes', 'Entre Ríos', 'Formosa', 'Jujuy', 'La Pampa', 'La Rioja', 'Mendoza', 'Misiones', 'Neuquén',
    'Río Negro', 'Salta', 'San Juan', 'San Luis', 'Santa Cruz', 'Santa Fe', 'Santiago del Estero', 'Tierra del Fuego', 'Tucumán', 'Otra'];
  public reponsable: Array<string> = [
    'Consumidor final',
    'Monotributista',
    'Responsable inscripto',
    'Exento',
    'Iva exento operación de exportación',
    'Monotributista social',
    'No responsable',
    'Pequeño contribuyente eventual',
    'Pequeño contribuyente eventual social',
    'Sujeto no categorizado'
  ];

  public migracion = {
    email_original: '',
    email_repetido: '',
    pass_original: '',
    pass_repetido: ''
  };

  public cuit: any = 'CUIT (Solo numeros)*';
  private cativa: string = '';
  private _disabledV: string = '0';
  private disabled: boolean = false;

  cat_selected: any;
  domicilio_provincia = '';
  envio_provincia = '';


  public seleccionar($herramienta, $codigo) {
    const item = $herramienta.itemsList._items.find($item => $item.value === $codigo);
    this.data.log('seleccionar items app:', this.cat_selected, this.domicilio_provincia, item);
    if (item) {
      $herramienta.select(item);
    // this.data.log('seleccionar items app:', cat_selected, this.ngSelectResponsable.open(), this.refResponsable)
    // this._ngZone.run(() => {this.cat_selected = cat_selected.codigo});
    }
  }

  public refreshCUIT(value: any): void {
    if (value == 'CF') {
      this.cuit = 'DNI (Solo numeros)*';
    } else {
      this.cuit = 'CUIT (Solo numeros)*';
    }

    if (value) {
      this.data.log('refreshcuit value app:', value);
      const responsable = this.data.reponsable_lista.find(($item) => $item.codigo === value);
      this.data.log('refreshcuit responsable app:', value, responsable);
      this.cativa = responsable.text;
      this.cat_selected = responsable.codigo;
    } else {
      this.data.log('refreshcuit no value app:', value);
      delete this.cat_selected;
    }

  }
  public deleteCUIT() {
    this.cat_selected = undefined;
  }
  public refreshProvincia(value: any): void {
    this.data.log('refreshprovincia value app:', value);
    this.domicilio_provincia = value;
    this.contacto.domicilio_provincia = value;
  }
  public deleteProvincia() {
    this.domicilio_provincia = '';
  }
  public refreshProvincia2(value: any): void {
    this.envio_provincia = value;
    this.contacto.envio_domicilio_provincia = value;
  }
  public deleteProvincia2() {
    this.envio_provincia = '';
  }

  processing = {
    started: false,
    right_now: false,
    finished: true,
    start: function () {
      this.started = true;
      this.right_now = true;
    },
    stop: function () {
      this.right_now = false;
      this.started = true;
    },
    finish: function () {
      this.right_now = false;
      this.started = false;
      this.finished = true;
    }
  };

  // sticky: any = {
  //   activo: false,
  //   call_to_action: '',
  //   link: '#',
  //   mensaje: '',
  //   inicio: '',
  //   fin: '',
  //   permanente: false
  // };
  emergentes = [];
  actualRoute = '/';
  // actualEmergente: any = {};
  actualEmergenteFlag: boolean = false;

  message: string;
  childmessage: Dato[] = [];
  menuStatus: number;
  loginStatus: boolean = true;
  carritoStatus: boolean;
  representarStatus: boolean;
  config: any;
  registrarStatus: boolean = false;
  login: any = {
    user: '',
    pass: '',
    error: false,
    errorMsg: '',
    confirMsg: ''
  };
  ventana;
  eventoclick($event) {
    if ($event.path) {
      if (!$event.path.some($element => ($element.className === 'buy' || $element.className === 'login'))) {
        this.menu.notifyOther(true);
      }
    } else {
      if (!('path' in Event.prototype)) {
        Object.defineProperty(Event.prototype, 'path', {
          get: function () {
            const path = [];
            let currentElem = this.target;
            while (currentElem) {
              path.push(currentElem);
              currentElem = currentElem.parentElement;
            }
            if (path.indexOf(window) === -1 && path.indexOf(document) === -1) {
              path.push(document);
            }
            if (path.indexOf(window) === -1) {
              path.push(window);
            }
            return path;
          }
        });
      }
      if (!$event.path.some($element => ($element.className === 'buy' || $element.className === 'login'))) {
        this.menu.notifyOther(true);
      }
    }
  }
  _MODES: Array<string> = ['over', 'push', 'slide'];
  _opened: boolean = false;
  _option: number = 2;

  myOptions: INgxMyDpOptions = {
    // other options...
    dateFormat: 'dd.mm.yyyy',
  };
  // datepicker
  model: any = {};
  // optional date changed callback
  onDateChanged(event: IMyDateModel): void {
    // date selected
  }
  _step: number = 1;
  _anteriorStep() {
    if (this._step > 1) {
      this._step--;
      if (this._step === 1) {
        setTimeout(() => {
          this.seleccionar(this.ngSelectResponsable, this.cat_selected);
          this.seleccionar(this.ngSelectProvincia, this.domicilio_provincia);
        }, 500);
      } else if (this._step === 2) {
        setTimeout(() => {
          this.seleccionar(this.ngSelectProvincia2, this.envio_provincia);
        }, 500);
      }
    } else {
      this.registrarStatus = false;
    }
  }
  confirmacion: any = {
    error: false,
    mensaje: 'Se ha enviado un correo a el mail provisto para su confirmación, por favor siga los pasos del mismo.',
    action: 'Volver al inicio',
    value: () => {
      this.processing.finish(); this.registrarStatus = false; this._changeStep(1);
    }
  };
  error: any = {
    error: true,
    mensaje: '',
    action: 'Volver al primer paso',
    value: () => {
      this.processing.finish(); this._changeStep(1);
    },
    reset: () => {
      this.error.mensaje = '';
    }
  };
  response: any;
  validador = {};
  obligatorios = ['razon_social', 'domicilio_ciudad', 'email', 'cuit', 'telefono', 'contrasena'];
  no_obligatorios = ['nombre_fantasia'];
  _changeStep($step) {
    // this.data.log('_changestep app', '$step: '+$step, '_step: '+this._step);
    if (this._step === 3 && !$step) {
      if (this.processing.finished) {
        const Cat = this.data.reponsable_lista.find(element => element.text === this.cativa);
        this.contacto['cod_categoria_iva'] = Cat ? Cat.codigo : '';
        try {
          this.no_obligatorios.forEach($item => {
            if (this.contacto[$item] === '') {
              delete this.contacto[$item];
            }
          });
        } catch ($catch) { }
        let validando = false;
        for (const key in this.contacto) {
          if (this.contacto.hasOwnProperty(key)) {
            const element = this.contacto[key];
            if (this.obligatorios.includes(key) && element === '') {
              validando = true;
              return 0;
            }
          }
        }
        if (!validando) {
          this.processing.start();
          const body = new URLSearchParams();

          Object.keys(this.contacto).forEach(element => {
            if (!element.includes('domicilio_direccion')) {
              body.set(element, this.contacto[element]);
            } else {
              if (element.includes('envio_domicilio_direccion')) {
                body.set(element, this.contacto.envio_domicilio_direccion + (this.contacto.entrega_domicilio_numero ? ' ' + this.contacto.entrega_domicilio_numero : ''));
              } else {
                body.set(element, this.contacto.domicilio_direccion + (this.contacto.domicilio_numero ? ' ' + this.contacto.domicilio_numero : ''));
              }
            }
          });
          const headers = new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' });

          /*
          this.data.log('_changestep body.toString() app', body.toString())
          this.processing.stop()

          this.response = this.confirmacion

          this.error.reset()
          this.response = this.error
          this.response.mensaje = "prueba"
          */

          this.http.post(this.auth.getPath('public/cliente/nuevo'), body.toString(), { headers, observe: 'response' })
            .subscribe($response => {
              this.processing.stop();
              this.response = this.confirmacion;
            }, ($error) => {
              this.processing.stop();
              this.error.reset();
              this.response = this.error;
              try {
                Object.keys($error.error.response.error).forEach(element => {
                  this.response.mensaje += $error.error.response.error[element] + '\n';
                });
              } catch ($throw) {
                this.data.log('postnuevocliente error app', $throw);
              }
            });
        } else {
          // this.data.log('no validado error app', this.contacto)
        }
      }
    } else {
      if (this._step === 1) {

        if (this.contacto.contrasena !== this.contacto.contrasenaRepetida) {
          this.validationCheckPassword = true;
          this.validador['checkcontrasena'] = true;
          this.inputCheckContrasena.nativeElement.focus();
        } else {
          this.validationCheckPassword = false;
          delete this.validador['checkcontrasena'];
        }

        // this.data.log('step1 validador app', this.validador)
        // Aca paso por cada campo obligatorio
        this.obligatorios.forEach($campo_obligatorio => {
          if (!this.contacto[$campo_obligatorio]) {
            this.validador[$campo_obligatorio] = true;
            if($campo_obligatorio === 'contrasena') {
              this.inputContrasena.nativeElement.focus();
            }
            if($campo_obligatorio === 'domicilio_ciudad') {
              this.inputCiudad.nativeElement.focus();
            }
            if($campo_obligatorio === 'telefono') {
              this.inputTelefono.nativeElement.focus();
            }
            if($campo_obligatorio === 'cuit') {
              this.inputCuit.nativeElement.focus();
            }
            if($campo_obligatorio === 'email') {
              this.inputEmail.nativeElement.focus();
            }
            if($campo_obligatorio === 'razon_social') {
              this.inputRazonSocial.nativeElement.focus();
            }
          } else {
            delete this.validador[$campo_obligatorio];
          }

          // Chequeo que el cuit contenga solo números, sin puntos ni guiones
          if ($campo_obligatorio === 'cuit' && this.contacto[$campo_obligatorio]) {
            const cuitRegExp = new RegExp(/^\d+$/); // numeros del 0 al 9
            if (cuitRegExp.test(this.contacto[$campo_obligatorio])) {
              delete this.validador[$campo_obligatorio];
              this.validationCUIT = false;
            } else {
              this.validador[$campo_obligatorio] = true;
              this.validationCUIT = true;
              this.inputCuit.nativeElement.focus();
            }
          }

          // Chequeo el telefono
          if ($campo_obligatorio === 'telefono' && this.contacto[$campo_obligatorio]) {
            const telefonoRegExp = new RegExp(/^[^A-z-][\d-]+[^A-z-]$/); // numeros del 0 al 9 y guiones entre ellos (no al principio ni al final)
            if (telefonoRegExp.test(this.contacto[$campo_obligatorio])) {
              delete this.validador[$campo_obligatorio];
              this.validationTelefono = false;
            } else {
              this.validador[$campo_obligatorio] = true;
              this.validationTelefono = true;
              this.inputTelefono.nativeElement.focus();
            }
          }

          // Chequeo que el email contenga los caracteres necesarios
          if ($campo_obligatorio === 'email'  && this.contacto[$campo_obligatorio]) {
            const emailRegExp = new RegExp(/^[^\.][^\s@#!]+@[^\s@.#!]+\.[^\s@.]+\.*[^\s@.]+$/); // expresion simple como algo + @ + algo + . + algo (OPCIONAL: + . + algo)
            if (emailRegExp.test(this.contacto[$campo_obligatorio])) {
              delete this.validador[$campo_obligatorio];
              this.validationEmail = false;
            } else {
              this.validador[$campo_obligatorio] = true;
              this.validationEmail = true;
              this.inputEmail.nativeElement.focus();
            }
          }

          // Chequeo la constraseña
          if ($campo_obligatorio === 'contrasena' && this.contacto[$campo_obligatorio]) {
            const passwordRegExp = new RegExp(/.{6,}/); // 6 caracteres o mas
            if (passwordRegExp.test(this.contacto[$campo_obligatorio])) {
              delete this.validador[$campo_obligatorio];
              this.validationPassword = false;
            } else {
              this.validador[$campo_obligatorio] = true;
              this.validationPassword = true;
              this.inputContrasena.nativeElement.focus();
            }
          }

        });

        // Chequeo el celular si es que tiene algo escrito porque no es obligatorio
        if (this.contacto['telefono_celular']) {
          const celularRegExp = new RegExp(/^[^A-z-][\d-]+[^A-z-]$/); // numeros del 0 al 9 y guiones entre ellos (no al principio ni al final)
          if (celularRegExp.test(this.contacto['telefono_celular'])) {
            delete this.validador['telefono_celular'];
            this.validationCelular = false;
          } else {
            this.validador['telefono_celular'] = true;
            this.validationCelular = true;
            this.inputCelular.nativeElement.focus();
          }
        } else {
          delete this.validador['telefono_celular'];
          this.validationCelular = false;
        }

        if (this.cat_selected && Object.keys(this.cat_selected).length !== 0) {
          delete this.validador['cat_selected'];
        } else {
          this.validador['cat_selected'] = true;
          this.ngSelectResponsable.elementRef.nativeElement.querySelector("input").focus();
        }
        if (this.domicilio_provincia && Object.keys(this.domicilio_provincia).length !== 0) {
          delete this.validador['domicilio_provincia'];
        } else {
          this.validador['domicilio_provincia'] = true;
          this.ngSelectProvincia.elementRef.nativeElement.querySelector("input").focus();
        }
      }
      if (Object.keys(this.validador).length === 0 && this.validador.constructor === Object) {
        this._step = $step ? $step : (this._step < 3 ? this._step + 1 : 3);
        if (this._step === 1) {
          setTimeout(() => {
            this.seleccionar(this.ngSelectResponsable, this.cat_selected);
            this.seleccionar(this.ngSelectProvincia, this.domicilio_provincia);
          }, 500);
        }
        if (this._step === 2) {
          setTimeout(() => {
            if (this.envio_provincia) {
              this.seleccionar(this.ngSelectProvincia2, this.envio_provincia);
            }
          }, 500);
        }
      }
    }
  }

  public _toggleRegistrarStatus() {
    this.registrarStatus = !this.registrarStatus;

    if (this._step === 1) {
      setTimeout(() => {
        this.seleccionar(this.ngSelectResponsable, this.cat_selected);
        this.seleccionar(this.ngSelectProvincia, this.domicilio_provincia);
      }, 500);
    }
    if (this._step === 2) {
      setTimeout(() => {
        if (this.envio_provincia) {
          this.seleccionar(this.ngSelectProvincia2, this.envio_provincia);
        }
      }, 500);
    }
  }

  private _toggleSidebar() {
    this._opened = !this._opened;
  }
  constructor(
    private _ngZone: NgZone,
    private menu: MenuService,
    private cdRef: ChangeDetectorRef,
    private data: SharedService,
    private http: HttpClient,
    private auth: AutenticacionService,
    private db: DatabaseService,
    private router: Router) {
    this.recuperarClave = false;
    this.recuperarOk = '';
    this.recuperarError = '';
  }
  ngAfterViewChecked() {
    this.cdRef.detectChanges();
  }

  ngOnInit() {
    // subscribing to data on carrito
    this.data.currentMessage.subscribe(
      message => {
        this.childmessage = message;
      }
    );
    // subscribing to data on sidebar
    this.data.currentSide.subscribe(
      status => {
        this._opened = status;
      }
    );
    // subscribing to data on loginStatus
    this.data.currentModal.subscribe(
      status => {
        this.loginStatus = status;
      }
    );
    // subscribing to data on CarritoStatus
    this.data.currentModal2.subscribe(
      status => {
        this.carritoStatus = status;
      }
    );
    // subscribing to data on representarStatus
    this.data.currentRepresentar.subscribe(
      status => {
        this.representarStatus = status;
      }
    );
    // subscribing to router change
    this.router.events.subscribe(val => {
      if (this.actualRoute !== val['url']) {
        this.actualRoute = (val['url']);
        if (this.emergentes.length) {
          this.find_index();
        }
      }
      if (!(val instanceof NavigationEnd)) {
        return;
      }
      this.el.nativeElement.parentElement.scrollTop = 0;
    });

    // subscribing to config change
    this.data.currentConfig.subscribe(
      configuracion => {
        this.config = configuracion;
        if(this.config.ventanaEmergenteActivo) {
          this.find_index();
        }
      }
    )

    // reading config data
    this.auth.get('public/configuracion')
    .then(($response) => {
      this.data.log('response publicconfiguracion app', $response);
      if($response.response) {
        const ahora = new Date();
        const fechaDesde = $response.response.stickyHeaderDesde ? new Date($response.response.stickyHeaderDesde.date) : ahora;
        const fechaHasta = $response.response.stickyHeaderHasta ? new Date($response.response.stickyHeaderHasta.date) : ahora;
        const permanente = $response.response.stickyHeaderPermanente === '1' ? true : false;
        const c = {
          montoEnvioGratis: Number.parseInt($response.response.montoEnvioGratis, 10),
          stickyHeaderTitulo: $response.response.stickyHeaderTitulo,
          stickyHeaderCta: $response.response.stickyHeaderCta,
          stickyHeaderLink: $response.response.stickyHeaderLink,
          stickyHeaderDesde: fechaDesde,
          stickyHeaderHasta: fechaHasta,
          stickyHeaderActivo: permanente ? ($response.response.stickyHeaderActivo === '1' ? true : false) : ($response.response.stickyHeaderActivo === '1'  && ahora > fechaDesde && ahora < fechaHasta ? true : false),
          stickyHeaderPermanente: permanente,
          ventanaEmergenteTitulo: $response.response.ventanaEmergenteTitulo,
          ventanaEmergenteImagen: $response.response.ventanaEmergenteImagen,
          ventanaEmergenteActivo: $response.response.ventanaEmergenteActivo === '1' ? true : false,
        }
        this.data.updateConfiguracion(c);
      }
    })
    .catch($error => {
      this.data.log('problemas con la configuracion app');
      this.data.log('getconfiguracion error app', $error);
    });

    // subscribing to data on Firebase DEPRECATED
    // this.db.getDocument('sticky').subscribe(value => {
    //   if (value) {
    //     this.sticky = value;
    //   }
    // });
    // subscribing to data on Firebase DEPRECATED
    // this.db.getCollection('emergentes').subscribe(value => {
    //   if (value) {
    //     this.emergentes = value;
    //     this.find_index();
    //   }
    // });

    // binding interval
    setInterval(() => {
      this.menuStatus = this.el.nativeElement.parentElement.scrollTop;
    }, 100);

    // reading user data
    if (this.auth.localGet('login')) {
      this.auth.get('cliente/datos')
        .then(($response) => {
          const datos_locales = this.auth.localGet('user');
          if ($response.response['codigo'] !== datos_locales['codigo']) {
            window.location.reload(); // podría caer en un loop infinito aca? no hay ningun localset que lo pare?
          } else {
            // this.data.log('getclientedatos error codigouser app', datos_locales, $response.response)
          }
          this.auth.localSet('user', $response.response as cliente);
          this.data.updateUser($response.response);
          // this.auth.userTypeUpdate($response.response["numeroListaPrecios"])
        })
        .catch($error => {
          this.data.log('problemas con el login/token app', this.auth.localGet('login'));
          this.data.log('getdatoscliente error app', $error);
        });
    }

  }

  find_index() {
    const item = this.actualRoute === '/' ? 'home' : this.actualRoute;
    if (item) {
      // const index = this.emergentes.findIndex(($element) => {
      //   return item.indexOf($element.seccion) !== -1;
      // });
      if (this.actualRoute.indexOf('confirmacion') === -1) {
        // if (index !== -1) {
          if (this.carritoStatus && this.loginStatus) {
            if (!this.auth.localGet('actualEmergenteFlag')) {
              // this.actualEmergente = this.emergentes[index];
              this.actualEmergenteFlag = true;
              this.auth.localSet('actualEmergenteFlag', true);
            }
          } else {
            this.actualEmergenteFlag = false;
            this.auth.localSet('actualEmergenteFlag', false);
          }
        // }
      } else {
        this.actualEmergenteFlag = false;
        this.data.closeLoginModal();
      }
    }
  }

  closeFull(event) {
    if (event.target.className === 'modal__container') {
      this.closeModal();
    }
  }
  closeFull2(event) {
    if (event.target.className === 'modal__container') {
      this.carritoCancelModal();
    }
  }
  migrandoStatus: boolean = true;
  migrandoCancelModal() {
    this.migrandoStatus = true;
  }
  closeFull3(event) {
    if (event.target.className === 'modal__container') {
      this.migrandoCancelModal();
    }
  }
  closeFullRepresentar(event) {
    if (event.target.className === 'modal__container') {
      this.representarCancel();
    }
  }
  closeEmergente(event) {
    if (event.target.className === 'modal__container') {
      this.closeEmergente2();
    }
  }
  closeEmergente2() {
    this.actualEmergenteFlag = false;
  }

  updatePrecio($precio, $cantidad): string {
    const subtotal = $precio * $cantidad;
    return this.formatMoney(subtotal);
  }
  closeModal() {
    this.data.toggleLoginModal();
    this.registrarStatus = false;
  }
  loginLoading = false;
  cuentasRepresentar = [];
  cuentaSeleccionada: any;
  cuentaLoading: boolean = false;
  cuentaRespuesta: string = '';
  seleccionarCuenta(cuenta) {
    this.cuentaSeleccionada = Object.assign({}, cuenta);
  }
  loginModal($user, $pass) {
    this.loginLoading = true;
    this.login.error = false;
    this.auth.autorizar($user, $pass)
      .then($response => {
        if (this.auth.localGet('login').primer_login) {
          this.migrandoStatus = false;
          this.loginLoading = false;
          this.loginStatus = true;
          // this.data.toggleLoginModal2()
        } else if (!this.auth.localGet('login').administrativo) {
          this.auth.get('cliente/datos')
            .then(($response) => {
              this.auth.localSet('user', $response.response as cliente);
              this.data.toggleLoginStatus(true);
              this.loginLoading = false;
              this.auth.userTypeUpdate($response.response['numeroListaPrecios']);
            })
            .catch($error => {
              this.loginLoading = false;
              this.data.log('loginmodal error app', $error);
            });
        } else {
          this.auth.get('cliente/getAll')
            .then(($response) => {
              this.data.toggleLoginStatus(true);
              this.loginLoading = false;
              this.cuentasRepresentar = $response.response;
              this.data.toggleRepresentar();
              this.cuentaLoading = true;
            })
            .catch($error => {
              this.loginLoading = false;
              this.data.log('clientegetall error app', $error);
            });

        }
      })
      .catch($catch => {
        this.loginLoading = false;
        this.data.log('loginmodal error app', $catch);
        this.login.errorMsg = ($catch.error.message);
        this.login.error = true;
      });
  }
  migrandoModal() {
    this.loginLoading = true;
    this.login.error = false;
    this.login.errorMsg = '';
    const body = new URLSearchParams();

    body.set('email', this.auth.email);
    body.set('confirmacion_email', this.auth.email);
    body.set('contrasena', this.migracion.pass_original);
    body.set('confirmacion_contrasena', this.migracion.pass_repetido);

    this.auth.post('public/cliente/verificacion_datos', body)
      .then(($response) => {
        this.loginLoading = false;
        this.login.confirMsg = ($response.body.response);
        /*this.auth.localSet("user",  $response.response as cliente)
        this.data.toggleLoginStatus(true)
        this.auth.userTypeUpdate($response.response["numeroListaPrecios"])  */
      })
      .catch($error => {
        this.loginLoading = false;
        if (typeof $error.error.response === 'string') {
          this.login.errorMsg = $error.error.response;
        } else {
          Object.keys($error.error.response).forEach(element => {
            this.login.errorMsg += $error.error.response[element] + ' ';
          });
        }
        this.login.error = true;
        this.data.log('postverificaciondatos error app', $error);
      });
  }
  cerrarRepresentarCuenta() {
    window.location.reload();
  }
  representarCuenta(cuenta) {
    this.cuentaRespuesta = 'Esperando respuesta...';
    if (cuenta) {
      const body = new URLSearchParams();
      body.set('cuit_cliente', cuenta.cuit);
      this.auth.post('auth/admin/representar', body)
        .then($response => {
          this.cuentaRespuesta = $response.body.response;
          setTimeout(() => {
            const login = this.auth.localGet('login');
            login.token = $response.body.token;
            this.auth.localSet('login', login);
            this.auth.tokenUpdate($response.body.token);
            this.auth.get('cliente/datos')
              .then(($response) => {
                this.auth.localSet('user', $response.response as cliente);
                this.auth.userTypeUpdate($response.response['numeroListaPrecios']);
                this.representarCancel();
                window.location.reload(true);
              })
              .catch($error => this.data.log('representarcuenta error app', $error));
          }, 1000);
        })
        .catch(($error) => {
          this.cuentaRespuesta = $error.error.response;
        });
    }
  }
  representarCancel() {
    this.data.toggleRepresentar();
    this.loginStatus = true;
  }
  enterLogin($event) {
    if ($event.keyCode == 13) {
      this.loginModal(this.login.user, this.login.pass);
    }
  }
  enterRecuperarEvento() {
    const body = new URLSearchParams();
    body.set('email', this.login.user);

    const headers = new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' });
    this.http.post(this.auth.getPath('public/cliente/recuperar_contrasena'), body.toString(), { headers, observe: 'response' })
      .subscribe(($response: any) => {
        // this.data.log('recuperarcontraseña response app', $response.body.response.mensaje)
        if ($response.body.response.mensaje) {
          this.recuperarOk = $response.body.response.mensaje;
        }
      }, ($error) => {
        try {
          Object.keys($error.error.response.error).forEach(element => {
            this.recuperarError += $error.error.response.error[element] + ' ';
          });
        } catch ($throw) {
          this.data.log('recuperarcontraseña error app', $throw);
        }
      });
  }
  enterRecuperar($event) {
    this.recuperarOk = '';
    this.recuperarError = '';
    if ($event.keyCode == 13) {
      // this.loginModal(this.login.user, this.login.pass)
      this.enterRecuperarEvento();

    }
  }
  carritoModal() {
    this.data.toggleLoginModal2();
  }
  carritoCancelModal() {
    window.localStorage.setItem('carrito', JSON.stringify([]));
    this.data.lista = [];
    this.data.updateMessage();
    this.data.toggleLoginModal2();
  }

  ckeckItem($item) {
    return {
      status: $item !== '' ? '' : 'complete',
      text: $item !== '' ? $item : '¡Campo incompleto!'
    };
  }
  filterBusqueda: string;
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

  focusResponsable() {
    if (window.outerWidth && window.outerWidth < 540) {
      this.ngSelectResponsable.elementRef.nativeElement.querySelector("input").blur();
    }
  }
  focusProvincia() {
    if (window.outerWidth && window.outerWidth < 540) {
      this.ngSelectProvincia.elementRef.nativeElement.querySelector("input").blur();
    }
  }
  focusProvincia2() {
    if (window.outerWidth && window.outerWidth < 540) {
      this.ngSelectProvincia2.elementRef.nativeElement.querySelector("input").blur();
    }
  }

  passwordFocused() {
    this.focusingPassword = true;
  }
  passwordBlured() {
    this.focusingPassword = false;
  }

}

@Pipe({
  name: 'cuentasFilter'
})
export class BusquedaCuentaPipe implements PipeTransform {
  transform(items: any[], searchText: string): any[] {
    if (!items) { return []; }
    if (!searchText) { return items; }

    searchText = searchText.toLowerCase();
    return items.filter(it => {
      return it.razon_social.toLowerCase().includes(searchText) || it.cuit.includes(parseInt(searchText));
    });
  }
}
