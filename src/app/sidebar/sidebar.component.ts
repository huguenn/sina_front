import { Component, OnInit } from '@angular/core';
import { SharedService } from "../shared.service";
import { ViewChild, ElementRef } from "@angular/core"
import { HttpClient } from '@angular/common/http';
import { AutenticacionService } from '../autenticacion.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {
  LinkList  = []
  MenuList  = []
  LinkIndex = 0
  LinkIndexHija = 0
  UserLog   : boolean
  SideStateIcon: boolean
  UserName: any;
  UserJob: any;

  constructor(private router: Router, private data: SharedService, private http:HttpClient, private auth: AutenticacionService) { 
    this.http.get('assets/data/links.json')
    .subscribe(res => {
      this.LinkList = res["links"];
      this.MenuList = this.LinkList[0].links;
      this.http.get(this.auth.getPath("public/producto/categorias/getAll"))
      .subscribe(($response)  =>{
        this.LinkList.forEach((categoria, indexCat, array) => {
          let categorias = []
          const links = $response["response"][categoria.texto.toUpperCase()]
          if(links) {
            for (const sub_link in links) {
              if (links.hasOwnProperty(sub_link)) {
                let subcategoria = links[sub_link];
                subcategoria["padre"] = {
                  nombre: sub_link
                }
                const indice = categorias.push({show: false, head: {texto: subcategoria.padre.nombre, link: this.convertLink(subcategoria.padre)}, items: []}) - 1
                if(subcategoria.categoriasHijas) {
                  for (const hija in subcategoria.categoriasHijas) {
                    if (subcategoria.categoriasHijas.hasOwnProperty(hija)) {
                      const categoriaHija = subcategoria.categoriasHijas[hija];
                      if(categoriaHija.nombre) {
                        categorias[indice].items.push({texto: categoriaHija.nombre, link: this.convertLink2(subcategoria.padre, categoriaHija)})
                      } else {
                        console.log("categoria hija sin nombre", categoriaHija)
                      }
                    }
                  }
                  //Agrego el "VER TODO" al listado
                  categorias[indice].items.push({texto: "VER TODO", link: this.convertLink(subcategoria.padre)});
                }
              }
            }
          }
          array[indexCat].links = categorias
        })
      },$error => {
        console.log("header error: ", $error)
      }) 
    });
  }
  ngOnInit() {
        //subscribing to data on carritoStatus
        this.data.currentLogin.subscribe(
          status => {
            this.UserLog = status
            try {
              this.UserName = this.data.user.nombreFantasia
              this.UserJob  = this.data.user.categoriaIva
            }catch(e){}
          }
        )    
  }
  convertLink= ($subcategoria) => {
    try{
      const texto = $subcategoria.nombre.split(' ').join('-').toUpperCase() + "/" + $subcategoria.id
      return texto
    } catch($error) {
      console.log("Alguno de los datos de la subcategoria esta incompleto")
      return ""
    }
  }
  convertLink2= ($categoria, $subcategoria) => {
    try{
      const texto = $categoria.nombre.split(' ').join('-').toUpperCase()  + "/" +  $subcategoria.nombre.split(' ').join('-').toUpperCase() + "/" + $subcategoria.id
      return texto
    } catch($error) {
      console.log("Alguno de los datos de la subcategoria esta incompleto")
      return ""
    }
  }

  toggleMenu() {
    this.data.toggleSideBar();    
  }
  changeStyleClick($index){
    if(this.LinkIndex !== $index)
      this.LinkIndex = $index
    else
      this.LinkIndex = 0
  }
  changeStyleClickHija($index, $seccion){
    if($seccion.items.length) {
      if(this.LinkIndexHija !== $index)
        this.LinkIndexHija = $index
      else
        this.LinkIndexHija = 0
    } else {
      this.data.toggleSideBar()
    }
  }
  closeHija() {
    this.LinkIndexHija = 0
  }
  registrar() {
    this.data.toggleLoginModal()
    this.data.toggleSideBar()
  }
  toggleSideBar() {
    this.data.toggleSideBar()
  }

}
