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
  listaOriginal;
  FilterItem = undefined;
  term = '';
  categoriaPadre = undefined;
  categoriaHijo = undefined;
  id_filtro = '';
  id_categoria = [];
  id_subcategoria = '';
  num_subcategoria = -1;
  listado_subcategorias;
  mensaje: string;
  LinkList: Array<any>;
  public ordenamiento: string;
  constructor(
    private menu: MenuService,
    private auth: AutenticacionService,
    private data: SharedService,
    private http: HttpClient,
    private route: ActivatedRoute) { }
  ngOnDestroy() {
  }
  updateMenu(id, id2, padre) {
    this.ordenamiento = '';
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
          return $item_hijo.texto === $subcategoria;
        });
      }
      if (itemActualMenu) {
        this.id_filtro = itemActualMenu.texto;
        this.listado_subcategorias = itemActualMenuPadre.items;
        this.id_categoria = [];
        this.id_categoria.push({link: itemActualMenuPadre.head.link, texto:itemActualMenuPadre.head.texto,  listado_subcategorias: this.listado_subcategorias});
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
              const path = window.location.href;
              // url_consulta += (window.location.href.indexOf('ofertas') !== -1) ? 'producto/listado/ofertas/' :
              // (window.location.href.indexOf('novedades') !== -1) ? 'producto/listado/novedades' : '';
              if (path.indexOf('ofertas') !== -1) {
                url_consulta += 'producto/listado/ofertas/';
              } else if (path.indexOf('novedades') !== -1) {
                url_consulta += 'producto/listado/novedades';
              } else if (path.indexOf('Limpieza') !== -1) {
                url_consulta += 'producto/categoriapadre/Limpieza';
                this.id_filtro = 'Limpieza';
              } else if (path.indexOf('Bazar') !== -1) {
                url_consulta += 'producto/categoriapadre/Bazar';
                this.id_filtro = 'Bazar';
              } else if (path.indexOf('Textil') !== -1) {
                url_consulta += 'producto/categoriapadre/Textil';
                this.id_filtro = 'Textil';
              } else if (path.indexOf('Liquidos') !== -1) {
                url_consulta += 'producto/categoriapadre/Liquidos';
                this.id_filtro = 'Liquidos';
              } else if (path.indexOf('Jardin%20y%20riego') !== -1) {
                url_consulta += 'producto/categoriapadre/Jardin-y-riego';
                this.id_filtro = 'Jardin y riego';
              } else if (path.indexOf('Profesional') !== -1) {
                url_consulta += 'producto/categoriapadre/Profesional';
                this.id_filtro = 'Profesional';
              } else if (path.indexOf('Mas%20productos') !== -1) {
                url_consulta += 'producto/categoriapadre/Mas-productos';
                this.id_filtro = 'Mas productos';
              } else {
                url_consulta += '';
              }
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
            this.listaOriginal = $response;
            this.paginado.init();

            setTimeout(() => {

              const path = window.location.href;
              if (path.indexOf('Limpieza') !== -1 && this.LinkList) {
                this.modoVista = 'Paginado';
                this.num_subcategoria = -2;
                this.id_categoria = [];
                for(let subcat of this.LinkList[0].links) {
                  this.id_categoria.push({link: subcat.head.link, texto: subcat.head.texto, listado_subcategorias: subcat.items});
                }
              } else if (path.indexOf('Bazar') !== -1 && this.LinkList) {
                this.modoVista = 'Paginado';
                this.num_subcategoria = -2;
                this.id_categoria = [];
                for(let subcat of this.LinkList[1].links) {
                  this.id_categoria.push({link: subcat.head.link, texto: subcat.head.texto, listado_subcategorias: subcat.items});
                }
              } else if (path.indexOf('Textil') !== -1 && this.LinkList) {
                this.modoVista = 'Paginado';
                this.num_subcategoria = -2;
                this.id_categoria = [];
                for(let subcat of this.LinkList[2].links) {
                  this.id_categoria.push({link: subcat.head.link, texto: subcat.head.texto, listado_subcategorias: subcat.items});
                }
              } else if (path.indexOf('Liquidos') !== -1 && this.LinkList) {
                this.modoVista = 'Paginado';
                this.num_subcategoria = -2;
                this.id_categoria = [];
                for(let subcat of this.LinkList[3].links) {
                  this.id_categoria.push({link: subcat.head.link, texto: subcat.head.texto, listado_subcategorias: subcat.items});
                }
              } else if (path.indexOf('Jardin%20y%20riego') !== -1 && this.LinkList) {
                this.modoVista = 'Paginado';
                this.num_subcategoria = -2;
                this.id_categoria = [];
                for(let subcat of this.LinkList[4].links) {
                  this.id_categoria.push({link: subcat.head.link, texto: subcat.head.texto, listado_subcategorias: subcat.items});
                }
              } else if (path.indexOf('Profesional') !== -1 && this.LinkList) {
                this.modoVista = 'Paginado';
                this.num_subcategoria = -2;
                this.id_categoria = [];
                for(let subcat of this.LinkList[5].links) {
                  this.id_categoria.push({link: subcat.head.link, texto: subcat.head.texto, listado_subcategorias: subcat.items});
                }
              } else if (path.indexOf('Mas%20productos') !== -1 && this.LinkList) {
                this.modoVista = 'Paginado';
                this.num_subcategoria = -2;
                this.id_categoria = [];
                for(let subcat of this.LinkList[6].links) {
                  this.id_categoria.push({link: subcat.head.link, texto: subcat.head.texto, listado_subcategorias: subcat.items});
                }
              } else {
                this.paginado.disable(); // Para poner listado por default, en lugar de paginado
              }
              
              if (!this.listaResultados.length) {
                this.mensaje = 'No hay resultado para la consulta';
              } else {
                this.mensaje = '';
              }
            }, 1000)
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

    setTimeout(() => this.staticAlertClosed = true, 5000);
    this._success.subscribe((message) => this.successMessage = message);
    debounceTime.call(this._success, 5000).subscribe(() => this.successMessage = null);
  }

  alertClicked() {
    this.successMessage = null;
    this.data.toggleCarritoShow();
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
        if ((+msg.cantidad % +msg.cantPack === 0 &&  +msg.cantidad > +msg.cantMinima) || (+msg.cantMinima === +msg.cantidad)) {
          msg.comprado = true;
          this.data.changeMessage(msg.cantidad ? msg.cantidad : 1, msg.texto1, msg.precio, msg.precio, msg.id, msg.codInterno, msg.categorias.length > 0 ? msg.categorias[0].nombre : '');
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

  modoVista: string = 'Listado'; // Cambio default de Paginado a Listado
  cambiarVista($vista) {
    this.modoVista = $vista;
    if ($vista === 'Paginado') {
      this.paginado.actualizar();
    }else {
      this.paginado.disable();
    }
    if(this.ordenamiento && this.ordenamiento.startsWith('nombre')) {
      this.ordenPorNombre();
    }
    if(this.ordenamiento && this.ordenamiento.startsWith('precio')) {
      this.ordenPorPrecio();
    }
  }

  ordenPorNombre() {
    if(this.modoVista && this.modoVista === 'Paginado') {
      if(this.ordenamiento && this.ordenamiento === 'nombreDESCP') {
        this.ordenamiento = 'nombreASCP';
        this.paginado.original = this.listaOriginal.sort((a,b) => { if(a.titulo === b.titulo) {return 0;} else {return a.titulo < b.titulo ? 1:-1} });
        this.paginado.actualizar();
      }
      else {
        this.ordenamiento = 'nombreDESCP';
        this.paginado.original = this.listaOriginal.sort((a,b) => { if(a.titulo === b.titulo) {return 0;} else {return a.titulo > b.titulo ? 1:-1} });
        this.paginado.actualizar();
      }
    }
    if(this.modoVista && this.modoVista === 'Listado') {
      if(this.ordenamiento && this.ordenamiento === 'nombreDESCL') {
        this.ordenamiento = 'nombreASCL';
        this.listaResultados = this.listaResultados.sort((a,b) => { if(a.titulo === b.titulo) {return 0;} else {return a.titulo < b.titulo ? 1:-1} });
      }
      else {
        this.ordenamiento = 'nombreDESCL';
        this.listaResultados = this.listaResultados.sort((a,b) => { if(a.titulo === b.titulo) {return 0;} else {return a.titulo > b.titulo ? 1:-1} });
      }
    }
  }
  ordenPorPrecio() {
    if(this.modoVista && this.modoVista === 'Paginado') {
      if(this.ordenamiento && this.ordenamiento === 'precioDESCP') {
        this.ordenamiento = 'precioASCP';
        this.paginado.original = this.listaOriginal.sort((a,b) => { return b.precio - a.precio });
        this.paginado.actualizar();
      }
      else {
        this.ordenamiento = 'precioDESCP';
        this.paginado.original = this.listaOriginal.sort((a,b) => { return a.precio - b.precio });
        this.paginado.actualizar();
      }
    }
    if(this.modoVista && this.modoVista === 'Listado') {
      if(this.ordenamiento && this.ordenamiento === 'precioDESCL') {
        this.ordenamiento = 'precioASCL';
        this.listaResultados = this.listaResultados.sort((a,b) => { return b.precio - a.precio });
      }
      else {
        this.ordenamiento = 'precioDESCL';
        this.listaResultados = this.listaResultados.sort((a,b) => { return a.precio - b.precio });
      }
    }
  }
}
