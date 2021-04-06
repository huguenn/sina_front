import { HttpClient } from '@angular/common/http';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgSelectComponent } from '@ng-select/ng-select';
import { debounceTime } from 'rxjs/operator/debounceTime';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs/Subject';
import { Subscription } from 'rxjs/Subscription';
import { AutenticacionService } from '../autenticacion.service';
import { Datos, DatosTransaccion } from '../data';
import { cliente, SharedService } from '../shared.service';

const datosFis: Datos[] = [
  {
    texto: 'Nombre completo',
    model: 'nombre',
  },
  {
    texto: 'Direccion',
    model: 'direccion',
  },
  {
    texto: 'Localidad',
    model: 'nombre',
  },
  {
    texto: 'Provincia',
    model: 'nombre',
  },
  {
    texto: 'Telefono',
    model: 'nombre',
  },    {
    texto: 'E-mail',
    model: 'nombre',
  },
];
const Items = [
  {
    texto: 'Mi Cuenta',
    model: './assets/images/iconos/Mi-cuenta.png',
    icon: 'user',
  },
  {
    texto: 'Mis Datos',
    model: './assets/images/iconos/Mis-datos.png',
    icon: 'table',
  },
  {
    texto: 'Mis frecuentes',
    model: './assets/images/iconos/Mis-frecuentes.png',
    icon: 'clock-o',
  },
  {
    texto: 'Últimas compras',
    model: './assets/images/iconos/Mis-ultimas-compras.png',
    icon: 'reply',
  },
  {
    texto: 'Cerrar sesión',
    model: './assets/images/iconos/Cerrar-sesion.png',
    icon: 'times-circle',
  },
];

@Component({
  selector: 'app-cuenta',
  templateUrl: './cuenta.component.html',
  styleUrls: ['./cuenta.component.css'],
})
export class CuentaComponent implements OnInit, OnDestroy {
  private destroy$: Subject<void> = new Subject<void>();
  @ViewChild('responsable') ngSelectResponsable: NgSelectComponent;
  @ViewChild('provincia_value') ngSelectProvincia: NgSelectComponent;
  @ViewChild('provincia_value2') ngSelectProvincia2: NgSelectComponent;
  @ViewChild('transporte') ngSelectTransporte: NgSelectComponent;

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
  iva_usuario: string = '';
  currentJustify = 'end';
  datosFiscales = datosFis;
  transaccion: DatosTransaccion;
  sub: Subscription;
  ListaCompras;
  ListaItems = Items;

  desplegar = 'none';
  loginStatus: boolean = false;
  private _success = new Subject<string>();
  staticAlertClosed = false;
  successMessage: string;

  DatosUsuario: cliente = new cliente();

  comprados;

  ultimasCompras = [];
  listadoProductos = [];
  listadoFrecuentes = [];

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

  provincia_lista = [];
  transporte_lista = [];
  initialLista = [];
  procesando_info: boolean = false;
  procesando_info_entrega: boolean = false;
  procesando_info_error: string = '';
  procesando_info_entrega_error: string = '';
  procesando_info_ok: string = '';
  procesando_info_entrega_ok: string = '';
  constructor(
    // private _ngZone: NgZone,
    private data:   SharedService,
    private route:  ActivatedRoute,
    private router: Router,
    private http:   HttpClient,
    private auth:   AutenticacionService,
  ) {
    this.transaccion = new DatosTransaccion(0);

    this.http.get('assets/data/cuenta.json')
    .pipe(takeUntil(this.destroy$)).subscribe((res) => {
      this.ListaCompras = res['lista'];
      // this.comprados    = res["comprados"]
      // this.ultimasCompras = res["ultimasCompras"]
    });
    this.auth.get('pedido/getUltimos')
    .then(($response)  => {
      if ($response.response) {
        this.ultimasCompras = $response.response;
        this.data.log('getultimospedidos response cuenta:', this.ultimasCompras, 'ko');
        this.ultimasCompras.forEach((compra) => {
          const fechaP = new Date(compra['fechaPedido'].date);
          compra['fechaPedido'].date = {
            year: fechaP.getFullYear(),
            date: fechaP.getDate(),
            month: fechaP.getMonth() + 1,
          };
        });
      }
    })
    .catch(($error) => {
      this.data.log('getultimospedidos error cuenta:', $error);
      this.router.navigate(['/']);
    });
    this.auth.get('producto/productosMasPedidos')
    .then(($response) => {
      if ($response.response) {
        this.comprados = $response.response;
        this.data.log('productosmaspedidos response cuenta:', this.comprados);
        this.comprados.forEach((producto) => {
          this.data.lista.forEach((articulo_carrito) => {
            if (articulo_carrito.id === producto.id) {
              producto.comprado = true;
            }
          });
          producto.cantidad = producto['cantSugerida'] ? parseInt(producto['cantSugerida']) : 1;
          if (producto['cantPack'] !== '1') {
            producto.cantidad = producto['cantPack'] ? parseInt(producto['cantPack']) : 1;
            producto.arrayCants = [];
            for (let i = 0; i < 20; i++) {
              producto.arrayCants[i] = producto.cantidad * (i + 1);
            }
            for (let i = 0; i < 50; i++) {
              producto.arrayCants[i + 20] = producto.cantidad * (i + 3) * 10;
            }
          }
        });
      }
    })
    .catch(($error) => {
      this.data.log('productosmaspedidos error cuenta:', $error);
      this.router.navigate(['/']);
    });
  }

