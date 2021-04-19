import { Location } from '@angular/common';
import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, Pipe, PipeTransform, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { NgSelectComponent } from '@ng-select/ng-select';
import 'rxjs/add/observable/defer';
import 'rxjs/add/observable/fromEvent';
import { takeUntil } from 'rxjs/operators';
import { Observable } from 'rxjs/Rx';
import { Subject } from 'rxjs/Subject';
import { Subscription } from 'rxjs/Subscription';
import { AutenticacionService } from '../autenticacion.service';
import { clienteActualizar, clientEnvioActualizarDatos, DatosTransaccion } from '../data';
import { GoogleAnalyticsService } from '../google-analytics.service';
import { cliente, SharedService } from '../shared.service';

@Component({
  selector: 'app-compra',
  templateUrl: './compra.component.html',
  styleUrls: ['./compra.component.css'],
  providers: [GoogleAnalyticsService],
})
export class CompraComponent implements OnInit, AfterViewInit, OnDestroy {
  private destroy$: Subject<void> = new Subject<void>();
  @ViewChild('transporte') ngSelectTransporte: NgSelectComponent;
  @ViewChild('provincia') ngSelectProvincia: NgSelectComponent;
  @ViewChild('inputCantidad') inputCantidad: ElementRef;
  @ViewChild('mensaje_error_retiro') mensajeErrorRetiro: ElementRef;
  inputSub: Subscription;
  public modalLoading: boolean = false;
  public showAgregado: boolean = false;
  idPedidoAgregado: number;
  public showErrorAgregado: boolean = false;
  public responseErrorAgregado: string = '';
  public responseSuccessAgregado;
  iva_usuario: string = '';
  user: cliente;
  transaccion: DatosTransaccion;
  facturacion: any = {
    datos: new clienteActualizar(),
    cargar($cliente) {
      this.datos.codigoCliente = $cliente.codigo;
      this.datos.email = $cliente.email;
      this.datos.cuit = $cliente.cuit;
      this.datos.categoria_iva = $cliente.categoriaIva;
      this.datos.cod_categoria_iva = $cliente.codCategoriaIva;
      this.datos.razon_social          =    $cliente.razonSocial;
      this.datos.nombre_fantasia       = $cliente.nombreFantasia;
      this.datos.telefono  =    $cliente.telefono;
      this.datos.telefono_celular  =    $cliente.telefonoCelular;
      this.datos.nombre_responsable_compras = $cliente.nombreResponsableCompras;
      this.datos.facturacion_nombre_responsable = $cliente.nombreResponsableFacturacion;
      this.datos.facturacion_email = $cliente.emailFacturacion;
      this.datos.facturacion_telefono  =    $cliente.telefonoFacturacion;
      this.datos.domicilio_direccion = $cliente.domicilio.direccion;
      this.datos.domicilio_ciudad = $cliente.domicilio.ciudad;
      this.datos.domicilio_provincia = $cliente.domicilio.provincia;
      this.datos.domicilio_codigo_postal = $cliente.domicilio.codPostal;
    },
    update: () => {
      this.editingFacturacion = !this.editingFacturacion;
      return new Promise((resolve, reject) => {
        const body = new URLSearchParams();
        for (const dato in this.facturacion.datos) {
          if (dato) {
            if (dato.includes('razon_social') 
            || dato.includes('nombre_fantasia') 
            || dato.includes('nombre_responsable_compras') 
            || dato.includes('facturacion_nombre_responsable') 
            || dato.includes('domicilio_direccion') 
            || dato.includes('domicilio_ciudad') 
            || dato.includes('domicilio_provincia')) {
              body.set(dato, this.facturacion.datos[dato].toUpperCase ? this.facturacion.datos[dato].toUpperCase() : this.facturacion.datos[dato]);
            } else {
              body.set(dato, this.facturacion.datos[dato]);
            }
          }
        }
        this.auth.post('cliente/actualizar', body)
        .then(($response) => {
          resolve($response.body.response);
        })
        .catch(($error) => {
          this.data.log('updatecliente error compra:', $error);
          reject($error);
        });
      });
    },
  };
  entrega: any = {
    transporte: {
      lista: [],
      array: [],
    },
    provincia: {
      lista: [],
      array: [],
    }
  };

  datos_envio: clientEnvioActualizarDatos = new clientEnvioActualizarDatos();

