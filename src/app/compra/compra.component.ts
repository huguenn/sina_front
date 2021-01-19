import { Component, OnInit, AfterViewInit, Input, OnChanges, ViewChild, ElementRef } from '@angular/core';
import { SharedService, cliente } from '../shared.service';
import {
  DatosTransaccion,
  clienteActualizar,
  clientEnvioActualizarDatos
} from '../data';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AutenticacionService } from '../autenticacion.service';
import { Observable } from 'rxjs/Rx';
import 'rxjs/add/observable/fromEvent';
import 'rxjs/add/observable/defer';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { debounceTime } from 'rxjs/operator/debounceTime';
import { distinctUntilChanged } from 'rxjs/operator/distinctUntilChanged';
import { Subscription } from 'rxjs/Subscription';
import { GoogleAnalyticsService } from "../google-analytics.service";
import { NgSelectComponent } from '@ng-select/ng-select';

@Component({
  selector: 'app-compra',
  templateUrl: './compra.component.html',
  styleUrls: ['./compra.component.css'],
  providers: [GoogleAnalyticsService],
})
export class CompraComponent implements OnInit, AfterViewInit {
  @ViewChild('transporte') ngSelectTransporte: NgSelectComponent;
  @ViewChild('inputCantidad') inputCantidad: ElementRef;
  @ViewChild('mensaje_error_retiro') mensajeErrorRetiro: ElementRef;
  inputSub: Subscription;
  public modalLoading: boolean = false;
  iva_usuario: string = '';
  user: cliente;
  transaccion: DatosTransaccion;
  facturacion: any = {
    datos: new clienteActualizar(),
    cargar: function ($cliente){
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
          body.set(dato, this.facturacion.datos[dato]);
        }
        this.auth.post('cliente/actualizar', body)
        .then($response => {
          resolve($response.body.response);
        })
        .catch(($error) => {
          this.data.log('updatecliente error compra:', $error);
          reject($error);
        });
      });
    }
  };
  entrega: any = {
    transporte: {
      lista: []
    }
  };

  datos_envio: clientEnvioActualizarDatos = new clientEnvioActualizarDatos();

  carrito = {
    hora: '16 Sep 14:05',
    subtotal: 0,
    lista: [
    ]
  };
  datostransporte = {
    data: {
      calle: '',
      localidad: '',
      provincia: '',
      telefono: '',
      codigoTransporte: '',
      horarioEntrega: '',
      nombreTransporte: ''
    },
    form: {
      nombreTransporte: '',
      domicilioTransporte: '',
      telefonoTransporte: ''
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
        Object.keys(datos).forEach(key => {
          body.set(key, datos[key]);
        });
        this.auth.post('cliente/envio/actualizar_datos', body)
        .then($response => {
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
        Object.keys(this.datostransporte.form).forEach(key => {
          body.set(key, this.datostransporte.form[key]);
        });
        this.auth.post('cliente/envio/nuevo_transporte', body)
        .then($response => {
          resolve($response.body.response);
        })
        .catch(($error) => {
          this.data.log('envionuevotransporte error compra:', $error);
          reject($error);
        });
      });
    }
  };
  retiro: boolean = false;
  flagHoraPasada: boolean = false;
  dia: string = '';
  hoy = new Date();
  hoyFormatted = this.hoy.getFullYear() + '-' + this.hoy.getMonth()+1 + '-' + this.hoy.getDate();
  hoyMediodia = new Date(this.hoy.getFullYear(), this.hoy.getMonth(), this.hoy.getDate(), 13, 0);
  retiroHora = this.hoyMediodia.getFullYear() + '-' + this.hoyMediodia.getMonth()+1 + '-' + this.hoyMediodia.getDate();
  retiroHora1 = this.hoyMediodia;
  inputFecha: string = this.hoyMediodia.getDate() + '/' + this.hoyMediodia.getMonth()+1 + '/' + this.hoyMediodia.getFullYear();
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
      if (parseInt(mesElegido) < this.hoy.getMonth()+1) {
        this.retiro = false;
        this.flagHoraPasada = true;
      } else if (parseInt(mesElegido) === this.hoy.getMonth()+1) {
        if (parseInt(diaElegido) < this.hoy.getDate()) {
          this.retiro = false;
          this.flagHoraPasada = true;
        } else if (parseInt(diaElegido) === this.hoy.getDate() && this.retiroHora1.getHours() < this.hoy.getHours()) {
          this.retiro = false;
          this.flagHoraPasada = true;
        } else if (parseInt(diaElegido) === this.hoy.getDate() && this.retiroHora1.getHours() === this.hoy.getHours()) {
          if (this.retiroHora1.getMinutes() <= this.hoy.getMinutes()+10) {
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
    this.inputHora = hora;
    this.retiroHora1.setHours(parseInt(hora));

    if (parseInt(anoElegido) < this.hoy.getFullYear()) {
      this.retiro = false;
      this.flagHoraPasada = true;
    } else if (parseInt(anoElegido) === this.hoy.getFullYear()) {
      if (parseInt(mesElegido) < this.hoy.getMonth()+1) {
        this.retiro = false;
        this.flagHoraPasada = true;
      } else if (parseInt(mesElegido) === this.hoy.getMonth()+1) {
        if (parseInt(diaElegido) < this.hoy.getDate()) {
          this.retiro = false;
          this.flagHoraPasada = true;
        } else if (parseInt(diaElegido) === this.hoy.getDate() && parseInt(hora) < this.hoy.getHours()) {
          this.retiro = false;
          this.flagHoraPasada = true;
        } else if (parseInt(diaElegido) === this.hoy.getDate() && parseInt(hora) === this.hoy.getHours()) {
          if (this.retiroHora1.getMinutes() <= this.hoy.getMinutes()+10) {
            this.retiro = false;
            this.flagHoraPasada = true;
          } else {
            switch (this.dia) {
              case 'Domingo':
                this.retiro = false;
                break;
              case 'Sábado':
                if (parseInt(hora) >= 8 && parseInt(hora) < 12) {
                  this.retiro = true;
                } else if (parseInt(hora) === 12) {
                  this.retiro = this.retiroHora1.getMinutes() === 0 ? true : false;
                } else {
                  this.retiro = false;
                }
                break;
              default:
                if (parseInt(hora) >= 8 && parseInt(hora) < 17) {
                  this.retiro = true;
                  if (parseInt(hora) >= 12 && parseInt(hora) < 14) {
                    if (parseInt(hora) === 12) {
                      this.retiro = this.retiroHora1.getMinutes() === 0 ? true : false;
                    } else {
                      this.retiro = false;
                    }
                  } else {
                    this.retiro = true;
                  }
                } else if (parseInt(hora) === 17) {
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
              if (parseInt(hora) >= 8 && parseInt(hora) < 12) {
                this.retiro = true;
              } else if (parseInt(hora) === 12) {
                this.retiro = this.retiroHora1.getMinutes() === 0 ? true : false;
              } else {
                this.retiro = false;
              }
              break;
            default:
              if (parseInt(hora) >= 8 && parseInt(hora) < 17) {
                this.retiro = true;
                if (parseInt(hora) >= 12 && parseInt(hora) < 14) {
                  if (parseInt(hora) === 12) {
                    this.retiro = this.retiroHora1.getMinutes() === 0 ? true : false;
                  } else {
                    this.retiro = false;
                  }
                } else {
                  this.retiro = true;
                }
              } else if (parseInt(hora) === 17) {
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
            if (parseInt(hora) >= 8 && parseInt(hora) < 12) {
              this.retiro = true;
            } else if (parseInt(hora) === 12) {
              this.retiro = this.retiroHora1.getMinutes() === 0 ? true : false;
            } else {
              this.retiro = false;
            }
            break;
          default:
            if (parseInt(hora) >= 8 && parseInt(hora) < 17) {
              this.retiro = true;
              if (parseInt(hora) >= 12 && parseInt(hora) < 14) {
                if (parseInt(hora) === 12) {
                  this.retiro = this.retiroHora1.getMinutes() === 0 ? true : false;
                } else {
                  this.retiro = false;
                }
              } else {
                this.retiro = true;
              }
            } else if (parseInt(hora) === 17) {
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
          if (parseInt(hora) >= 8 && parseInt(hora) < 12) {
            this.retiro = true;
          } else if (parseInt(hora) === 12) {
            this.retiro = this.retiroHora1.getMinutes() === 0 ? true : false;
          } else {
            this.retiro = false;
          }
          break;
        default:
          if (parseInt(hora) >= 8 && parseInt(hora) < 17) {
            this.retiro = true;
            if (parseInt(hora) >= 12 && parseInt(hora) < 14) {
              if (parseInt(hora) === 12) {
                this.retiro = this.retiroHora1.getMinutes() === 0 ? true : false;
              } else {
                this.retiro = false;
              }
            } else {
              this.retiro = true;
            }
          } else if (parseInt(hora) === 17) {
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
      if (parseInt(mesElegido) < this.hoy.getMonth()+1) {
        this.retiro = false;
        this.flagHoraPasada = true;
      } else if (parseInt(mesElegido) === this.hoy.getMonth()+1) {
        if (parseInt(diaElegido) < this.hoy.getDate()) {
          this.retiro = false;
          this.flagHoraPasada = true;
        } else if (parseInt(diaElegido) === this.hoy.getDate() && this.retiroHora1.getHours() < this.hoy.getHours()) {
          this.retiro = false;
          this.flagHoraPasada = true;
        } else if (parseInt(diaElegido) === this.hoy.getDate() && this.retiroHora1.getHours() === this.hoy.getHours()) {
          if (parseInt(minuto) <= this.hoy.getMinutes()+10) {
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
      direccion: ''
    },
    envio : {
      calle: '',
      localidad: '',
      provincia: '',
      telefono: '',
    }
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
    'Confirmación'
  ];
  initialLista = [];
  config: any;
  constructor(private data: SharedService, private http: HttpClient, private auth: AutenticacionService, private router: Router, private location: Location, private googleAnalyticsService: GoogleAnalyticsService) {

    this.transaccion = new DatosTransaccion(0);
    this.dia = this.diaSemana(this.hoyMediodia.getDate(), this.hoyMediodia.toLocaleString('default', { month: 'long' }), this.hoyMediodia.getFullYear());
    if (this.data.user) {
      this.user = this.data.user as cliente;
      this.auth.get('public/cliente/envio/getAll').then((result) => {
        result.response.forEach(transporte => {
          this.entrega.transporte.lista.push({
            id: transporte.codigo,
            text: transporte.nombre
          });
        });
        this.entrega.transporte.lista.push({id: 'FFF', text: 'INGRESAR NUEVO TRANSPORTE'});
        this.initialLista.push(this.entrega.transporte.lista.find((transporte) => {
          return transporte.id === this.user.datosEnvio.codigoTransporte;
        }));
      }).catch((error) => this.data.log('public/cliente/envio/getAll error compra:', error));

      if (this.user.datosEnvio) {
        this.medioTransporte = this.user.datosEnvio.nombreTransporte;
        this.datos_envio.cargar(this.user.datosEnvio);
        this.datosEnvio_flag = true;
        if (this.user.datosEnvio.domicilioEntrega) {
          this.datostransporte.cargar(
            this.user.datosEnvio.domicilioEntrega.direccion,
            this.user.datosEnvio.domicilioEntrega.ciudad,
            this.user.datosEnvio.domicilioEntrega.provincia,
            this.user.datosEnvio.telefono,
            this.user.datosEnvio.codigoTransporte
          );
        }else {
          this.datostransporte.cargar(
          '',
          '',
          '',
          this.user.datosEnvio.telefono,
          this.user.datosEnvio.codigoTransporte
        );
        }
      }
      this.datosCompra = {
        entrega: '0',
        medio: {
          nombre: '',
          telefono: '',
          direccion: ''
        },
          envio:   {
          calle:      this.user.datosEnvio.domicilioEntrega ? this.user.datosEnvio.domicilioEntrega.direccion : '',
          localidad:  this.user.datosEnvio.domicilioEntrega ? this.user.datosEnvio.domicilioEntrega.ciudad : '',
          provincia:  this.user.datosEnvio.domicilioEntrega ? this.user.datosEnvio.domicilioEntrega.provincia : '',
          telefono:   this.user.telefonoFacturacion ? this.user.telefonoFacturacion : ''
        },
      };
      this.facturacion.cargar(this.user);
    }

    setInterval(() => {
      this.hoy = new Date();
    }, 300000)
  }

  cargarTransporte: boolean = false;
  medioTransporte:  string = '';
  datosEnvio_flag:       boolean = false;

  public refreshTransporte(value: any): void {
    this.medioTransporte = value.text;
    this.datos_envio.cod_transporte = value.id;
    if (value.text === 'INGRESAR NUEVO TRANSPORTE') {
      this.cargarTransporte = true;
    }else {
      this.cargarTransporte = false;
    }
  }

  observaciones = '';
  pedido: boolean = true;
  completarCompraTexto = '';
  pedidoCorrecto = true;
  completarCompraLink = '';

  public completarCompra() {
    if(this.datosCompra.entrega === '0') {
      this.retiro = true;
    }
    if (!this.carritoLoading && this.retiro) {
      this.carritoLoading = true;
      this.completarCompraTexto = 'Procesando pedido...';
      const body = new URLSearchParams();
      body.set('observaciones', this.observaciones);
      body.set('total', this.pedido ? this.updateTotal(this.carrito.subtotal) : '100.01');
      if (this.datosCompra.entrega === '1') {
        body.set('retiro_tienda', this.datosCompra.entrega);
        const retiroDate = new Date(this.retiroHora);
        const diaRetiro = retiroDate.getUTCDate();
        const mesRetiro = retiroDate.getMonth() + 1;
        const anioRetiro = retiroDate.getFullYear();
        const fechaRetiro = diaRetiro + '/' + mesRetiro + '/' + anioRetiro + ' (' + this.dia + ')';
        const hora = this.retiroHora1.getHours() < 10 ? '0' + this.retiroHora1.getHours() : this.retiroHora1.getHours();
        const minutos = this.retiroHora1.getMinutes() < 10 ? '0' + this.retiroHora1.getMinutes() : this.retiroHora1.getMinutes();
        const horaRetiro = hora + ':' + minutos;
        body.set('dia_retiro', fechaRetiro);
        body.set('hora_retiro', horaRetiro);
      }
      this.auth.post('pedido/confirmar', body)
      .then($confirmado => {
        let productos = this.carrito.lista;
        let respuesta;

        if($confirmado.body) {
          respuesta = $confirmado.body.response;
        }

        if(respuesta) {
          this.total = respuesta.total;
          this.googleAnalyticsService.nuevoPedido(respuesta.id_pedido, respuesta.total, productos);
        }

        this.completarCompraTexto = $confirmado.body.response.message;
        this.completarCompraLink = $confirmado.body.response.urlPdf;
        setTimeout(() => {
          this.data.rutaActual = '/compra/finalizada';
          this.location.go('/compra/finalizada');
          this.transaccion.cambio(2);
          this.data.cleanCarrito();
          this.carritoLoading = false;
        }, 1500);
      })
      .catch($error => {
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
    this.data.currentConfig.subscribe(
      configuracion => {
        this.config = configuracion;
      }
    );
    this.data.currentMessage.subscribe(() => this.checkCarritoInit(0));
    this.data.currentUser.subscribe($user => {
      if ($user) {
        switch ($user['codCategoriaIva']) {
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
    this.fechaUpdate(this.hoyMediodia.getFullYear() + '-' + (this.hoyMediodia.getMonth() + 1) + '-' + this.hoyMediodia.getDate());
  }
  ngAfterViewInit() {
    if(this.inputCantidad && this.inputCantidad.nativeElement) {
      setTimeout(() => {
        this.inputSub = Observable.fromEvent(this.inputCantidad.nativeElement, 'input')
        .debounceTime(1000)
        .subscribe(
          () => {
            const body = new URLSearchParams();
            let array = [];
            for(let item of this.carrito.lista) {
              array.push({id_producto: item.id, cantidad: item.cantidad});
            }
            body.set('lista', JSON.stringify(array));

            this.auth.post('carrito/update_cantidades', body)
            .then($response => {
              this.data.log('response carritoupdatecantidades compra debounced', $response);
            })
            .catch($error => {
              this.data.log('error carritoupdatecantidades compra debounced', $error);
            });
          }
        );
      },2000);
    }
  }

  public seleccionartransporte($herramienta, $codigo) {
    if ($herramienta) {
      const item = $herramienta.itemsList._items.find($item => $item.value.id === $codigo);
      if (item) {
        $herramienta.select(item);
      }
    }
  }

  removeCompraItem($item) {
    const body = new URLSearchParams();
    body.set('id_producto', $item.id);
    this.auth.post('carrito/eliminar_item', body)
    .then($response => {
      this.data.log('response carritoeliminaritem compra', $response);
      this.data.removeMessage($item);
      this.updateValue();
    })
    .catch($error => {
      this.data.log('error carritoeliminaritem compra', $error);
    });
  }
  updateValue() {
    let $carrito = 0;
    for (let index = 0; index < this.carrito.lista.length; index++) {
      const precio = this.carrito.lista[index].precio;
      const cantidad = this.carrito.lista[index].cantidad;
      $carrito += precio * cantidad;
    }
    this.carrito.subtotal = $carrito;

  }
  updatePrecio($precio, $cantidad): string {
    const subtotal = $precio * $cantidad;
    return this.corregirPrecio(subtotal);
  }
  formatMoney(n, c = undefined, d = undefined, t = undefined) {
      let s, i, j;
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
          text: this.datostransporte.form.nombreTransporte
        };
        this.entrega.transporte.lista.push(temp_transporte);
        this.initialLista = [temp_transporte];
        this.refreshTransporte(temp_transporte);
      }).catch((error) => {
        Object.values(error.error.response).forEach($error_item => this.datos_envio_error += $error_item);
      });
      // this.transaccion.cambio(2)
    }else {
      this.datostransporte.update().then((response) => {
        this.datos_envio_error = '';
        this.editingEnvio = false;
      }).catch((error) => {
        if (error.error) {
          Object.values(error.error.response).forEach($error_item => this.datos_envio_error += $error_item);
        } else {
          this.datos_envio_error = 'Hubo un problema en la carga de los datos, aguarde un momento y vuelva a intentar.';
        }
    });

    }
  }
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  carritoLoading: boolean = false;


  async printAll() {
    this.transaccion.cambio(1);
}

  // Finalizar Compra
  finalizarCompra() {
    if(this.carrito.lista.length) {
      
      // this.carritoLoading = true;
      this.modalLoading = true;

      const body = new URLSearchParams();
      let array = [];
      for(let item of this.carrito.lista) {
        array.push({id_producto: item.id, cantidad: item.cantidad});
      }
      body.set('lista', JSON.stringify(array));

      this.auth.post('carrito/update_cantidades', body)
      .then($response => {
        this.data.log('response carritoupdatecantidades compra', $response);
        if(this.carrito.subtotal < this.config.montoEnvio) {
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
      .catch($error => {
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
    entrega_sabado:    false
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
      .then($response => {
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
    this.data.changeMessage(msg.cantidad ? msg.cantidad : 1, msg.titulo, precio, precio * (+msg.cantidad), msg.id, msg.codInterno, msg.categorias.length > 0 ? msg.categorias[0].nombre : '');
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

    if(this.editingEnvio) {
      setTimeout(() => {
        if (this.datos_envio.cod_transporte) {
          this.seleccionartransporte(this.ngSelectTransporte, this.datos_envio.cod_transporte);
        }
      }, 500);
    }
  }
}
