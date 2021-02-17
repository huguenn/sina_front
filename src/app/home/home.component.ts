import { HttpClient } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import 'rxjs/add/operator/map';
import { debounceTime } from 'rxjs/operator/debounceTime';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs/Subject';
import { utils as XLSXutils, WorkBook, WorkSheet, writeFile as XLSXwrite } from 'xlsx';
import { AutenticacionService } from '../autenticacion.service';
// componente del producto
import { ProductoItemComponent } from '../producto-item/producto-item.component';
import { SharedService } from '../shared.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  providers: [ProductoItemComponent],
})
export class HomeComponent implements OnInit, OnDestroy {
  private destroy$: Subject<void> = new Subject<void>();
  private _success = new Subject<string>();
  public iva_usuario: string = '';
  staticAlertClosed = false;
  successMessage: string;
  loginStatus: boolean = false;
  listaResultados;
  listadoProductos = [];
  carousel__item: number = 0;
  carousel__max:  number = 0;
  public imageSources = [];
  message: string;
  UserLog: boolean;
  config: any;

  constructor(public data: SharedService, private http: HttpClient, private auth: AutenticacionService) {
    setInterval(() => {
      this.carousel__item = this.carousel__item < this.carousel__max - 1 ? this.carousel__item + 1 : 0;
    }, 6000);
    this.data.updatePageTitle();
  }
  mapOrder(array, order, key) {

    array.sort((a, b) => {
      const A = a[key];
      const B = b[key];

      if (order.indexOf(A) > order.indexOf(B)) {
        return 1;
      } else {
        return -1;
      }

    });

    return array;
  }
  sliderOrder = [];

  ngOnInit(): void {
    setTimeout(() => this.staticAlertClosed = true, 5000);
    this._success.pipe(takeUntil(this.destroy$)).subscribe((message) => this.successMessage = message);
    debounceTime.call(this._success, 5000).subscribe(() => this.successMessage = null);

    // subscribing to data on loginStatus
    this.data.currentLogin.pipe(takeUntil(this.destroy$)).subscribe(
      (status) => {
        this.loginStatus = status;
        // getting data via get request
        this.http.get('assets/data/resultadosHome.json')
        .pipe(takeUntil(this.destroy$)).subscribe((res) => {
          this.listaResultados = res['Resultados'];

          if (this.config) {
            this.listaResultados[0].head.texto = this.config.bannerOfertasTitulo;
            this.listaResultados[0].head.imagen = this.config.bannerOfertasImagen;
            this.listaResultados[1].head.texto = this.config.bannerNovedadesTitulo;
            this.listaResultados[1].head.imagen = this.config.bannerNovedadesImagen;
            this.listaResultados[2].head.texto = this.config.bannerCampaniasTitulo;
            this.listaResultados[2].head.imagen = this.config.bannerCampaniasImagen;
          }

          // this.listaResultados[2].lista = [];
          const $public = this.loginStatus ? '' : 'public/';
          this.auth.get($public + 'producto/listado/ofertas')
          .then(($response)  => {
            const ofertas1 = $response.response.slice(0, 4);
            // let ofertas2 = $response.response.slice(0, 2);
            this.listaResultados[0].lista = JSON.parse(JSON.stringify(ofertas1));
            // this.listaResultados[2].lista[0] = JSON.parse(JSON.stringify(ofertas2[0]));
            // this.listaResultados[2].lista[1] = JSON.parse(JSON.stringify(ofertas2[1]));

            if (this.config) {
              this.listaResultados[0].head.texto = this.config.bannerOfertasTitulo;
              this.listaResultados[0].head.imagen = this.config.bannerOfertasImagen;
              this.listaResultados[1].head.texto = this.config.bannerNovedadesTitulo;
              this.listaResultados[1].head.imagen = this.config.bannerNovedadesImagen;
              this.listaResultados[2].head.texto = this.config.bannerCampaniasTitulo;
              this.listaResultados[2].head.imagen = this.config.bannerCampaniasImagen;
            }
          })
          .catch(($error) => {
            this.data.log('getresultadoshome.json error home:', $error);
            this.auth.desacreditar();
            // TODO: Este reload me dejaba en loop infinito la web en el celular
            // window.location.reload()
          });
          this.auth.get($public + 'producto/listado/novedades')
          .then(($response)  => {
            const ofertas1 = $response.response.slice(0, 4);
            // const ofertas2 = $response.response.slice(0, 2);
            this.listaResultados[1].lista = JSON.parse(JSON.stringify(ofertas1));
            // this.listaResultados[2].lista[2] = JSON.parse(JSON.stringify(ofertas2[0]));
            // this.listaResultados[2].lista[3] = JSON.parse(JSON.stringify(ofertas2[1]));

            if (this.config) {
              this.listaResultados[0].head.texto = this.config.bannerOfertasTitulo;
              this.listaResultados[0].head.imagen = this.config.bannerOfertasImagen;
              this.listaResultados[1].head.texto = this.config.bannerNovedadesTitulo;
              this.listaResultados[1].head.imagen = this.config.bannerNovedadesImagen;
              this.listaResultados[2].head.texto = this.config.bannerCampaniasTitulo;
              this.listaResultados[2].head.imagen = this.config.bannerCampaniasImagen;
            }
          })
          .catch(($error) => {
            this.data.log('getlistadonovedades error home:', $error);
          });
          this.auth.get($public + 'producto/listado/campania')
          .then(($response)  => {
            const ofertas1 = $response.response.slice(0, 4);
            this.listaResultados[2].lista = JSON.parse(JSON.stringify(ofertas1));

            if (this.config) {
              this.listaResultados[0].head.texto = this.config.bannerOfertasTitulo;
              this.listaResultados[0].head.imagen = this.config.bannerOfertasImagen;
              this.listaResultados[1].head.texto = this.config.bannerNovedadesTitulo;
              this.listaResultados[1].head.imagen = this.config.bannerNovedadesImagen;
              this.listaResultados[2].head.texto = this.config.bannerCampaniasTitulo;
              this.listaResultados[2].head.imagen = this.config.bannerCampaniasImagen;
            }
          })
          .catch(($error) => {
            this.data.log('getlistadocampania error home:', $error);
          });

        });
      },
    );
    this.data.currentUser.pipe(takeUntil(this.destroy$)).subscribe(($user) => {
      this.data.log('actualizacion de usuario home');
      if ($user && $user['c'] === '1') {
        this.iva_usuario = 'LOS PRECIOS SON UNITARIOS Y ESTÁN SUJETOS A SU CONDICIÓN HABITUAL';
      } else {
        if ($user) {
          switch ($user['codCategoriaIva']) {
            case 'CF':
            case 'INR':
            case 'RSS':
            case 'RI': this.iva_usuario = 'LOS PRECIOS UNITARIOS DETALLADOS NO INCLUYEN IVA'; break;
            case 'EX':
            case 'PCE':
            case 'PCS':
            case 'EXE':
            case 'SNC':
            default: this.iva_usuario = 'LOS PRECIOS UNITARIOS DETALLADOS INCLUYEN IVA';
          }
        }
      }
    });

    // subscribing to config change
    this.data.currentConfig.pipe(takeUntil(this.destroy$)).subscribe(
      (configuracion) => {
        this.config = configuracion;

        if (this.config.bannerUnoActivo) {
          this.imageSources.push({imagen: this.config.bannerUnoImagen, link: this.config.bannerUnoLink});
        }
        if (this.config.bannerDosActivo) {
          this.imageSources.push({imagen: this.config.bannerDosImagen, link: this.config.bannerDosLink});
        }
        if (this.config.bannerTresActivo) {
          this.imageSources.push({imagen: this.config.bannerTresImagen, link: this.config.bannerTresLink});
        }
        if (this.config.bannerCuatroActivo) {
          this.imageSources.push({imagen: this.config.bannerCuatroImagen, link: this.config.bannerCuatroLink});
        }
        if (this.config.bannerCincoActivo) {
          this.imageSources.push({imagen: this.config.bannerCincoImagen, link: this.config.bannerCincoLink});
        }
        if (this.config.bannerSeisActivo) {
          this.imageSources.push({imagen: this.config.bannerSeisImagen, link: this.config.bannerSeisLink});
        }
        this.carousel__max = this.imageSources.length;
      },
    );

  }