  carrito = {
    hora: '16 Sep 14:05',
    subtotal: 0,
    lista: [
    ],
  };
  datostransporte = {
    data: {
      calle: '',
      localidad: '',
      provincia: '',
      telefono: '',
      codigoTransporte: '',
      horarioEntrega: '',
      nombreTransporte: '',
    },
    form: {
      nombreTransporte: '',
      domicilioTransporte: '',
      telefonoTransporte: '',
    },
    cargar: ($calle, $localidad, $provincia, $telefono, $codigo)  => {
      this.datostransporte.data.calle     = $calle;
      this.datostransporte.data.localidad = $localidad;
      this.datostransporte.data.provincia = $provincia;
      this.datostransporte.data.telefono  = $telefono;
      this.datostransporte.data.codigoTransporte = $codigo;
      this.datosEnvio_flag = true;
    },
    update: () => {
      this.datosEnvio_flag = true;
      return new Promise((resolve, reject) => {
        const body = new URLSearchParams();
        const datos = this.datos_envio.enviar();
        Object.keys(datos).forEach((key) => {
          if (key.includes('domicilio_direccion') 
          || key.includes('domicilio_ciudad') 
          || key.includes('domicilio_provincia')) {
            body.set(key, datos[key].toUpperCase ? datos[key].toUpperCase() : datos[key]);
          } else {
            body.set(key, datos[key]);
          }
        });
        this.auth.post('cliente/envio/actualizar_datos', body)
        .then(($response) => {
          resolve($response.body.response);
        })
        .catch(($error) => {
          this.data.log('actualizardatosenvio error compra:', $error);
          reject($error);
        });
      });
    },
    add: () => {
      this.datosEnvio_flag = true;
      return new Promise((resolve, reject) => {
        const body = new URLSearchParams();
        Object.keys(this.datostransporte.form).forEach((key) => {
          body.set(key, this.datostransporte.form[key]);
        });
        this.auth.post('cliente/envio/nuevo_transporte', body)
        .then(($response) => {
          resolve($response.body.response);
        })
        .catch(($error) => {
          this.data.log('envionuevotransporte error compra:', $error);
          reject($error);
        });
      });
    },
  };
  retiro: boolean = false;
  flagHoraPasada: boolean = false;
  dia: string = '';
  hoy = new Date();
  hoyFormatted = this.hoy.getFullYear() + '-' + ('0' + (this.hoy.getMonth() + 1)).slice(-2) + '-' + ('0' + this.hoy.getDate()).slice(-2);
  hoyMediodia = new Date(this.hoy.getFullYear(), this.hoy.getMonth(), this.hoy.getDate(), 13, 0);
  retiroHora = this.hoyMediodia.getFullYear() + '-' + (this.hoyMediodia.getMonth() + 1) + '-' + this.hoyMediodia.getDate();
  retiroHora1 = new Date(this.hoyMediodia.getTime());
  inputFecha: string = this.hoyMediodia.getDate() + '/' + (this.hoyMediodia.getMonth() + 1) + '/' + this.hoyMediodia.getFullYear();
  inputHora: string = '13';
  inputMinuto: string = '00';
  fechaUpdate($event) {
    this.flagHoraPasada = false;
    this.retiroHora = $event;
    const diaElegido = this.retiroHora.split('-')[2];
    const mesElegido = this.retiroHora.split('-')[1];
    const anoElegido = this.retiroHora.split('-')[0];
    const dias = $event.split('-');
    this.dia = this.diaSemana(dias[2], dias[1], dias[0]);
    this.inputFecha = dias[2] + '/' + dias[1] + '/' + dias[0];

    if (parseInt(anoElegido) < this.hoy.getFullYear()) {
      this.retiro = false;
      this.flagHoraPasada = true;
    } else if (parseInt(anoElegido) === this.hoy.getFullYear()) {
      if (parseInt(mesElegido) < (this.hoy.getMonth() + 1)) {
        this.retiro = false;
        this.flagHoraPasada = true;
      } else if (parseInt(mesElegido) === (this.hoy.getMonth() + 1)) {
        if (parseInt(diaElegido) < this.hoy.getDate()) {
          this.retiro = false;
          this.flagHoraPasada = true;
        } else if (parseInt(diaElegido) === this.hoy.getDate() && this.retiroHora1.getHours() < this.hoy.getHours()) {
          this.retiro = false;
          this.flagHoraPasada = true;
        } else if (parseInt(diaElegido) === this.hoy.getDate() && this.retiroHora1.getHours() === this.hoy.getHours()) {
          if (this.retiroHora1.getMinutes() <= this.hoy.getMinutes() + 10) {
            this.retiro = false;
            this.flagHoraPasada = true;
          } else {
            switch (this.dia) {
              case 'Domingo':
                this.retiro = false;
                break;
              case 'Sábado':
                if (this.retiroHora1.getHours() >= 8 && this.retiroHora1.getHours() < 12) {
                  this.retiro = true;
                } else if (this.retiroHora1.getHours() === 12) {
                  this.retiro = this.retiroHora1.getMinutes() === 0 ? true : false;
                } else {
                  this.retiro = false;
                }
                break;
              default:
                if (this.retiroHora1.getHours() >= 8 && this.retiroHora1.getHours() < 17) {
                  this.retiro = true;
                  if (this.retiroHora1.getHours() >= 12 && this.retiroHora1.getHours() < 14) {
                    if (this.retiroHora1.getHours() === 12) {
                      this.retiro = this.retiroHora1.getMinutes() === 0 ? true : false;
                    } else {
                      this.retiro = false;
                    }
                  } else {
                    this.retiro = true;
                  }
                } else if (this.retiroHora1.getHours() === 17) {
                  this.retiro = this.retiroHora1.getMinutes() === 0 ? true : false;
                } else {
                  this.retiro = false;
                }
                break;
            }
          }
        } else {
          switch (this.dia) {
            case 'Domingo':
              this.retiro = false;
              break;
            case 'Sábado':
              if (this.retiroHora1.getHours() >= 8 && this.retiroHora1.getHours() < 12) {
                this.retiro = true;
              } else if (this.retiroHora1.getHours() === 12) {
                this.retiro = this.retiroHora1.getMinutes() === 0 ? true : false;
              } else {
                this.retiro = false;
              }
              break;
            default:
              if (this.retiroHora1.getHours() >= 8 && this.retiroHora1.getHours() < 17) {
                this.retiro = true;
                if (this.retiroHora1.getHours() >= 12 && this.retiroHora1.getHours() < 14) {
                  if (this.retiroHora1.getHours() === 12) {
                    this.retiro = this.retiroHora1.getMinutes() === 0 ? true : false;
                  } else {
                    this.retiro = false;
                  }
                } else {
                  this.retiro = true;
                }
              } else if (this.retiroHora1.getHours() === 17) {
                this.retiro = this.retiroHora1.getMinutes() === 0 ? true : false;
              } else {
                this.retiro = false;
              }
              break;
          }
        }
      } else {
        switch (this.dia) {
          case 'Domingo':
            this.retiro = false;
            break;
          case 'Sábado':
            if (this.retiroHora1.getHours() >= 8 && this.retiroHora1.getHours() < 12) {
              this.retiro = true;
            } else if (this.retiroHora1.getHours() === 12) {
              this.retiro = this.retiroHora1.getMinutes() === 0 ? true : false;
            } else {
              this.retiro = false;
            }
            break;
          default:
            if (this.retiroHora1.getHours() >= 8 && this.retiroHora1.getHours() < 17) {
              this.retiro = true;
              if (this.retiroHora1.getHours() >= 12 && this.retiroHora1.getHours() < 14) {
                if (this.retiroHora1.getHours() === 12) {
                  this.retiro = this.retiroHora1.getMinutes() === 0 ? true : false;
                } else {
                  this.retiro = false;
                }
              } else {
                this.retiro = true;
              }
            } else if (this.retiroHora1.getHours() === 17) {
              this.retiro = this.retiroHora1.getMinutes() === 0 ? true : false;
            } else {
              this.retiro = false;
            }
            break;
        }
      }
    } else {
      switch (this.dia) {
        case 'Domingo':
          this.retiro = false;
          break;
        case 'Sábado':
          if (this.retiroHora1.getHours() >= 8 && this.retiroHora1.getHours() < 12) {
            this.retiro = true;
          } else if (this.retiroHora1.getHours() === 12) {
            this.retiro = this.retiroHora1.getMinutes() === 0 ? true : false;
          } else {
            this.retiro = false;
          }
          break;
        default:
          if (this.retiroHora1.getHours() >= 8 && this.retiroHora1.getHours() < 17) {
            this.retiro = true;
            if (this.retiroHora1.getHours() >= 12 && this.retiroHora1.getHours() < 14) {
              if (this.retiroHora1.getHours() === 12) {
                this.retiro = this.retiroHora1.getMinutes() === 0 ? true : false;
              } else {
                this.retiro = false;
              }
            } else {
              this.retiro = true;
            }
          } else if (this.retiroHora1.getHours() === 17) {
            this.retiro = this.retiroHora1.getMinutes() === 0 ? true : false;
          } else {
            this.retiro = false;
          }
          break;
      }
    }
  }
  fechaUpdate1($event) {
    const diaElegido = this.retiroHora.split('-')[2];
    const mesElegido = this.retiroHora.split('-')[1];
    const anoElegido = this.retiroHora.split('-')[0];
    this.flagHoraPasada = false;
    const hora = $event;
    let horaInt = parseInt(hora);
    if (!isNaN(hora) && !isNaN(horaInt) && horaInt >= 0 && horaInt < 24) {
      this.inputHora = hora;
      this.retiroHora1.setHours(horaInt);
    } else {
      horaInt = parseInt(this.inputHora);
    }

    if (parseInt(anoElegido) < this.hoy.getFullYear()) {
      this.retiro = false;
      this.flagHoraPasada = true;
    } else if (parseInt(anoElegido) === this.hoy.getFullYear()) {
      if (parseInt(mesElegido) < (this.hoy.getMonth() + 1)) {
        this.retiro = false;
        this.flagHoraPasada = true;
      } else if (parseInt(mesElegido) === (this.hoy.getMonth() + 1)) {
        if (parseInt(diaElegido) < this.hoy.getDate()) {
          this.retiro = false;
          this.flagHoraPasada = true;
        } else if (parseInt(diaElegido) === this.hoy.getDate() && horaInt < this.hoy.getHours()) {
          this.retiro = false;
          this.flagHoraPasada = true;
        } else if (parseInt(diaElegido) === this.hoy.getDate() && horaInt === this.hoy.getHours()) {
          if (this.retiroHora1.getMinutes() <= this.hoy.getMinutes() + 10) {
            this.retiro = false;
            this.flagHoraPasada = true;
          } else {
            switch (this.dia) {
              case 'Domingo':
                this.retiro = false;
                break;
              case 'Sábado':
                if (horaInt >= 8 && horaInt < 12) {
                  this.retiro = true;
                } else if (horaInt === 12) {
                  this.retiro = this.retiroHora1.getMinutes() === 0 ? true : false;
                } else {
                  this.retiro = false;
                }
                break;
              default:
                if (horaInt >= 8 && horaInt < 17) {
                  this.retiro = true;
                  if (horaInt >= 12 && horaInt < 14) {
                    if (horaInt === 12) {
                      this.retiro = this.retiroHora1.getMinutes() === 0 ? true : false;
                    } else {
                      this.retiro = false;
                    }
                  } else {
                    this.retiro = true;
                  }
                } else if (horaInt === 17) {
                  this.retiro = this.retiroHora1.getMinutes() === 0 ? true : false;
                } else {
                  this.retiro = false;
                }
                break;
            }
          }
        } else {
          switch (this.dia) {
            case 'Domingo':
              this.retiro = false;
              break;
            case 'Sábado':
              if (horaInt >= 8 && horaInt < 12) {
                this.retiro = true;
              } else if (horaInt === 12) {
                this.retiro = this.retiroHora1.getMinutes() === 0 ? true : false;
              } else {
                this.retiro = false;
              }
              break;
            default:
              if (horaInt >= 8 && horaInt < 17) {
                this.retiro = true;
                if (horaInt >= 12 && horaInt < 14) {
                  if (horaInt === 12) {
                    this.retiro = this.retiroHora1.getMinutes() === 0 ? true : false;
                  } else {
                    this.retiro = false;
                  }
                } else {
                  this.retiro = true;
                }
              } else if (horaInt === 17) {
                this.retiro = this.retiroHora1.getMinutes() === 0 ? true : false;
              } else {
                this.retiro = false;
              }
              break;
          }
        }
      } else {
        switch (this.dia) {
          case 'Domingo':
            this.retiro = false;
            break;
          case 'Sábado':
            if (horaInt >= 8 && horaInt < 12) {
              this.retiro = true;
            } else if (horaInt === 12) {
              this.retiro = this.retiroHora1.getMinutes() === 0 ? true : false;
            } else {
              this.retiro = false;
            }
            break;
          default:
            if (horaInt >= 8 && horaInt < 17) {
              this.retiro = true;
              if (horaInt >= 12 && horaInt < 14) {
                if (horaInt === 12) {
                  this.retiro = this.retiroHora1.getMinutes() === 0 ? true : false;
                } else {
                  this.retiro = false;
                }
              } else {
                this.retiro = true;
              }
            } else if (horaInt === 17) {
              this.retiro = this.retiroHora1.getMinutes() === 0 ? true : false;
            } else {
              this.retiro = false;
            }
            break;
        }
      }
    } else {
      switch (this.dia) {
        case 'Domingo':
          this.retiro = false;
          break;
        case 'Sábado':
          if (horaInt >= 8 && horaInt < 12) {
            this.retiro = true;
          } else if (horaInt === 12) {
            this.retiro = this.retiroHora1.getMinutes() === 0 ? true : false;
          } else {
            this.retiro = false;
          }
          break;
        default:
          if (horaInt >= 8 && horaInt < 17) {
            this.retiro = true;
            if (horaInt >= 12 && horaInt < 14) {
              if (horaInt === 12) {
                this.retiro = this.retiroHora1.getMinutes() === 0 ? true : false;
              } else {
                this.retiro = false;
              }
            } else {
              this.retiro = true;
            }
          } else if (horaInt === 17) {
            this.retiro = this.retiroHora1.getMinutes() === 0 ? true : false;
          } else {
            this.retiro = false;
          }
          break;
      }
    }
  }
  fechaUpdate2($event) {
    const diaElegido = this.retiroHora.split('-')[2];
    const mesElegido = this.retiroHora.split('-')[1];
    const anoElegido = this.retiroHora.split('-')[0];
    this.flagHoraPasada = false;
    const minuto = $event;
    this.inputMinuto = minuto;
    this.retiroHora1.setMinutes(parseInt(minuto));

    if (parseInt(anoElegido) < this.hoy.getFullYear()) {
      this.retiro = false;
      this.flagHoraPasada = true;
    } else if (parseInt(anoElegido) === this.hoy.getFullYear()) {
      if (parseInt(mesElegido) < (this.hoy.getMonth() + 1)) {
        this.retiro = false;
        this.flagHoraPasada = true;
      } else if (parseInt(mesElegido) === (this.hoy.getMonth() + 1)) {
        if (parseInt(diaElegido) < this.hoy.getDate()) {
          this.retiro = false;
          this.flagHoraPasada = true;
        } else if (parseInt(diaElegido) === this.hoy.getDate() && this.retiroHora1.getHours() < this.hoy.getHours()) {
          this.retiro = false;
          this.flagHoraPasada = true;
        } else if (parseInt(diaElegido) === this.hoy.getDate() && this.retiroHora1.getHours() === this.hoy.getHours()) {
          if (parseInt(minuto) <= this.hoy.getMinutes() + 10) {
            this.retiro = false;
            this.flagHoraPasada = true;
          } else {
            switch (this.dia) {
              case 'Domingo':
                this.retiro = false;
                break;
              case 'Sábado':
                if (this.retiroHora1.getHours() >= 8 && this.retiroHora1.getHours() < 12) {
                  this.retiro = true;
                } else if (this.retiroHora1.getHours() === 12) {
                  this.retiro = parseInt(minuto) === 0 ? true : false;
                } else {
                  this.retiro = false;
                }
                break;
              default:
                if (this.retiroHora1.getHours() >= 8 && this.retiroHora1.getHours() < 17) {
                  this.retiro = true;
                  if (this.retiroHora1.getHours() >= 12 && this.retiroHora1.getHours() < 14) {
                    if (this.retiroHora1.getHours() === 12) {
                      this.retiro = parseInt(minuto) === 0 ? true : false;
                    } else {
                      this.retiro = false;
                    }
                  } else {
                    this.retiro = true;
                  }
                } else if (this.retiroHora1.getHours() === 17) {
                  this.retiro = parseInt(minuto) === 0 ? true : false;
                } else {
                  this.retiro = false;
                }
                break;
            }
          }
        } else {
          switch (this.dia) {
            case 'Domingo':
              this.retiro = false;
              break;
            case 'Sábado':
              if (this.retiroHora1.getHours() >= 8 && this.retiroHora1.getHours() < 12) {
                this.retiro = true;
              } else if (this.retiroHora1.getHours() === 12) {
                this.retiro = parseInt(minuto) === 0 ? true : false;
              } else {
                this.retiro = false;
              }
              break;
            default:
              if (this.retiroHora1.getHours() >= 8 && this.retiroHora1.getHours() < 17) {
                this.retiro = true;
                if (this.retiroHora1.getHours() >= 12 && this.retiroHora1.getHours() < 14) {
                  if (this.retiroHora1.getHours() === 12) {
                    this.retiro = parseInt(minuto) === 0 ? true : false;
                  } else {
                    this.retiro = false;
                  }
                } else {
                  this.retiro = true;
                }
              } else if (this.retiroHora1.getHours() === 17) {
                this.retiro = parseInt(minuto) === 0 ? true : false;
              } else {
                this.retiro = false;
              }
              break;
          }
        }
      } else {
        switch (this.dia) {
          case 'Domingo':
            this.retiro = false;
            break;
          case 'Sábado':
            if (this.retiroHora1.getHours() >= 8 && this.retiroHora1.getHours() < 12) {
              this.retiro = true;
            } else if (this.retiroHora1.getHours() === 12) {
              this.retiro = parseInt(minuto) === 0 ? true : false;
            } else {
              this.retiro = false;
            }
            break;
          default:
            if (this.retiroHora1.getHours() >= 8 && this.retiroHora1.getHours() < 17) {
              this.retiro = true;
              if (this.retiroHora1.getHours() >= 12 && this.retiroHora1.getHours() < 14) {
                if (this.retiroHora1.getHours() === 12) {
                  this.retiro = parseInt(minuto) === 0 ? true : false;
                } else {
                  this.retiro = false;
                }
              } else {
                this.retiro = true;
              }
            } else if (this.retiroHora1.getHours() === 17) {
              this.retiro = parseInt(minuto) === 0 ? true : false;
            } else {
              this.retiro = false;
            }
            break;
        }
      }
    } else {
      switch (this.dia) {
        case 'Domingo':
          this.retiro = false;
          break;
        case 'Sábado':
          if (this.retiroHora1.getHours() >= 8 && this.retiroHora1.getHours() < 12) {
            this.retiro = true;
          } else if (this.retiroHora1.getHours() === 12) {
            this.retiro = parseInt(minuto) === 0 ? true : false;
          } else {
            this.retiro = false;
          }
          break;
        default:
          if (this.retiroHora1.getHours() >= 8 && this.retiroHora1.getHours() < 17) {
            this.retiro = true;
            if (this.retiroHora1.getHours() >= 12 && this.retiroHora1.getHours() < 14) {
              if (this.retiroHora1.getHours() === 12) {
                this.retiro = parseInt(minuto) === 0 ? true : false;
              } else {
                this.retiro = false;
              }
            } else {
              this.retiro = true;
            }
          } else if (this.retiroHora1.getHours() === 17) {
            this.retiro = parseInt(minuto) === 0 ? true : false;
          } else {
            this.retiro = false;
          }
          break;
      }
    }
  }

