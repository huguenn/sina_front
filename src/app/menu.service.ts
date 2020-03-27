import { Injectable, Inject } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AutenticacionService } from './autenticacion.service';
import { SharedService } from './shared.service';

@Injectable()
export class MenuService {
  private notify = new Subject<any>();
  notifyObservable$ = this.notify.asObservable();

  public LinkList = [];
  private LinkListSubject = new Subject<any>();
  public  LinkList$ = this.LinkListSubject.asObservable();

  private MenuListSubject = new Subject<any>();
  public  MenuList$ = this.MenuListSubject.asObservable();

  constructor(private http: HttpClient, private auth: AutenticacionService, private data: SharedService) {
    this.http.get('assets/data/links.json')
    .subscribe(res => {
      this.LinkList = res['links'];
        // this.LinkListSubject.next(this.LinkList)
        // this.MenuListSubject.next(this.LinkList[0].links)

        this.http.get(this.auth.getPath('public/producto/categorias/getAll'))
        .subscribe(($response)  => {
          this.LinkList.forEach((categoria, indexCat, array) => {
            const categorias = [];
            const links = $response['response'][categoria.texto.toUpperCase()];
            if (links) {
              for (const sub_link in links) {
                if (links.hasOwnProperty(sub_link)) {
                  const subcategoria = links[sub_link];
                  subcategoria['padre'] = {
                    nombre: sub_link,
                    id: subcategoria.id
                  };
                  const indice = categorias.push({show: false, head: {texto: subcategoria.padre.nombre, link: this.convertLink(subcategoria.padre)}, items: []}) - 1;
                  if (subcategoria.categoriasHijas) {
                    // Corto el array de las categorías hijas a máximo 5
                    // subcategoria.categoriasHijas = subcategoria.categoriasHijas.slice(0,5);

                    for (const hija in subcategoria.categoriasHijas) {
                      if (subcategoria.categoriasHijas.hasOwnProperty(hija)) {
                        const categoriaHija = subcategoria.categoriasHijas[hija];
                        if (categoriaHija.nombre) {
                          categorias[indice].items.push({texto: categoriaHija.nombre, link: this.convertLink2(subcategoria.padre, categoriaHija)});
                        } else {
                        this.data.log('getallcategorias categoria hija sin nombre menu:', categoriaHija);
                        }
                      }
                    }
                    // Agrego como categoría hija el VER MÁS que va a la categoría padre
                    // categorias[indice].items.push({texto: "VER MÁS...", link: this.convertLink(subcategoria.padre)});
                  }
                }
              }
            }
            array[indexCat].links = categorias;
          });
          this.LinkListSubject.next(this.LinkList);
        }, $error => {
        this.data.log('getallcategorias header error menu: ', $error);
        });
      });
  }

  public notifyOther(data: any) {
    if (data) {
      this.notify.next(data);
    }
  }

  convertLink= ($subcategoria) => {
    try {
      const texto = $subcategoria.nombre.split(' ').join('-').toUpperCase() + '/' + $subcategoria.id;
      return texto;
    } catch ($error) {
      this.data.log('convertirlink Alguno de los datos de la subcategoria esta incompleto menu');
      return '';
    }
  }
  convertLink2= ($categoria, $subcategoria) => {
    try {
      const texto = $categoria.nombre.split(' ').join('-').toUpperCase()  + '/' +  $subcategoria.nombre.split(' ').join('-').toUpperCase() + '/' + $subcategoria.id;
      return texto;
    } catch ($error) {
      this.data.log('convertirlink2 Alguno de los datos de la subcategoria esta incompleto menu');
      return '';
    }
  }
}