  ngOnDestroy() {
    this.destroy$.next();
  }

  alertClicked() {
    this.successMessage = null;
    this.data.toggleCarritoShow();
  }
  registrar() {
    if (!this.loginStatus) {
      this.data.toggleLoginModal();
    }
  }

  descargarLista() {
    if (this.loginStatus) {
      (document.querySelector('#loaderFile') as HTMLElement).style.display = 'block';
      (document.querySelector('#loaderFileMsg') as HTMLElement).style.display = 'block';
      this.auth.get('producto/listadoProductos')
      .then(($response)  => {
        if ($response.response) {
          this.listadoProductos = $response.response;
          const print: any[] = [];
          print.push(['Código interno', 'Título + título adicional', 'Codigo de barras', 'Unidad de medida (presentacion)',
            'Precio', 'Familia', 'Categoria', 'SubCategoria', 'Oferta']);
          this.listadoProductos.forEach((producto) => {
            print.push
            (
              [
                producto.codigo_interno,
                producto.nombre + ' - ' + producto.nombre_adicional,
                producto.codigo_barras,
                producto.unidad_medida,
                producto.precio,
                producto.familia,
                producto.categoria,
                producto.subcategoria,
                producto.es_oferta,
              ],
            );
          });

          const ws: WorkSheet = XLSXutils.aoa_to_sheet(print);
          const wb: WorkBook = XLSXutils.book_new();
          XLSXutils.book_append_sheet(wb, ws, 'Hoja 1');
          XLSXwrite(wb, 'Listado de productos.xlsx');
        }

        (document.querySelector('#loaderFile') as HTMLElement).style.display = 'none';
        (document.querySelector('#loaderFileMsg') as HTMLElement).style.display = 'none';

      })
      .catch(($error) => {
        this.data.log('descargarlista error home:', $error);
      });
    } else {
      this.data.toggleLoginModal();
    }
  }
}
