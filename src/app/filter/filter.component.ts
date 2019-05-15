import { Component, OnInit } from '@angular/core';
import { SharedService } from "../shared.service";
import { AutenticacionService } from "../autenticacion.service";
import { FilterSection} from "../data";
import { Subject } from 'rxjs/Subject';
import { debounceTime } from 'rxjs/operator/debounceTime';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';

const Filter1: FilterSection[] = [
  //first query result
  new FilterSection(
    { 
      texto:  "Marca",
      link:   "link",
    },
    [
      { 
        texto:  "Sina",
        link:   "link",
        id: 1
      },
      { 
        texto:  "Vileda",
        link:   "link",
        id: 2
      }
    ]
  ),
  new FilterSection(
    { 
      texto:  "Uso",
      link:   "link",
    },
    [
      { 
        texto:  "Profesional",
        link:   "link",
        id: 1
      },
      { 
        texto:  "Domestico",
        link:   "link",
        id: 2
      }
    ]
  )
]

@Component({
  selector: 'app-filter',
  templateUrl: './filter.component.html',
  styleUrls: ['./filter.component.css']
})
export class FilterComponent implements OnInit {
  private _success = new Subject<string>();
  public iva_usuario: string = ""
  loginStatus:    boolean = false
  successMessage: string;
  staticAlertClosed = false;
  listaResultados;  
  FilterItem = undefined;
  term = ""
  categoriaPadre = undefined
  categoriaHijo = undefined
  id_filtro = ""
  id_categoria = ""
  id_subcategoria = ""
  num_subcategoria = -1
  listado_subcategorias