  public refreshCategoria(value: any): void {
    if (this.DatosUsuario) {
      this.DatosUsuario.codCategoriaIva = value;
    }
  }
  public refreshProvincia(value: any): void {
    if (this.DatosUsuario.domicilio) {
      this.DatosUsuario.domicilio.provincia = value;
    }
  }
  public refreshProvincia2(value: any): void {
    if (this.DatosUsuario.datosEnvio.domicilioEntrega) {
      this.DatosUsuario.datosEnvio.domicilioEntrega.provincia = value;
    }
  }
  public refreshTransporte(value: any): void {
    // this.medioTransporte = value.text
    if (this.DatosUsuario.datosEnvio) {
      this.DatosUsuario.datosEnvio.codigoTransporte = value;
    }
  }
  repetirPregunta($item) {
    this.repetirFlag = true;
    this.repetirTemp = $item;
  }
  repetirTemp = [];
  repetirFlag: boolean = false;
  repetirCancelar() {
    this.repetirTemp = [];
    this.repetirFlag = false;
  }
  repetirCompra() {
    let delay: number;
    const $item = this.repetirTemp;
    if (this.ultimasCompras.length > 0) {
      if ($item['items'].length > 0) {
        this.auth.get('carrito/eliminar').then((result) => {
          this.data.cleanCarrito();
          this.data.updateMessage([]);

          $item['items'].forEach((compra) => {
            if (delay < 1000) {
              delay += 100;
            }

            const body = new URLSearchParams();
            body.set('id_producto', compra.producto.id);
            body.set('cantidad', compra.cantidad);
            this.auth.post('carrito/agregar_item', body)
            .then(($response) => {
              this.data.log('response carritoagregaritem cuenta', $response);

              this.data.changeMessage(compra.cantidad ? parseInt(compra.cantidad, 10) : 1,
              compra.producto.titulo, compra.producto.precio, parseFloat(compra.producto.precio) * parseInt(compra.producto.cantidad, 10), compra.producto.id,
              compra.producto.codInterno, (compra.producto.categorias && compra.producto.categorias.length > 0) ? compra.producto.categorias[0].nombre : '', compra.producto.cantPack);
            })
            .catch(($error) => {
              this.data.log('error carritoagregaritem cuenta', $error);
              // compra.producto.comprado = true;
            });
          });

          setTimeout(() => {
            this.router.navigate(['/compra/carrito']);
          }, delay);

        }).catch((error) => {
          this.data.log('carrito/eliminar error cuenta:', error);

          this.data.cleanCarrito();
          this.data.updateMessage([]);

          $item['items'].forEach((compra) => {
            if (delay < 1000) {
              delay += 100;
            }

            const body = new URLSearchParams();
            body.set('id_producto', compra.producto.id);
            body.set('cantidad', compra.cantidad);
            this.auth.post('carrito/agregar_item', body)
            .then(($response) => {
              this.data.log('response carritoagregaritem cuenta', $response);

              this.data.changeMessage(compra.cantidad ? parseInt(compra.cantidad, 10) : 1,
              compra.producto.titulo, compra.producto.precio, parseFloat(compra.producto.precio) * parseInt(compra.producto.cantidad, 10), compra.producto.id,
              compra.producto.codInterno, (compra.producto.categorias && compra.producto.categorias.length > 0) ? compra.producto.categorias[0].nombre : '', compra.producto.cantPack);
            })
            .catch(($error) => {
              this.data.log('error carritoagregaritem cuenta', $error);
              // compra.producto.comprado = true;
            });
          });

          setTimeout(() => {
            this.router.navigate(['/compra/carrito']);
          }, delay);
        });
      }
    }
  }
  closeRepetir(event) {
    if (event.target.className === 'modal__container') {
      this.repetirCancelar();
    }
  }
  ngOnInit() {
    this.data.updatePageTitle();
    setTimeout(() => this.staticAlertClosed = true, 5000);
    this._success.pipe(takeUntil(this.destroy$)).subscribe((message) => this.successMessage = message);
    debounceTime.call(this._success, 5000).subscribe(() => this.successMessage = null);

    this.sub = this.route
    .queryParams
    .pipe(takeUntil(this.destroy$)).subscribe((params) => {
      this.transaccion.cambio(+params['tab'] || 0);
    });
    // subscribing to data on loginStatus
    this.data.currentLogin.pipe(takeUntil(this.destroy$)).subscribe(
      (status) => {
        this.loginStatus = status;
      },
    );
    // Esto se está llamando dos veces seguidas, no se por que aun (cold observer? que deberia ser hot?)
    this.data.currentUser.pipe(takeUntil(this.destroy$)).subscribe(($user: any) => {
      if ($user) {
        this.DatosUsuario = $user;

        if (this.DatosUsuario.datosEnvio) {
          this.DatosUsuario.datosEnvio.entregaLunes = this.DatosUsuario.datosEnvio.entregaLunes && this.DatosUsuario.datosEnvio.entregaLunes === '1' ? true : false;
          this.DatosUsuario.datosEnvio.entregaMartes = this.DatosUsuario.datosEnvio.entregaMartes && this.DatosUsuario.datosEnvio.entregaMartes === '1' ? true : false;
          this.DatosUsuario.datosEnvio.entregaMiercoles = this.DatosUsuario.datosEnvio.entregaMiercoles && this.DatosUsuario.datosEnvio.entregaMiercoles === '1' ? true : false;
          this.DatosUsuario.datosEnvio.entregaJueves= this.DatosUsuario.datosEnvio.entregaJueves && this.DatosUsuario.datosEnvio.entregaJueves === '1' ? true : false;
          this.DatosUsuario.datosEnvio.entregaViernes = this.DatosUsuario.datosEnvio.entregaViernes && this.DatosUsuario.datosEnvio.entregaViernes === '1' ? true : false;
          this.DatosUsuario.datosEnvio.entregaSabado = this.DatosUsuario.datosEnvio.entregaSabado && this.DatosUsuario.datosEnvio.entregaSabado === '1' ? true : false;
        }

        new Promise(($acepto, $rechazo) => {
          this.auth.get('public/cliente/envio/getAll').then((result) => {
            if (result.responseT) {
              this.transporte_lista = [];
              result.responseT.forEach((transporte) => {
                this.transporte_lista.push({
                  id: transporte.codigo,
                  text: transporte.nombre,
                });
              });
            }
            if (result.responseP) {
              this.provincia_lista = [];
              result.responseP.forEach((provincia) => {
                this.provincia_lista.push({
                  id: provincia.codigo,
                  text: provincia.nombre,
                });
              });
            }
            
            $acepto('ok');
          }).catch((error) => $rechazo(error));
        })
        .then(($respuesta) => {
          this.data.log('userenviogetall response cuenta:', 'okerso', this.transporte_lista, this.initialLista);
          if (this.transaccion.paso === 1) {
            setTimeout(() => {
              if (this.DatosUsuario.codCategoriaIva) {
                this.seleccionariva(this.ngSelectResponsable, this.DatosUsuario.codCategoriaIva);
              }
              if (this.DatosUsuario.domicilio.provincia) {
                this.seleccionarprovincia(this.ngSelectProvincia, this.DatosUsuario.domicilio.provincia);
              }
              if (this.DatosUsuario.datosEnvio.domicilioEntrega.provincia) {
                this.seleccionarprovincia2(this.ngSelectProvincia2, this.DatosUsuario.datosEnvio.domicilioEntrega.provincia);
              }
              if (this.DatosUsuario.datosEnvio.nombreTransporte) {
                this.seleccionartransporte(this.ngSelectTransporte, this.DatosUsuario.datosEnvio.nombreTransporte);
              }
            }, 500);
          }
        })
        .catch(($error) => {
          this.data.log('public/cliente/envio/getAll error cuenta:', this.transporte_lista, this.initialLista);
          this.data.log('oninit error cuenta:', $error);
        });
        if ($user && $user['c'] === '1') {
          this.iva_usuario = 'LOS PRECIOS SON UNITARIOS Y ESTÁN SUJETOS A SU CONDICIÓN HABITUAL';
        } else {
          if ($user) {
            switch ($user['codCategoriaIva']) {
              case 'CF': this.iva_usuario = 'LOS PRECIOS UNITARIOS DETALLADOS INCLUYEN IVA'; break;
              case 'INR': this.iva_usuario = 'LOS PRECIOS UNITARIOS DETALLADOS INCLUYEN IVA'; break;
              case 'RS': this.iva_usuario = 'LOS PRECIOS UNITARIOS DETALLADOS INCLUYEN IVA'; break;
              case 'RSS': this.iva_usuario = 'LOS PRECIOS UNITARIOS DETALLADOS INCLUYEN IVA'; break;
              case 'RI': this.iva_usuario = 'LOS PRECIOS UNITARIOS DETALLADOS NO INCLUYEN IVA'; break;
              case 'EX': this.iva_usuario = 'LOS PRECIOS UNITARIOS DETALLADOS INCLUYEN IVA'; break;
              case 'PCE': this.iva_usuario = 'LOS PRECIOS UNITARIOS DETALLADOS INCLUYEN IVA'; break;
              case 'PCS': this.iva_usuario = 'LOS PRECIOS UNITARIOS DETALLADOS INCLUYEN IVA'; break;
              case 'EXE': this.iva_usuario = 'LOS PRECIOS UNITARIOS DETALLADOS SON FINALES'; break;
              case 'SNC': this.iva_usuario = 'LOS PRECIOS UNITARIOS DETALLADOS INCLUYEN IVA'; break;
              default: this.iva_usuario = 'LOS PRECIOS UNITARIOS DETALLADOS NO INCLUYEN IVA';
            }
          }
        }
      }
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.sub.unsubscribe();
  }

  alertClicked() {
    this.successMessage = null;
    this.data.toggleCarritoShow();
  }

  cambioTab(i) {
    this.transaccion.cambio(i);
    if (i === 1) {
      setTimeout(() => {
        if (this.DatosUsuario.codCategoriaIva) {
          this.seleccionariva(this.ngSelectResponsable, this.DatosUsuario.codCategoriaIva);
        }
        if (this.DatosUsuario.domicilio.provincia) {
          this.seleccionarprovincia(this.ngSelectProvincia, this.DatosUsuario.domicilio.provincia);
        }
        if (this.DatosUsuario.datosEnvio.domicilioEntrega.provincia) {
          this.seleccionarprovincia2(this.ngSelectProvincia2, this.DatosUsuario.datosEnvio.domicilioEntrega.provincia);
        }
        if (this.DatosUsuario.datosEnvio.nombreTransporte) {
          this.seleccionartransporte(this.ngSelectTransporte, this.DatosUsuario.datosEnvio.nombreTransporte);
        }
      }, 500);
    }
  }
  public seleccionariva($herramienta, $codigo) {
    if ($herramienta) {
      const item = $herramienta.itemsList._items.find(($item) => $item.value === $codigo);
      if (item) {
        $herramienta.select(item);
      }
    }
  }
  public seleccionarprovincia($herramienta, $codigo) {
    if ($herramienta) {
      const item = $herramienta.itemsList._items.find(($item) => $item.value === $codigo);
      if (item) {
        $herramienta.select(item);
      }
    }
  }
  public seleccionarprovincia2($herramienta, $codigo) {
    if ($herramienta) {
      const item = $herramienta.itemsList._items.find(($item) => $item.value === $codigo);
      if (item) {
        $herramienta.select(item);
      }
    }
  }
  public seleccionartransporte($herramienta, $codigo) {
    if ($herramienta) {
      const item = $herramienta.itemsList._items.find(($item) => $item.label.trim() === $codigo);
      if (item) {
        $herramienta.select(item);
      }
    }
  }
  closeFull(event) {
    if (event.target.className === 'modal__container') {
      this.transaccion.cambio(0);
    }
  }
  closeSession() {
    this.auth.desacreditar();
    window.location.reload();
  }
  newMessage(msg) {
    if (this.loginStatus === true) {
      if (msg.cantidad) {
        if ((+msg.cantidad % +msg.cantPack === 0 &&  +msg.cantidad > +msg.cantMinima) || (+msg.cantMinima === +msg.cantidad)) {
          const body = new URLSearchParams();
          body.set('id_producto', msg.id);
          body.set('cantidad', msg.cantidad);
          this.auth.post('carrito/agregar_item', body)
          .then(($response) => {
            this.data.log('response carritoagregaritem cuenta', $response);
            const response = this.data.addMessage(msg);
            if (response.value) {
              this._success.next(response.text);
            }
          })
          .catch(($error) => {
            this.data.log('error carritoagregaritem cuenta', $error);
            this._success.next(`Ya se encuentra en el Carrito!`);
            msg.comprado = true;
          });
        } else {
          msg['incompleto'] = true;
        }
      }
    }else {
      this.data.toggleLoginModal();
    }
  }
  removeMessage(msg) {
    if (this.loginStatus === true) {
      const body = new URLSearchParams();
      body.set('id_producto', msg.id);
      this.auth.post('carrito/eliminar_item', body)
      .then(($response) => {
        this.data.log('response carritoeliminaritem compra', $response);
        this.data.removeMessage(msg);
        msg.comprado = false;
      })
      .catch(($error) => {
        this.data.log('error carritoeliminaritem compra', $error);
      });
    }else {
      this.data.toggleLoginModal();
    }
  }

  descargarLista() {
    for (const key in document.querySelectorAll('#loaderFile')) {
      if (Object.prototype.hasOwnProperty.call(document.querySelectorAll('#loaderFile'), key)) {
        const element = document.querySelectorAll('#loaderFile')[key];
        (element as HTMLElement).style.display = 'block';
      }
    }
    this.auth.get('producto/listaPrecios')
    .then(async ($response)  => {
      if ($response.response) {
        this.listadoProductos = $response.response;
        let listadoProductosOrdenados: any[] = [];
        this.listadoProductos.forEach((producto) => {
          if (Array.isArray(listadoProductosOrdenados[producto.familia])) {
            if (Array.isArray(listadoProductosOrdenados[producto.familia][producto.categoria])) {
              if (Array.isArray(listadoProductosOrdenados[producto.familia][producto.categoria][producto.subcategoria])) {
                listadoProductosOrdenados[producto.familia][producto.categoria][producto.subcategoria].push(producto);
              } else {
                listadoProductosOrdenados[producto.familia][producto.categoria][producto.subcategoria] = new Array();
                listadoProductosOrdenados[producto.familia][producto.categoria][producto.subcategoria].push(producto);
              }
            } else {
              listadoProductosOrdenados[producto.familia][producto.categoria] = new Array();
              listadoProductosOrdenados[producto.familia][producto.categoria][producto.subcategoria] = new Array();
              listadoProductosOrdenados[producto.familia][producto.categoria][producto.subcategoria].push(producto);
            }
          } else {
            listadoProductosOrdenados[producto.familia] = new Array();
            listadoProductosOrdenados[producto.familia][producto.categoria] = new Array();
            listadoProductosOrdenados[producto.familia][producto.categoria][producto.subcategoria] = new Array();
            listadoProductosOrdenados[producto.familia][producto.categoria][producto.subcategoria].push(producto);
          }
        });
        
        const print: any[] = [];
        if (this.listadoProductos[0].precio) {
          print.push(
            [
              'Código',
              'Descripción',
              'Código de barras',
              'Unidad de medida',
              'Precio',
            ]
          );
        } else {
          print.push(
            [
              'Código',
              'Descripción',
              'Código de barras',
              'Unidad de medida',
              'Precio 1',
              'Precio 2',
            ]
          );
        }
        print.push([]);
        
        let i = 3;
        let merges: any[] = [];

        for (const key in listadoProductosOrdenados) {
          if (Object.prototype.hasOwnProperty.call(listadoProductosOrdenados, key)) {
            merges.push({ row: i, cant: 3 });
            i = i + 3;
            print.push([key]);
            print.push([]);
            print.push([]);
            const familia = listadoProductosOrdenados[key];
            for (const key in familia) {
              if (Object.prototype.hasOwnProperty.call(familia, key)) {
                merges.push({ row: i, cant: 2 });
                i = i + 2;
                print.push([key]);
                print.push([]);
                const categoria = familia[key];
                for (const key in categoria) {
                  if (Object.prototype.hasOwnProperty.call(categoria, key)) {
                    merges.push({ row: i, cant: 1 });
                    i = i + 1;
                    print.push([key]);
                    const subcategoria = categoria[key];
                    for (const key in subcategoria) {
                      if (Object.prototype.hasOwnProperty.call(subcategoria, key)) {
                        i = i + 1;
                        const producto = subcategoria[key];
                        if (producto.precio) {
                          print.push(
                            [
                              producto.codigo_interno,
                              producto.nombre + ' - ' + producto.nombre_adicional,
                              producto.codigo_barras,
                              producto.unidad_medida,
                              producto.precio,
                            ],
                          );
                        } else {
                          print.push(
                            [
                              producto.codigo_interno,
                              producto.nombre + ' - ' + producto.nombre_adicional,
                              producto.codigo_barras,
                              producto.unidad_medida,
                              producto.precio_1,
                              producto.precio_2,
                            ],
                          );
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }

        const hoy = new Date();
        const hoyString = ('0' + hoy.getDate()).slice(-2) + '-' + ('0' + (hoy.getMonth() + 1)).slice(-2) + '-' + hoy.getFullYear();

        const Excel = require('exceljs');
        const FileSaver = require('file-saver');

        // Workbook and properties
        
        const wb = new Excel.Workbook();
        wb.creator = 'SINA';
        wb.lastModifiedBy = 'SINA';
        wb.created = hoy;
        wb.modified = hoy;
        wb.lastPrinted = hoy;
        wb.properties.date1904 = true;
        wb.views = [
          {
            x: 0, y: 0, width: 10000, height: 20000,
            firstSheet: 0, activeTab: 1, visibility: 'visible'
          }
        ]

        // Worksheet and properties

        const ws = wb.addWorksheet('Sina.com.ar_Lista-de-precios',
          {
            properties: { tabColor: { argb:'FF057AFF' } },
            pageSetup: { paperSize: 9, orientation: 'portrait', fitToPage: true, fitToWidth: 1, fitToHeight: 0, printTitlesRow: '1:2' },
            headerFooter: { oddHeader: 'Lista de precios sina.com.ar al ' + hoyString + ' - ' + this.iva_usuario, oddFooter: "&LPágina &P de &N" }
          }
        );
        ws.state = 'visible';
        ws.properties.defaultRowHeight = 20;
        ws.autoFilter = 'A:B';

        // Adding Rows

        ws.addRows(print);

        // Styles

        // Columna precio alineada a la derecha

        ws.getColumn('E').alignment = { vertical: 'middle', horizontal: 'right' };
        if (this.listadoProductos[0].precio_2) {
          ws.getColumn('F').alignment = { vertical: 'middle', horizontal: 'right' };
        }

        // Anchos de columna

        ws.getColumn('A').width = 12;
        ws.getColumn('B').width = 47;
        ws.getColumn('C').width = 15;
        ws.getColumn('D').width = 15;
        ws.getColumn('E').width = 10;
        if (this.listadoProductos[0].precio_2) {
          ws.getColumn('F').width = 10;
        }

        // Borde izquierdo primer columna
        // Borde derecho a cada columna

        ws.getColumn('A').border = { left: { style: 'thin' }, right: { style: 'thin' } };
        ws.getColumn('B').border = { right: { style: 'thin' } };
        ws.getColumn('C').border = { right: { style: 'thin' } };
        ws.getColumn('D').border = { right: { style: 'thin' } };
        ws.getColumn('E').border = { right: { style: 'thin' } };
        if (this.listadoProductos[0].precio_2) {
          ws.getColumn('E').border = { right: { style: 'mediumDashed' } };
          ws.getColumn('F').border = { right: { style: 'thin'} };
        }

        // Borde inferior a la ultima fila
        ws.getCell('A' + ws.rowCount).border = { left: { style: 'thin' }, right: { style: 'thin' }, bottom: { style: 'thin' } };
        ws.getCell('B' + ws.rowCount).border = { right: { style: 'thin' }, bottom: { style: 'thin' } };
        ws.getCell('C' + ws.rowCount).border = { right: { style: 'thin' }, bottom: { style: 'thin' } };
        ws.getCell('D' + ws.rowCount).border = { right: { style: 'thin' }, bottom: { style: 'thin' } };
        ws.getCell('E' + ws.rowCount).border = { right: { style: 'thin' }, bottom: { style: 'thin' } };
        if (this.listadoProductos[0].precio_2) {
          ws.getCell('E' + ws.rowCount).border = { right: { style: 'mediumDashed', bottom: { style: 'thin' } } };
          ws.getCell('F' + ws.rowCount).border = { right: { style: 'thin'}, bottom: { style: 'thin' } };
        }

        // Cabeceras centradas

        const alignMiddleCenter = { vertical: 'middle', horizontal: 'center', wrapText: true };
        ws.getCell('A1').alignment = alignMiddleCenter;
        ws.getCell('B1').alignment = alignMiddleCenter;
        ws.getCell('C1').alignment = alignMiddleCenter;
        ws.getCell('D1').alignment = alignMiddleCenter;
        ws.getCell('E1').alignment = alignMiddleCenter;
        if (this.listadoProductos[0].precio_2) {
          ws.getCell('F1').alignment = alignMiddleCenter;
        }

        // Cabeceras Arial 12 y negrita

        const fontArial12Bold = { name: 'Arial', size: 12, bold: true };
        ws.getCell('A1').font = fontArial12Bold;
        ws.getCell('B1').font = fontArial12Bold;
        ws.getCell('C1').font = fontArial12Bold;
        ws.getCell('D1').font = fontArial12Bold;
        ws.getCell('E1').font = fontArial12Bold;
        if (this.listadoProductos[0].precio_2) {
          ws.getCell('F1').font = fontArial12Bold;
        }

        // Cabeceras color de fondo gris

        const fillSolidGris = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEAEAEA' } };
        ws.getCell('A1').fill = fillSolidGris;
        ws.getCell('B1').fill = fillSolidGris;
        ws.getCell('C1').fill = fillSolidGris;
        ws.getCell('D1').fill = fillSolidGris;
        ws.getCell('E1').fill = fillSolidGris;
        if (this.listadoProductos[0].precio_2) {
          ws.getCell('F1').fill = fillSolidGris;
        }

        // Cabeceras con borde

        const bordeSimple = {
          top: {style:'thin'},
          left: {style:'thin'},
          bottom: {style:'thin'},
          right: {style:'thin'}
        };
        ws.getCell('A1').border = bordeSimple;
        ws.getCell('B1').border = bordeSimple;
        ws.getCell('C1').border = bordeSimple;
        ws.getCell('D1').border = bordeSimple;
        ws.getCell('E1').border = bordeSimple;
        if (this.listadoProductos[0].precio_2) {
          ws.getCell('F1').border = bordeSimple;
        }

        // Mergeo cada cabecera con su row de abajo

        ws.mergeCells('A1', 'A2');
        ws.mergeCells('B1', 'B2');
        ws.mergeCells('C1', 'C2');
        ws.mergeCells('D1', 'D2');
        ws.mergeCells('E1', 'E2');
        if (this.listadoProductos[0].precio_2) {
          ws.mergeCells('F1', 'F2');
        }

        // Merge de las rows que obtuve antes
        const fillSolidAzul = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF00B0F0' } };

        merges.forEach(m => {
          let idCeldaInicio = 'A' + m.row;
          let idCeldaFin = 'E' + (m.row + (m.cant - 1));
          if (this.listadoProductos[0].precio_2) {
            idCeldaFin = 'F' + (m.row + (m.cant - 1));
          }
          ws.getCell(idCeldaInicio).font = fontArial12Bold;
          ws.getCell(idCeldaInicio).border = bordeSimple;
          ws.getCell(idCeldaInicio).alignment = alignMiddleCenter;
          if (m.cant === 3) {
            ws.getCell(idCeldaInicio).fill = fillSolidAzul;
          }
          ws.mergeCells(idCeldaInicio, idCeldaFin);
        });

        // Descarga del archivo

        await wb.xlsx.writeBuffer().then(data => {
          const blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' }); 
          FileSaver.saveAs(blob, 'Lista de precios SINA al ' + hoyString + '.xlsx');
        });
      }

      for (const key in document.querySelectorAll('#loaderFile')) {
        if (Object.prototype.hasOwnProperty.call(document.querySelectorAll('#loaderFile'), key)) {
          const element = document.querySelectorAll('#loaderFile')[key];
          (element as HTMLElement).style.display = 'none';
        }
      }
      for (const key in document.querySelectorAll('#loaderFileMsg')) {
        if (Object.prototype.hasOwnProperty.call(document.querySelectorAll('#loaderFileMsg'), key)) {
          const element = document.querySelectorAll('#loaderFileMsg')[key];
          (element as HTMLElement).style.display = 'none';
        }
      }
    })
    .catch(($error) => {
      this.data.log('descargarlista error cuenta:', $error);
    });
  }

  descargarListaFrecuentes() {
    for (const key in document.querySelectorAll('#loaderFile')) {
      if (Object.prototype.hasOwnProperty.call(document.querySelectorAll('#loaderFile'), key)) {
        const element = document.querySelectorAll('#loaderFile')[key];
        (element as HTMLElement).style.display = 'block';
      }
    }
    this.auth.get('producto/listaFrecuentes')
    .then(async ($response)  => {
      if ($response.response) {
        this.listadoFrecuentes = $response.response;

        const arrowUp = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAADLSURBVDhPlY67DcJAEETXRZBQhwMSAoQxNVALETkd0ABdAOKTUwW0AATm2Z6VDD4fZqRn+XZmb85iKsxmMNbxf7F8hp2O/0nthZho3F8sle1+wUHjfmKh2e5MZf8W4Wa7c5QdF8FQu5Mp1i1CoXbnrFhYBGLtTq54W5ixdif8Cow+7U77FQxPX6EYF63VYtDVvoeui+da5/QZesAGUtmln2r2BM/Vr+An0+AOSxhWRkB4A1jBDcqdPOGzxrvCNjF7VckfYoeoLcxs9AZpdd/dZrRAVwAAAABJRU5ErkJggg==';
        const arrowDown = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAC8SURBVDhPnY7LDcIwEEQnHSBRBCVwyAEQdMYdDjRAB/xuNIFEBzQAJSxjvGvhYDsObzSJnN14poFgA+COBnu+6xCM+JzSrTu0tNOT3tLjz1IK96NgTT9op7kNbvrBtKMnfkjcor/8RZsuOiWCWfgc60p3LzdpupFfTOkr3RAswrhfnXSjrsVZtxMIlmEtr0y6UW5x0q0CglVY/1VPupFucdRpBekWlelG3GJAuhG3GJhu+BYHPf2BSy6mA28evt5OXyFPfgAAAABJRU5ErkJggg==';

        const print: any[] = [];
        if (this.listadoFrecuentes[0].precio) {
          print.push(
            [
              'Código',
              'Descripción',
              'Código de barras',
              'Unidad de medida',
              'Precio',
              'CPUC',
            ]
          );
        } else {
          print.push(
            [
              'Código',
              'Descripción',
              'Código de barras',
              'Unidad de medida',
              'Precio 1',
              'Precio 2',
              'CPUC',
            ]
          );
        }
        print.push([]);

        let i = 2.25;
        let images: any[] = [];

        this.listadoFrecuentes.forEach(producto => {
          if (producto.precio) {
            print.push(
              [
                producto.codigo_interno,
                producto.nombre + ' - ' + producto.nombre_adicional,
                producto.codigo_barras,
                producto.unidad_medida,
                producto.precio,
                producto.cpuc === '-' ? '-' : '',
              ],
            );
            if (producto.cpuc === 'UP') {
              images.push({ col: 5.25, row: i, arrow: 'UP'});
            } else if (producto.cpuc === 'DOWN') {
              images.push({ col: 5.25, row: i, arrow: 'DOWN'});
            }
          } else {
            print.push(
              [
                producto.codigo_interno,
                producto.nombre + ' - ' + producto.nombre_adicional,
                producto.codigo_barras,
                producto.unidad_medida,
                producto.precio_1,
                producto.precio_2,
                producto.cpuc === '-' ? '-' : '',
              ],
            );
            if (producto.cpuc === 'UP') {
              images.push({ col: 6.25, row: i, arrow: 'UP'});
            } else if (producto.cpuc === 'DOWN') {
              images.push({ col: 6.25, row: i, arrow: 'DOWN'});
            }
          }
          i++;
        });

        print.push(['* CPUC: Comparación de precios de últimas compras. ( 90 días )']);

        const hoy = new Date();
        const hoyString = ('0' + hoy.getDate()).slice(-2) + '-' + ('0' + (hoy.getMonth() + 1)).slice(-2) + '-' + hoy.getFullYear();

        const Excel = require('exceljs');
        const FileSaver = require('file-saver');

        // Workbook and properties
          
        const wb = new Excel.Workbook();
        wb.creator = 'SINA';
        wb.lastModifiedBy = 'SINA';
        wb.created = hoy;
        wb.modified = hoy;
        wb.lastPrinted = hoy;
        wb.properties.date1904 = true;
        wb.views = [
          {
            x: 0, y: 0, width: 10000, height: 20000,
            firstSheet: 0, activeTab: 1, visibility: 'visible'
          }
        ]

        // Worksheet and properties

        const ws = wb.addWorksheet('Sina.com.ar_Lista-frecuentes',
          {
            properties: { tabColor: { argb:'FF057AFF' } },
            pageSetup: { paperSize: 9, orientation: 'portrait', fitToPage: true, fitToWidth: 1, fitToHeight: 0, printTitlesRow: '1:2' },
            headerFooter: { oddHeader: 'Lista de frecuentes sina.com.ar al ' + hoyString + ' - ' + this.iva_usuario, oddFooter: "&LPágina &P de &N" }
          }
        );
        ws.state = 'visible';
        ws.properties.defaultRowHeight = 20;
        ws.autoFilter = 'A:B';

        // Adding Rows

        ws.addRows(print);

        // Styles

        // Columnas precio alineada a la derecha y CPUC al centro

        ws.getColumn('E').alignment = { vertical: 'middle', horizontal: 'right' };
        if (this.listadoFrecuentes[0].precio_2) {
          ws.getColumn('F').alignment = { vertical: 'middle', horizontal: 'right' };
          ws.getColumn('G').alignment = { vertical: 'middle', horizontal: 'center' };
        } else {
          ws.getColumn('F').alignment = { vertical: 'middle', horizontal: 'center' };
        }

        // Anchos de columna

        ws.getColumn('A').width = 12;
        ws.getColumn('B').width = 47;
        ws.getColumn('C').width = 15;
        ws.getColumn('D').width = 15;
        ws.getColumn('E').width = 10;
        ws.getColumn('F').width = 7;
        if (this.listadoFrecuentes[0].precio_2) {
          ws.getColumn('F').width = 10;
          ws.getColumn('G').width = 7;
        }

        // Border izquierdo primer columna
        // Borde derecho a cada columna

        ws.getColumn('A').border = { left: { style: 'thin' }, right: { style: 'thin' } };
        ws.getColumn('B').border = { right: { style: 'thin' } };
        ws.getColumn('C').border = { right: { style: 'thin' } };
        ws.getColumn('D').border = { right: { style: 'thin' } };
        ws.getColumn('E').border = { right: { style: 'thin' } };
        ws.getColumn('F').border = { right: { style: 'thin' } };
        if (this.listadoFrecuentes[0].precio_2) {
          ws.getColumn('E').border = { right: { style: 'mediumDashed' } };
          ws.getColumn('G').border = { right: { style: 'thin' } };
        }

        // Borde inferior y merge a la ultima fila
        ws.getCell('A' + ws.rowCount).border = { left: { style: 'thin' }, right: { style: 'thin' }, top: { style: 'thin' }, bottom: { style: 'thin' } };
        if (this.listadoFrecuentes[0].precio_2) {
          ws.mergeCells('A' + ws.rowCount, 'G' + ws.rowCount);
        } else {
          ws.mergeCells('A' + ws.rowCount, 'F' + ws.rowCount);
        }

        // Cabeceras centradas

        const alignMiddleCenter = { vertical: 'middle', horizontal: 'center', wrapText: true };
        ws.getCell('A1').alignment = alignMiddleCenter;
        ws.getCell('B1').alignment = alignMiddleCenter;
        ws.getCell('C1').alignment = alignMiddleCenter;
        ws.getCell('D1').alignment = alignMiddleCenter;
        ws.getCell('E1').alignment = alignMiddleCenter;
        ws.getCell('F1').alignment = alignMiddleCenter;
        if (this.listadoFrecuentes[0].precio_2) {
          ws.getCell('G1').alignment = alignMiddleCenter;
        }

        // Cabeceras Arial 12 y negrita

        const fontArial12Bold = { name: 'Arial', size: 12, bold: true };
        ws.getCell('A1').font = fontArial12Bold;
        ws.getCell('B1').font = fontArial12Bold;
        ws.getCell('C1').font = fontArial12Bold;
        ws.getCell('D1').font = fontArial12Bold;
        ws.getCell('E1').font = fontArial12Bold;
        ws.getCell('F1').font = fontArial12Bold;
        if (this.listadoFrecuentes[0].precio_2) {
          ws.getCell('G1').font = fontArial12Bold;
        }

        // Cabeceras color de fondo gris

        const fillSolidGris = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEAEAEA' } };
        ws.getCell('A1').fill = fillSolidGris;
        ws.getCell('B1').fill = fillSolidGris;
        ws.getCell('C1').fill = fillSolidGris;
        ws.getCell('D1').fill = fillSolidGris;
        ws.getCell('E1').fill = fillSolidGris;
        ws.getCell('F1').fill = fillSolidGris;
        if (this.listadoFrecuentes[0].precio_2) {
          ws.getCell('G1').fill = fillSolidGris;
        }

        // Cabeceras con borde

        const bordeSimple = {
          top: {style:'thin'},
          left: {style:'thin'},
          bottom: {style:'thin'},
          right: {style:'thin'}
        };
        ws.getCell('A1').border = bordeSimple;
        ws.getCell('B1').border = bordeSimple;
        ws.getCell('C1').border = bordeSimple;
        ws.getCell('D1').border = bordeSimple;
        ws.getCell('E1').border = bordeSimple;
        ws.getCell('F1').border = bordeSimple;
        if (this.listadoFrecuentes[0].precio_2) {
          ws.getCell('G1').border = bordeSimple;
        }

        // Mergeo cada cabecera con su row de abajo

        ws.mergeCells('A1', 'A2');
        ws.mergeCells('B1', 'B2');
        ws.mergeCells('C1', 'C2');
        ws.mergeCells('D1', 'D2');
        ws.mergeCells('E1', 'E2');
        ws.mergeCells('F1', 'F2');
        if (this.listadoFrecuentes[0].precio_2) {
          ws.mergeCells('G1', 'G2');
        }

        for (let i = 0; i < images.length; i++) {
          // Add image to workbook by base64
          const arrowUpID = wb.addImage({
            base64: arrowUp,
            extension: 'png',
          });
          const arrowDownID = wb.addImage({
            base64: arrowDown,
            extension: 'png',
          });
          
          const m = images[i];

          if (m.arrow === 'UP') {
            ws.addImage(arrowUpID, {
              tl: { col: m.col, row: m.row },
              ext: { width: 16, height: 16 }
            });
          } else if (m.arrow === 'DOWN') {
            ws.addImage(arrowDownID, {
              tl: { col: m.col, row: m.row },
              ext: { width: 16, height: 16 }
            });
          }
        }

        // Descarga del archivo

        await wb.xlsx.writeBuffer().then(data => {
          const blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' }); 
          FileSaver.saveAs(blob, 'Lista de frecuentes SINA al ' + hoyString + '.xlsx');
        });
      }

      for (const key in document.querySelectorAll('#loaderFile')) {
        if (Object.prototype.hasOwnProperty.call(document.querySelectorAll('#loaderFile'), key)) {
          const element = document.querySelectorAll('#loaderFile')[key];
          (element as HTMLElement).style.display = 'none';
        }
      }
    })
    .catch(($error) => {
      this.data.log('productosmaspedidos frecuentes error cuenta:', $error);
    });
  }

  guardarDatos() {
    this.procesando_info = true;
    this.procesando_info_entrega = true;

    const body = new URLSearchParams();
    body.set('nombre_fantasia', this.DatosUsuario.nombreFantasia);
    body.set('telefono', this.DatosUsuario.telefono);
    body.set('telefono_celular', this.DatosUsuario.telefonoCelular);
    body.set('cod_categoria_iva', this.DatosUsuario.codCategoriaIva);
    body.set('domicilio_direccion', this.DatosUsuario.domicilio.direccion);
    body.set('domicilio_ciudad', this.DatosUsuario.domicilio.ciudad);
    body.set('domicilio_provincia', this.DatosUsuario.domicilio.provincia);
    body.set('domicilio_codigo_postal', this.DatosUsuario.domicilio.codPostal);
    body.set('facturacion_nombre_responsable', this.DatosUsuario.nombreResponsableFacturacion);
    body.set('facturacion_email', this.DatosUsuario.emailFacturacion);
    body.set('facturacion_telefono', this.DatosUsuario.telefonoFacturacion);
    body.set('descripcion', this.DatosUsuario.descripcion);
    body.set('envio_domicilio_direccion', this.DatosUsuario.datosEnvio.domicilioEntrega.direccion);
    body.set('envio_domicilio_ciudad', this.DatosUsuario.datosEnvio.domicilioEntrega.ciudad);
    body.set('envio_domicilio_provincia', this.DatosUsuario.datosEnvio.domicilioEntrega.provincia);
    body.set('envio_domicilio_codigo_postal', this.DatosUsuario.datosEnvio.domicilioEntrega.codPostal);
    body.set('envio_telefono', this.DatosUsuario.datosEnvio.telefono);
    body.set('envio_cod_transporte', this.DatosUsuario.datosEnvio.codigoTransporte);
    body.set('envio_horario_entrega', this.DatosUsuario.datosEnvio.horarioEntrega);
    body.set('envio_entrega_lunes', this.DatosUsuario.datosEnvio.entregaLunes);
    body.set('envio_entrega_martes', this.DatosUsuario.datosEnvio.entregaMartes);
    body.set('envio_entrega_miercoles', this.DatosUsuario.datosEnvio.entregaMiercoles);
    body.set('envio_entrega_jueves', this.DatosUsuario.datosEnvio.entregaJueves);
    body.set('envio_entrega_viernes', this.DatosUsuario.datosEnvio.entregaViernes);
    body.set('envio_entrega_sabado', this.DatosUsuario.datosEnvio.entregaSabado);

    this.data.log('guardardatos body cuenta:', body);

    this.procesando_info_ok = '';
    this.procesando_info_entrega_ok = '';

    this.auth.post('cliente/actualizar', body)
    .then(($response) => {
      this.data.log('updatecliente response cuenta:', $response);

      this.procesando_info = false;
      this.procesando_info_error = '';
      this.procesando_info_ok = $response.body.response_datos;

      this.procesando_info_entrega = false;
      this.procesando_info_entrega_error = '';
      this.procesando_info_entrega_ok = $response.body.response_envio;
    })
    .catch(($error) => {
      this.data.log('updatecliente error cuenta:', $error);

      this.procesando_info = false;
      this.procesando_info_error = '';

      this.procesando_info_entrega = false;
      this.procesando_info_entrega_error = '';

      try {
        Object.values($error.error.response_datos).forEach((element) => {
          this.procesando_info_error += element + ' ';
        });
      } catch ($throw) {
        this.data.log('updatecliente error cuenta:', $throw);
      }
    });
  }
  
  public revisarCantidad(e) {
    if (e.target && parseInt(e.target.value) < parseInt(e.target.min)) {
      e.target.value = e.target.min;
    }
  }
}
