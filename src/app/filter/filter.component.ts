import { Component, OnInit } from '@angular/core';
import { SharedService } from '../shared.service';
import { AutenticacionService } from '../autenticacion.service';
import { FilterSection} from '../data';
import { Subject } from 'rxjs/Subject';
import { debounceTime } from 'rxjs/operator/debounceTime';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { MenuService } from '../menu.service';

const Filter1: FilterSection[] = [
  // first query result
  new FilterSection(
    {
      texto:  'Marca',
      link:   'link',
    },
    [
      {
        texto:  'Sina',
        link:   'link',
        id: 1
      },
      {
        texto:  'Vileda',
        link:   'link',
        id: 2
      }
    ]
  ),
  new FilterSection(
    {
      texto:  'Uso',
      link:   'link',
    },
    [
      {
        texto:  'Profesional',
        link:   'link',
        id: 1
      },
      {
        texto:  'Domestico',
        link:   'link',
        id: 2
      }
    ]
  )
];

@Component({
  selector: 'app-filter',
  templateUrl: './filter.component.html',
  styleUrls: ['./filter.component.css']
})
export class FilterComponent implements OnInit {
  private _success = new Subject<string>();
  public iva_usuario: string = '';
  loginStatus:    boolean = false;
  successMessage: string;
  staticAlertClosed = false;
  listaResultados;
  FilterItem = undefined;
  term = '';
  categoriaPadre = undefined;
  categoriaHijo = undefined;
  id_filtro = '';
  id_categoria = undefined;
  id_subcategoria = '';
  num_subcategoria = -1;
  listado_subcategorias;
  mensaje: string;
  LinkList: Array<any>;
  constructor(
    private menu: MenuService,
    private auth: AutenticacionService,
    private data: SharedService,
    private http: HttpClient,
    private route: ActivatedRoute) { }
  ngOnDestroy() {
  }
  updateMenu(id, id2, padre) {
    this.categoriaPadre = (padre) ? padre.split('-').join(' ') : '';
    this.categoriaHijo = id2 ? id2.split('-').join(' ') : '';
    if (!id2) {
      this.categoriaHijo = (window.location.href.indexOf('ofertas') !== -1) ? 'OFERTAS' : 'NOVEDADES';
    } else if (id) {
      this.data.updatePageTitle(this.categoriaPadre + (this.categoriaPadre ? ', ' : '') + this.categoriaHijo +
        ' | Sina', 'Mayorista y distribuidora de ' + this.categoriaHijo ? this.categoriaHijo : this.categoriaPadre + ' con entrega a todo el país, hacé tu pedido online!');

      let $categoria, $subcategoria;
      if (this.categoriaHijo && this.categoriaPadre) {
        $subcategoria  = this.categoriaHijo;
        $categoria     = this.categoriaPadre;
      } else if (this.categoriaHijo) {
        $categoria     = this.categoriaHijo;
      }
      let itemActualMenu, itemActualMenuPadre, itemActualMenuHijo;
      let padreEncabezado = $categoria;
      if (padreEncabezado.includes('   ')) {
        padreEncabezado = padreEncabezado.split('   ').join(' - ');
      }
      this.LinkList.forEach(($item: any) => {
        let incluyeItem = false;
        $item.links.forEach(($item_padre) => {
          if (padreEncabezado === $item_padre.head.texto) {
            incluyeItem = true;
            itemActualMenuPadre = $item_padre;
          }
        });
        if (incluyeItem) {
          itemActualMenu = $item;
        }
      });
      if ($subcategoria && itemActualMenuPadre) {
        itemActualMenuHijo = itemActualMenuPadre.items.findIndex(($item_hijo: any) => {
          return $item_hijo.texto.toUpperCase() === $subcategoria;
        });
      }
      if (itemActualMenu) {
        this.id_filtro = itemActualMenu.texto.toUpperCase();
        this.id_categoria = itemActualMenuPadre.head;
        this.listado_subcategorias = itemActualMenuPadre.items;
        this.num_subcategoria = itemActualMenuHijo;
      }
    }
  }
  ngOnInit() {
    let num_filtro;
    let num_categoria;
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
    // subscribing to data on loginStatus
    this.route.params.subscribe(params => {
      if (this.menu.LinkList.length) {
        this.LinkList = this.menu.LinkList;
        this.updateMenu(params['id2'], params['id'], params['padre']);
      } else {
        this.menu.LinkList$.subscribe((LinkList) => {
          this.LinkList = LinkList;
          this.updateMenu(params['id2'], params['id'], params['padre']);
        });
      }
    });
    this.data.currentLogin.subscribe(
      status => {
        this.loginStatus = status;
        this.route.params.subscribe(params => {
          const id = (params['id2']);
          const id2 = (params['id']);

          let url_consulta = this.loginStatus ? '' : 'public/';
          this.mensaje = 'Cargando';
          new Promise((resolve, reject) => {
            if (!id2) {
              url_consulta += (window.location.href.indexOf('ofertas') !== -1) ? 'producto/listado/ofertas/' :
              (window.location.href.indexOf('novedades') !== -1) ? 'producto/listado/novedades' : '';
              this.auth.get(url_consulta)
                .then($res => resolve($res.response)).catch($error => reject($error));
            } else if (id) {
                this.auth.get(url_consulta + 'producto/categoria/' + (+id))
                  .then($res => {
                    resolve($res.response);
                  })
                  .catch($error => reject($error));
            } else {
              if (window.location.href.includes('busqueda')) {
                const body = new URLSearchParams();
                body.set('frase', id2);
                this.auth.post(url_consulta + 'producto/busqueda/', body)
                  .then($res => resolve($res.body.response)).catch($error => reject($error));
              }
            }
          }).then(($response)  => {
            this.listaResultados = $response;
            this.paginado.init();
            if (!this.listaResultados.length) {
              this.mensaje = 'No hay resultado para la consulta';
            } else {
              this.mensaje = '';
            }
          })
          .catch($error => {
            this.data.log('getlistadoofertas error filter', $error);
            this.listaResultados = [];
            this.mensaje = 'No hay resultado para la consulta';
          });
        });
      }
    );

    this.FilterItem = Filter1;
    this.FilterItem.forEach(element => {
      element.head.selected = 0;
      element.head.state    = false;
    });
    this.FilterItem[0].head.state = true;

    setTimeout(() => this.staticAlertClosed = true, 2000);
    this._success.subscribe((message) => this.successMessage = message);
    debounceTime.call(this._success, 2000).subscribe(() => this.successMessage = null);
  }