  constructor(private auth: AutenticacionService, private data: SharedService, private http: HttpClient, private route: ActivatedRoute) { }
  ngOnInit() {
    this.data.currentUser.subscribe($user => {
      if ($user) {
        switch($user["codCategoriaIva"]) {
          case "CF": 
          case "INR": 
          case "RSS": this.iva_usuario = "LOS PRECIOS UNITARIOS DETALLADOS INCLUYEN IVA"; break;
          case "RI":
          case "EX":
          case "PCE":
          case "PCS":
          case "EXE":
          case "SNC":
          default: this.iva_usuario = "LOS PRECIOS UNITARIOS DETALLADOS NO INCLUYEN IVA"
        }
      }
    })

    let num_filtro
    let num_categoria
    let listado
    this.route.params.subscribe(params => {
      let id = (params['id2'])
      let id2 = (params['id'])
      this.categoriaPadre = (params['padre'])? params['padre'].split('-').join(' ') : ""
      this.categoriaHijo = id2 ? id2.split('-').join(' ') : ""
      this.http.get('assets/data/resultadosFilter.json')
      .subscribe(res => {
        this.listaResultados = res["Resultados"];
        let url_consulta = this.loginStatus ? "": "public/"
        new Promise((resolve, reject) => {
          if(!id2) {
            url_consulta += (window.location.href.indexOf("ofertas") !== -1) ? "producto/listado/ofertas/" :
            (window.location.href.indexOf("novedades") !== -1) ? "producto/listado/novedades" : ""
            this.categoriaHijo = (window.location.href.indexOf("ofertas") !== -1) ? "OFERTAS" : "NOVEDADES"
            this.auth.get(url_consulta)
              .then($res => resolve($res.response)).catch($error => reject($error))
          } else if(id) {
            this.data.updatePageTitle(this.categoriaPadre + (this.categoriaPadre ? ", " : "") + this.categoriaHijo + " | Sina", 'Mayorista y distribuidora de '+ this.categoriaHijo ? this.categoriaHijo : this.categoriaPadre +' con entrega a todo el país, hacé tu pedido online!')
              this.auth.get(url_consulta + "producto/categoria/" + (+id))
                .then($res => resolve($res.response)).catch($error => reject($error))

              this.http.get(this.auth.getPath("public/producto/categorias/getAll"))
                .subscribe(($response: any)  =>{
                  listado = $response.response
                  let $categoria, $subcategoria
                  if(this.categoriaHijo && this.categoriaPadre) {
                    $subcategoria  = this.categoriaHijo
                    $categoria     = this.categoriaPadre
                  } else if(this.categoriaHijo) {
                    $categoria     = this.categoriaHijo
                  } 
                    for (const filtro_id in listado) {
                      if (listado.hasOwnProperty(filtro_id)) {
                        const filtro = listado[filtro_id]
                        for (const categoria_id in filtro) {
                          if (filtro.hasOwnProperty(categoria_id)) {
                            filtro[categoria_id].nombre_categoria = categoria_id.toUpperCase()
                            filtro[categoria_id].nombre_filtro    = filtro_id.toUpperCase()
                            const categoria = filtro[categoria_id];
                            if(categoria.nombre_categoria === $categoria) {
                              this.id_categoria = categoria.nombre_categoria
                              this.id_filtro = categoria.nombre_filtro
                              num_categoria = categoria_id
                              num_filtro = filtro_id
                            }
                            for (const subcategoria_id in categoria.categoriasHijas) {
                              if (categoria.categoriasHijas.hasOwnProperty(subcategoria_id)) {
                                categoria.categoriasHijas[subcategoria_id].nombre_subcategoria   = categoria.categoriasHijas[subcategoria_id].nombre.toUpperCase()
                                const subcategoria = categoria.categoriasHijas[subcategoria_id];
                                if(subcategoria.nombre_subcategoria === $subcategoria) {
                                  this.id_subcategoria = subcategoria.nombre_subcategoria
                                  this.num_subcategoria = parseInt(subcategoria_id)
                                  this.listado_subcategorias = categoria.categoriasHijas
                                }
    
                              }
                            }
                          }
                        }
                      }
                    }
                },$error => {
                  console.log("header error: ", $error)
                })
            
          } else{
            if(window.location.href.includes("busqueda")) {
              let body = new URLSearchParams();
              body.set("frase", id2);  
              this.auth.post(url_consulta + "producto/busqueda/", body)
                .then($res => resolve($res.body.response)).catch($error => reject($error))
            }
          }
        }).then(($response)  =>{
          this.listaResultados = $response
          this.paginado.init()
        })
        .catch($error => {
          this.listaResultados = []
          console.log($error)
        })
      });
    })
    //subscribing to data on loginStatus
    this.data.currentLogin.subscribe(
      status => {
        this.loginStatus = status
      }
    )
    
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

  itemFilterClick(index){
    this.FilterItem[index].head.state = this.FilterItem[index].head.state ? false : true;
  }
  selectItemClick(section, item){
    this.FilterItem[section].head.selected      = this.FilterItem[section].items[item].id;
    this.FilterItem[section].head.selectedText  = this.FilterItem[section].items[item].texto;
    this.term = this.FilterItem[section].items[item].texto;
  }
  itemFilterRemoveClick(index){
    this.FilterItem[index].head.state    = false;
    this.FilterItem[index].head.selected = 0;  
    this.term = "";
  }
  newMessage(msg) {
    if(this.loginStatus === true) {
      if(msg.cantidad){
        if(msg.cantidad % msg.indice === 0 &&  msg.cantidad > msg.minimo){
          msg.comprado = true;
          this.data.changeMessage(msg.cantidad ? msg.cantidad : 1, msg.texto1, msg.precio, msg.precio, msg.id);
          this._success.next(`Agregado al Carrito!`);      
        }else{
          msg["incompleto"] = true;
        }
      }
    }else {
      this.data.toggleLoginModal()
    }
  }

  removeMessage(msg){
    if(this.loginStatus === true) {
      this.data.removeMessage(msg);    
      msg.comprado = false;
    }else {
      this.data.toggleLoginModal()
    }
  }

  paginado = {
    cantidad: 20,
    pagina: 0,
    maximo: 0,
    original: [],
    init: () => {
      this.paginado.pagina = 1
      this.paginado.maximo = Math.trunc(this.listaResultados.length / this.paginado.cantidad)
      if(this.listaResultados.length % this.paginado.cantidad) {
        this.paginado.maximo++
      }
      this.paginado.original = this.listaResultados
      this.listaResultados = this.paginado.original.slice(0, this.paginado.cantidad)
    },
    disable: () => {
      this.listaResultados = this.paginado.original.slice(0, this.paginado.original.length)
    },
    actualizar: () => {
      this.listaResultados = this.paginado.original.slice(this.paginado.cantidad*(this.paginado.pagina - 1), this.paginado.cantidad*this.paginado.pagina)
    },
    siguiente: ()=> {
      this.paginado.pagina < this.paginado.maximo ? this.paginado.pagina ++ : this.paginado.maximo
      this.paginado.actualizar()
    },
    anterior: () => {
      this.paginado.pagina > 1 ? this.paginado.pagina -- : 1
      this.paginado.actualizar()
    }
  }

  modoVista: string = "Paginado"
  cambiarVista($vista) {
    this.modoVista = $vista
    if($vista === "Paginado") {
      this.paginado.actualizar()
    }else {
      this.paginado.disable()
    }
  }
}
