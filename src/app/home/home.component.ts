import { HttpClient } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import 'rxjs/add/operator/map';
import { debounceTime } from 'rxjs/operator/debounceTime';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs/Subject';
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
      for (const key in document.querySelectorAll('#loaderFile')) {
        if (Object.prototype.hasOwnProperty.call(document.querySelectorAll('#loaderFile'), key)) {
          const element = document.querySelectorAll('#loaderFile')[key];
          (element as HTMLElement).style.display = 'block';
        }
      }
      for (const key in document.querySelectorAll('#loaderFileMsg')) {
        if (Object.prototype.hasOwnProperty.call(document.querySelectorAll('#loaderFileMsg'), key)) {
          const element = document.querySelectorAll('#loaderFileMsg')[key];
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
        this.data.log('descargarlista error home:', $error);
      });
    } else {
      this.data.toggleLoginModal();
    }
  }
}
