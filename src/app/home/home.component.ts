import { Component, OnInit } from '@angular/core';
import { SharedService } from '../shared.service';
import { Subject } from 'rxjs/Subject';
import { debounceTime } from 'rxjs/operator/debounceTime';
import { HttpClient } from '@angular/common/http';
import { DatabaseService } from '../database.service';
import 'rxjs/add/operator/map';
import { map } from 'rxjs/operators/map';
import { AutenticacionService } from '../autenticacion.service';
// componente del producto
import { ProductoItemComponent } from '../producto-item/producto-item.component';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  providers: [DatabaseService, ProductoItemComponent]
})
export class HomeComponent implements OnInit {
  private _success = new Subject<string>();
  public iva_usuario: string = '';
  staticAlertClosed = false;
  successMessage: string;
  loginStatus: boolean = false;
  listaResultados;
  listadoProductos = [];
  carousel__item: number = 0;
  carousel__max:  number = 0;
  public imageSources: string[] = [];
  message: string;
  UserLog: boolean;

  constructor(public data: SharedService, private http: HttpClient, private db: DatabaseService, private auth: AutenticacionService) {
    setInterval(() => {
      this.carousel__item = this.carousel__item < this.carousel__max - 1 ? this.carousel__item + 1 : 0;
    }, 4000);
    this.data.updatePageTitle();
  }
  mapOrder (array, order, key) {

    array.sort( function (a, b) {
      const A = a[key], B = b[key];

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
    this._success.subscribe((message) => this.successMessage = message);
    debounceTime.call(this._success, 5000).subscribe(() => this.successMessage = null);

    // subscribing to data on loginStatus
    this.data.currentLogin.subscribe(
      status => {
        this.loginStatus = status;
        // getting data via get request
        // TODO: Esto esta hardcodeado foerte o soy yo?
        this.http.get('assets/data/resultadosHome.json')
        .subscribe(res => {
          this.listaResultados = res['Resultados'];
          this.listaResultados[2].lista = [];
          const $public = this.loginStatus ? '' : 'public/';
          this.auth.get($public + 'producto/listado/ofertas')
          .then(($response)  => {
            const ofertas1 = $response.response.slice(0, 4);
            const ofertas2 = $response.response.slice(0, 2);
            this.listaResultados[0].lista = JSON.parse(JSON.stringify(ofertas1));
            this.listaResultados[2].lista.push(JSON.parse(JSON.stringify(ofertas2[0])));
            this.listaResultados[2].lista.push(JSON.parse(JSON.stringify(ofertas2[1])));
          })
          .catch($error => {
            this.data.log('getresultadoshome.json error home:', $error);
            this.auth.desacreditar();
            // TODO: Este reload me dejaba en loop infinito la web en el celular
            // window.location.reload()
          });
          this.auth.get($public + 'producto/listado/novedades')
          .then(($response)  => {
            const ofertas1 = $response.response.slice(0, 4);
            const ofertas2 = $response.response.slice(0, 2);
            this.listaResultados[1].lista = JSON.parse(JSON.stringify(ofertas1));
            this.listaResultados[2].lista.push(JSON.parse(JSON.stringify(ofertas2[0])));
            this.listaResultados[2].lista.push(JSON.parse(JSON.stringify(ofertas2[1])));
          })
          .catch($error => {
            this.data.log('getlistadonovedades error home:', $error);
          });

        });

      }
    );
    this.db.getCollectionFull('sliders').pipe(
      map((actions: any) => actions.map(a => {
        const data = a.payload.doc.data();
        const id = a.payload.doc.id;
        return { id, ...data };
      }))
    ).subscribe(algo => {
      let sliders = algo;
      this.db.getDocumentUser().subscribe(user => {
        this.imageSources = [];
        this.sliderOrder = user.sliderOrder;
        sliders = this.mapOrder(sliders, this.sliderOrder, 'id');
        sliders.forEach(element => {
          this.imageSources.push(element['img']);
        });
        this.carousel__max = sliders.length;
      });
    });
    this.data.currentUser.subscribe($user => {
      this.data.log('actualizacion de usuario home');
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

  }
  alertClicked() {
    this.successMessage = null;
    this.data.toggleCarritoShow();
  }
  registrar() {
    this.data.toggleLoginModal();
  }

  descargarLista() {
    (document.querySelector('#loaderFile') as HTMLElement).style.display = 'block';
    this.auth.get('producto/listadoProductos')
    .then(($response)  => {
      if ($response.response) {
        this.listadoProductos = $response.response;
        const print: any[] = [];
        print.push(['Código interno', 'Título + título adicional', 'Codigo de barras', 'Unidad de medida (presentacion)',
          'Precio', 'Familia', 'Categoria', 'SubCategoria', 'Oferta']);
        this.listadoProductos.forEach(producto => {
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
              producto.es_oferta
            ]
          );
        });

        const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(print);
        const wb: XLSX.WorkBook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Hoja 1');
        XLSX.writeFile(wb, 'Listado de productos.xlsx');
      }

      (document.querySelector('#loaderFile') as HTMLElement).style.display = 'none';

    })
    .catch($error => {
      this.data.log('descargarlista error home:', $error);
    });
  }
}