  itemFilterClick(index) {
    this.FilterItem[index].head.state = this.FilterItem[index].head.state ? false : true;
  }
  selectItemClick(section, item) {
    this.FilterItem[section].head.selected      = this.FilterItem[section].items[item].id;
    this.FilterItem[section].head.selectedText  = this.FilterItem[section].items[item].texto;
    this.term = this.FilterItem[section].items[item].texto;
  }
  itemFilterRemoveClick(index) {
    this.FilterItem[index].head.state    = false;
    this.FilterItem[index].head.selected = 0;
    this.term = '';
  }
  newMessage(msg) {
    if (this.loginStatus === true) {
      if (msg.cantidad) {
        if (msg.cantidad % msg.indice === 0 &&  msg.cantidad > msg.minimo) {
          msg.comprado = true;
          this.data.changeMessage(msg.cantidad ? msg.cantidad : 1, msg.texto1, msg.precio, msg.precio, msg.id);
          this._success.next(`Agregado al Carrito!`);
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
      this.data.removeMessage(msg);
      msg.comprado = false;
    }else {
      this.data.toggleLoginModal();
    }
  }

  paginado = {
    cantidad: 20,
    pagina: 0,
    maximo: 0,
    original: [],
    init: () => {
      this.paginado.pagina = 1;
      this.paginado.maximo = Math.trunc(this.listaResultados.length / this.paginado.cantidad);
      if (this.listaResultados.length % this.paginado.cantidad) {
        this.paginado.maximo++;
      }
      this.paginado.original = this.listaResultados;
      this.listaResultados = this.paginado.original.slice(0, this.paginado.cantidad);
    },
    disable: () => {
      this.listaResultados = this.paginado.original.slice(0, this.paginado.original.length);
    },
    actualizar: () => {
      this.listaResultados = this.paginado.original.slice(this.paginado.cantidad * (this.paginado.pagina - 1), this.paginado.cantidad * this.paginado.pagina);
    },
    siguiente: () => {
      this.paginado.pagina < this.paginado.maximo ? this.paginado.pagina ++ : this.paginado.maximo;
      this.paginado.actualizar();
    },
    anterior: () => {
      this.paginado.pagina > 1 ? this.paginado.pagina -- : 1;
      this.paginado.actualizar();
    }
  };

  modoVista: string = 'Paginado';
  cambiarVista($vista) {
    this.modoVista = $vista;
    if ($vista === 'Paginado') {
      this.paginado.actualizar();
    }else {
      this.paginado.disable();
    }
  }
}