  // Formato dia
  diaSemana(dia, mes, anio): string {
    const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const dt = new Date(mes + ' ' + dia + ', ' + anio + ' 12:00:00');
    return dias[dt.getDay()];
  }
  /////////////
  mapa: false;
  datosCompra = {
    entrega: '0',
    medio: {
      nombre: '',
      telefono: '',
      direccion: '',
    },
    envio : {
      calle: '',
      localidad: '',
      provincia: '',
      telefono: '',
    },
    agregado: '0',
  };
  editingEnvio: boolean = false;
  editingTransporte: boolean = false;
  editingFacturacion: boolean = false;

  subtotal: number = 0;
  total: number = 0;
  facturacion__toogle = false;
  facturacion__envio = false;

  secciones = [
    'Mi compra',
    'Datos de envío',
    'Confirmación',
  ];
  initialLista = [];
  config: any;
  constructor(
    private data: SharedService,
    // private http: HttpClient,
    private auth: AutenticacionService,
    private router: Router,
    private location: Location,
    private googleAnalyticsService: GoogleAnalyticsService,
  ) {

    this.transaccion = new DatosTransaccion(0);
    this.dia = this.diaSemana(this.hoyMediodia.getDate(), this.hoyMediodia.toLocaleString('default', { month: 'long' }), this.hoyMediodia.getFullYear());
    if (this.data.user) {
      this.user = this.data.user as cliente;
      this.auth.get('public/cliente/envio/getAll').then((result) => {
        if (result.responseT) {
          result.responseT.forEach((transporte) => {
            this.entrega.transporte.lista.push({
              id: transporte.codigo,
              text: transporte.nombre,
            });
            this.entrega.transporte.array[transporte.codigo] = transporte.nombre;
          });
          this.initialLista.push(this.entrega.transporte.lista.find((transporte) => {
            return transporte.id === this.user.datosEnvio.codigoTransporte;
          }));
        }
        if (result.responseP) {
          result.responseP.forEach((provincia) => {
            this.entrega.provincia.lista.push({
              id: provincia.codigo,
              text: provincia.nombre,
            });
            this.entrega.provincia.array[provincia.codigo] = provincia.nombre;
          });
        }
      }).catch((error) => this.data.log('public/cliente/envio/getAll error compra:', error));

      if (this.user.datosEnvio) {
        this.datos_envio.cargar(this.user.datosEnvio);
        this.datosEnvio_flag = true;
        if (this.user.datosEnvio.domicilioEntrega) {
          this.datostransporte.cargar(
            this.user.datosEnvio.domicilioEntrega.direccion,
            this.user.datosEnvio.domicilioEntrega.ciudad,
            this.user.datosEnvio.domicilioEntrega.provincia,
            this.user.datosEnvio.telefono,
            this.user.datosEnvio.codigoTransporte,
          );
        }else {
          this.datostransporte.cargar(
          '',
          '',
          '',
          this.user.datosEnvio.telefono,
          this.user.datosEnvio.codigoTransporte,
        );
        }
      }
      this.datosCompra = {
        entrega: '0',
        medio: {
          nombre: '',
          telefono: '',
          direccion: '',
        },
          envio:   {
          calle:      this.user.datosEnvio.domicilioEntrega ? this.user.datosEnvio.domicilioEntrega.direccion : '',
          localidad:  this.user.datosEnvio.domicilioEntrega ? this.user.datosEnvio.domicilioEntrega.ciudad : '',
          provincia:  this.user.datosEnvio.domicilioEntrega ? this.user.datosEnvio.domicilioEntrega.provincia : '',
          telefono:   this.user.telefonoFacturacion ? this.user.telefonoFacturacion : '',
        },
        agregado: '0',
      };
      this.facturacion.cargar(this.user);
    }

    setInterval(() => {
      this.hoy = new Date();
    }, 300000);
  }

