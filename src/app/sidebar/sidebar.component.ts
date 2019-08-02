import { Component, OnInit } from '@angular/core';
import { SharedService } from "../shared.service";
import { ViewChild, ElementRef } from "@angular/core"
import { HttpClient } from '@angular/common/http';
import { AutenticacionService } from '../autenticacion.service';
import { Router } from '@angular/router';
import { MenuService } from '../menu.service';

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

  constructor(private menu: MenuService, private router: Router, private data: SharedService, private http:HttpClient, private auth: AutenticacionService) { 
    this.menu.LinkList$.subscribe(($cambio_link:any) => {
      if($cambio_link) {
        this.LinkList = $cambio_link
      }

    })
    this.menu.MenuList$.subscribe(($cambio_menu:any) => {
      if($cambio_menu) {
        this.MenuList = $cambio_menu
      }
    })
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