  cargarTransporte: boolean = false;
  datosEnvio_flag:       boolean = false;

  public refreshTransporte(value: any): void {
    this.datos_envio.cod_transporte = value;
    this.cargarTransporte = false;
  }
  public refreshProvincia(value: any): void {
    this.datos_envio.domicilio_provincia = value;
  }

  observaciones = '';
  pedido: boolean = true;
  completarCompraTexto = '';
  pedidoCorrecto = true;
  completarCompraLink = '';

  public completarCompra() {
    if (this.datosCompra.entrega === '0') {
      this.retiro = true;
    }
    if (!this.carritoLoading && this.retiro) {
      this.carritoLoading = true;
      this.completarCompraTexto = 'Procesando pedido...';
      const body = new URLSearchParams();
      if (this.datosCompra.agregado === '1' && this.idPedidoAgregado && this.responseSuccessAgregado) {
        this.observaciones = this.observaciones + '\r\n' + ' - ' + '\r\n' + 'Agregado al pedido ID #' + this.idPedidoAgregado +
                            ' realizado el dia ' + this.responseSuccessAgregado.fechaPedido;
        body.set('es_agregado', this.datosCompra.agregado);
        body.set('ref_pedido', this.idPedidoAgregado.toString());
      }
      body.set('observaciones', this.observaciones);
      body.set('total', this.pedido ? this.updateTotal(this.carrito.subtotal) : '100.01');
      if (this.datosCompra.entrega === '1' && this.datosCompra.agregado !== '1') {
        body.set('retiro_tienda', this.datosCompra.entrega);
        const retiroDate = new Date(this.retiroHora);
        const diaRetiro = retiroDate.getUTCDate();
        const mesRetiro = retiroDate.getMonth() + 1;
        const anioRetiro = retiroDate.getFullYear();
        const fechaRetiro = diaRetiro + '/' + mesRetiro + '/' + anioRetiro + ' (' + this.dia + ')';
        const hora = this.retiroHora1.getHours();
        const minutos = this.retiroHora1.getMinutes();
        const horaRetiro = ('0' + hora).slice(-2) + ':' + ('0' + minutos).slice(-2);
        body.set('dia_retiro', fechaRetiro);
        body.set('hora_retiro', horaRetiro);
      }
      this.auth.post('pedido/confirmar', body)
      .then(($confirmado) => {
        const productos = this.carrito.lista;
        let respuesta;

        if ($confirmado.body) {
          respuesta = $confirmado.body.response;
        }

        if (respuesta) {
          this.total = respuesta.total;
          this.googleAnalyticsService.nuevoPedido(respuesta.id_pedido, respuesta.total, productos);
        }

        this.completarCompraTexto = $confirmado.body.response.message;
        this.completarCompraLink = $confirmado.body.response.urlPdf;

        // Lo suscribo el newsletter
        const sendyUrl = 'https://mailing.leren.com.ar/';

        const body = new URLSearchParams();
        body.set('api_key', 'RCUuYdks5u0kwkTgCVlw ');
        body.set('name', this.user.razonSocial);
        body.set('email', this.user.email);
        body.set('list', 'cqW4SwUCeaOE36rhy8922C3A');
        body.set('country', 'AR');
        body.set('referrer', 'https://www.sina.com.ar/');
        body.set('boolean', 'true');
        body.set('logueado', 'SI');

        this.auth.get('sendy/cliente/getDatosNewsletter')
        .then((result) => {
          this.data.log('response getDatosNewsletter compra', result);

          body.set('lista_precios', result.response.lista_precios);
          body.set('tipo_lista', result.response.tipo_lista);
          body.set('perfil', result.response.perfil);

          this.auth.post(sendyUrl + 'subscribe', body)
          .then(($response) => {
            this.data.log('response suscribir compra', $response);
          })
          .catch(($error) => {
            this.data.log('error suscribir compra', $error);
          });
        })
        .catch((error) => {
          this.data.log('error getDatosNewsletter footer', error);
        });

        // Continuo el flujo normal de la compra
        setTimeout(() => {
          this.data.rutaActual = '/compra/finalizada';
          this.location.go('/compra/finalizada');
          this.transaccion.cambio(2);
          this.data.cleanCarrito();
          this.carritoLoading = false;
        }, 1500);
      })
      .catch(($error) => {
        this.carritoLoading = false;
        try {
          this.pedidoCorrecto = false;
          this.completarCompraTexto = $error.error.response.message;
        }catch (error) {
          this.data.log('completarcompra error compra:', error, $error, '$error.error.response.message');
        }
        this.data.log('confirmarpedido error compra:', $error);
      });
    } else if (!this.retiro) {
      this.mensajeErrorRetiro.nativeElement.focus();
    }
  }

  ngOnInit() {
    this.data.updatePageTitle();
    // subscribing to config change
    this.data.currentConfig.pipe(takeUntil(this.destroy$)).subscribe(
      (configuracion) => {
        this.config = configuracion;
      },
    );
    this.data.currentMessage.pipe(takeUntil(this.destroy$)).subscribe(() => this.checkCarritoInit(0));
    this.data.currentUser.pipe(takeUntil(this.destroy$)).subscribe(($user) => {
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
    });
    this.fechaUpdate(this.hoyMediodia.getFullYear() + '-' + (this.hoyMediodia.getMonth() + 1) + '-' + this.hoyMediodia.getDate());
  }

  ngOnDestroy() {
    this.destroy$.next();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      if (this.inputCantidad && this.inputCantidad.nativeElement) {
        this.inputSub = Observable.fromEvent(this.inputCantidad.nativeElement, 'input')
        .debounceTime(1000)
        .pipe(takeUntil(this.destroy$)).subscribe(
          () => {
            const body = new URLSearchParams();
            const array = [];
            for (const item of this.carrito.lista) {
              if (item.cantidad > 0) {
                array.push({id_producto: item.id, cantidad: item.cantidad});
              }
            }
            body.set('lista', JSON.stringify(array));

            this.auth.post('carrito/update_cantidades', body)
            .then(($response) => {
              this.data.log('response carritoupdatecantidades compra debounced', $response);
            })
            .catch(($error) => {
              this.data.log('error carritoupdatecantidades compra debounced', $error);
            });
          },
        );
      }
    }, 2000);
  }

  public seleccionarTransporte($herramienta, $codigo) {
    if ($herramienta) {
      const item = $herramienta.itemsList._items.find(($item) => $item.value === $codigo);
      if (item) {
        $herramienta.select(item);
      }
    }
  }
  public seleccionarProvincia($herramienta, $codigo) {
    if ($herramienta) {
      const item = $herramienta.itemsList._items.find(($item) => $item.value === $codigo);
      if (item) {
        $herramienta.select(item);
      }
    }
  }

  removeCompraItem($item) {
    const body = new URLSearchParams();
    body.set('id_producto', $item.id);
    this.auth.post('carrito/eliminar_item', body)
    .then(($response) => {
      this.data.log('response carritoeliminaritem compra', $response);
      this.data.removeMessage($item);
      this.updateValue();
    })
    .catch(($error) => {
      this.data.log('error carritoeliminaritem compra', $error);
    });
  }
  updateValue() {
    let $carrito = 0;
    for (const c of this.carrito.lista) {
      const precio = c.precio;
      const cantidad = c.cantidad;
      $carrito += precio * cantidad;
    }
    this.carrito.subtotal = $carrito;
  }
  updateValueDelayed() {
    setTimeout(() => {
      let $carrito = 0;
      for (const c of this.carrito.lista) {
        const precio = c.precio;
        const cantidad = c.cantidad;
        $carrito += precio * cantidad;
      }
      this.carrito.subtotal = $carrito;
    }, 200);
  }
  updatePrecio($precio, $cantidad): string {
    const subtotal = $precio * $cantidad;
    return this.corregirPrecio(subtotal);
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

    return s + (j ? i.substr(0, j) + t : '') + i.substr(j).replace(/(\d{3})(?=\d)/g, '$1' + t) +
    (c ? d + Math.abs(n - +i).toFixed(c).slice(2) : '');
  }
  corregirPrecio($precio): string {
  return this.formatMoney($precio);
  }
  updateTotal($precio): string {
    const subtotal = $precio;
    return this.formatMoney(subtotal);
  }
  selectedForma($input) {
    this.datosCompra.entrega = $input;
  }
  datos_envio_error: string = '';
  addTransporte() {
    if (this.cargarTransporte) {
      this.datostransporte.add().then((response) => {
        this.datos_envio_error = '';
        this.cargarTransporte = false;
        this.data.log('addtransporte response compra:', response);
        const temp_transporte = {
          id: response['codigo'],
          text: this.datostransporte.form.nombreTransporte,
        };
        this.entrega.transporte.lista.push(temp_transporte);
        this.initialLista = [temp_transporte];
        this.refreshTransporte(temp_transporte);
      }).catch((error) => {
        Object.values(error.error.response).forEach(($error_item) => this.datos_envio_error += $error_item);
      });
      // this.transaccion.cambio(2)
    } else {
      this.datostransporte.update().then((response) => {
        this.datos_envio_error = '';
        this.editingEnvio = false;
      }).catch((error) => {
        if (error.error) {
          Object.values(error.error.response).forEach(($error_item) => this.datos_envio_error += $error_item);
        } else {
          this.datos_envio_error = 'Hubo un problema en la carga de los datos, aguarde un momento y vuelva a intentar.';
        }
    });

    }
  }
  delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
  carritoLoading: boolean = false;

  async printAll() {
    this.transaccion.cambio(1);
}

  // Finalizar Compra
  finalizarCompra() {
    if (this.carrito.lista.length) {
      // this.carritoLoading = true;
      this.modalLoading = true;

      const body = new URLSearchParams();
      const array = [];
      for (const item of this.carrito.lista) {
        if (item.cantidad > 0) {
          array.push({id_producto: item.id, cantidad: item.cantidad});
        }
      }
      body.set('lista', JSON.stringify(array));

      this.auth.post('carrito/update_cantidades', body)
      .then(($response) => {
        this.data.log('response carritoupdatecantidades compra', $response);
        if (this.carrito.subtotal < this.config.montoEnvio) {
          this.datosCompra.entrega = '1';
        } else {
          this.datosCompra.entrega = '0';
        }
        this.location.go('/compra/envio');
        this.data.rutaActual = '/compra/envio';
        this.printAll();

        this.carritoLoading = false;
        this.modalLoading = false;
      })
      .catch(($error) => {
        this.data.log('error carritoupdatecantidades compra', $error);

        this.carritoLoading = false;
        this.modalLoading = false;
      });
    }
  }
  isChecked = {
    entrega_lunes:     false,
    entrega_martes:    false,
    entrega_miercoles: false,
    entrega_jueves:    false,
    entrega_viernes:   false,
    entrega_sabado:    false,
  };
  checkValue($value, $dia) {
    this.datos_envio[$dia] = $value;
  }
  clicked($dia) {
    this.isChecked[$dia] = !this.isChecked[$dia];
    this.datos_envio[$dia] = this.isChecked[$dia] ? 1 : 0;

  }
  texto_busqueda: string = '';
  ResultadoBusqueda: any;
  buscarPalabra(event) {
    if (event.target.value.length >= 3) {
      const body = new URLSearchParams();
      body.set('frase', this.texto_busqueda);
      this.auth.post('producto/busqueda', body)
      .then(($response) => {
          this.ResultadoBusqueda = $response.body.response.slice(0, 6);
      })
      .catch((error) => this.data.log('buscarpalabra error compra:', error));
    }
  }
  enterBusqueda(event) {
    if (event.keyCode == 13) {
      this.router.navigate(['/busqueda/' + this.texto_busqueda]);
      // this.cerrarBusqueda()
    }
  }
  cerrarBusqueda(msg) {
    const precio = msg.precio;
    this.data.changeMessage(msg.cantidad ? msg.cantidad : 1, msg.titulo, precio, precio * (+msg.cantidad), msg.id,
      msg.codInterno, (msg.categorias && msg.categorias.length > 0) ? msg.categorias[0].nombre : '', msg.cantPack);
    this.ResultadoBusqueda = [];
  }
  descargarPedido($pedido) {
    this.data.log('descargarpedido pedido compra:', $pedido);
  }

  checkCarritoInit($value) {
    if ($value === 0) {
      this.carritoLoading = true;
      this.carrito.lista = this.data.lista;
      this.updateValue();
      if (this.data.rutaActual != '/compra/finalizada') {
        this.data.rutaActual = '/compra/carrito';
        this.location.go('/compra/carrito');
      }
      this.carritoLoading = false;
    }
  }

  closeModal(event: string) {
    this.modalLoading = false;
  }

  toggleEditingEnvio() {
    this.editingEnvio = !this.editingEnvio;

    if (this.editingEnvio) {
      setTimeout(() => {
        if (this.datos_envio.cod_transporte) {
          this.seleccionarTransporte(this.ngSelectTransporte, this.datos_envio.cod_transporte);
        }
        if (this.datos_envio.domicilio_provincia) {
          this.seleccionarProvincia(this.ngSelectProvincia, this.datos_envio.domicilio_provincia);
        }
      }, 500);
    }
  }

  enterBusquedaAgregado(event) {
    if (event.keyCode == 13) {
      this.finalizarCompraAgregado();
    }
  }
  finalizarCompraAgregado() {
    this.showErrorAgregado = false;
    this.responseErrorAgregado = '';

    if (this.idPedidoAgregado && this.idPedidoAgregado > 0) {
      if (this.carrito.lista.length) {
        // this.carritoLoading = true;
        this.modalLoading = true;

        const body = new URLSearchParams();
        const array = [];
        for (const item of this.carrito.lista) {
          if (item.cantidad > 0) {
            array.push({id_producto: item.id, cantidad: item.cantidad});
          }
        }
        body.set('lista', JSON.stringify(array));

        this.auth.post('carrito/update_cantidades', body)
        .then(($response) => {
          this.data.log('response carritoupdatecantidades compraagregado', $response);
          const body2 = new URLSearchParams();
          body2.set('id_pedido', JSON.stringify(this.idPedidoAgregado));
          this.auth.post('pedido/busqueda_agregado', body2)
          .then(($response2) => {
            this.data.log('response busquedaagregado compraagregado', $response2);

            if ($response2.body.status) {
              this.responseSuccessAgregado = $response2.body.response;
              this.responseSuccessAgregado.fechaPedido = this.responseSuccessAgregado.fechaPedido.date.split(' ')[0].split('-').reverse().join('/');

              this.datosCompra.agregado = '1';

              this.location.go('/compra/envio');
              this.data.rutaActual = '/compra/envio';
              this.printAll();
            } else {
              this.showErrorAgregado = true;
              this.responseErrorAgregado = $response2.body.response;
            }
            this.carritoLoading = false;
            this.modalLoading = false;
          })
          .catch(($error2) => {
            this.data.log('error busquedaagregado compraagregado', $error2);
            this.carritoLoading = false;
            this.modalLoading = false;
          });
        })
        .catch(($error) => {
          this.data.log('error carritoupdatecantidades compraagregado', $error);
          this.carritoLoading = false;
          this.modalLoading = false;
        });
      }
    } else {
      this.showErrorAgregado = true;
      this.responseErrorAgregado = 'No se ingresó un ID de pedido válido.';
    }
  }
  
  public revisarCantidad(e) {
    if (e.target && parseInt(e.target.value) < parseInt(e.target.min)) {
      e.target.value = e.target.min;
    }
  }
}

@Pipe({
  name: "sort"
})
export class ArraySortIntPipe  implements PipeTransform {
  transform(array: any, field: string): any[] {
    if (!Array.isArray(array)) {
      return;
    }
    array.sort((a: any, b: any) => {
      if (parseInt(a[field]) < parseInt(b[field])) {
        return -1;
      } else if (a[field] > b[field]) {
        return 1;
      } else {
        return 0;
      }
    });
    return array;
  }
}
