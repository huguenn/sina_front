import { Component, OnInit, HostListener, Input, ViewChild} from '@angular/core';
import { SharedService, cliente } from "../shared.service";
import { Dato } from "../shared.service";
import { OnChanges } from '@angular/core/src/metadata/lifecycle_hooks';
import { PopoverModule, PopoverContent, Popover } from "ngx-popover";
import { CompraItem, Carrito, Link, MenuItem, MenuSection } from "../data";

import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AutenticacionService } from '../autenticacion.service';
import { element } from 'protractor';
import { link } from 'fs';
import { Router } from '@angular/router';
import { MenuService } from '../menu.service';


const COMPRA: Carrito = {
  fecha: "hoy",
  list: [
    {texto: "Escobas", url: "", precio:"19,90"},
    {texto: "Escobas", url: "", precio:"19,90"},
    {texto: "Escobas", url: "", precio:"19,90"},
    {texto: "Escobas", url: "", precio:"19,90"},
    {texto: "Escobas", url: "", precio:"19,90"},
    {texto: "Escobas", url: "", precio:"19,90"},
    {texto: "Escobas", url: "", precio:"19,90"},
    {texto: "Escobas", url: "", precio:"19,90"}
  ]
}

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnChanges {
  @Input() greetMessage: Dato[] 
  @Input() headerStatus: Number

  menuToggle = false;
  CompraList = COMPRA;
  LinkList  = []; 
  MenuFilter = "/filter"
  MenuList  = [];
  MenuTitle = "Limpieza"
  MenuClass = 'header__filter--hover'
  headerPosition = ''
  SideState =     'menuSidebar'
  SideStateIcon = ''
  UserLog = false
  carritoStatus = false
  SearchFocus = ""
  SearchModel = ""
  resultados: any
  //user Data
  UserName:string
  UserJob:string
  
  menuSelectedItem = 0

  popup = {
    cuenta: false,
    compra: false
  }
  popup2 = {
    cuenta: false,
    compra: false
  }
  message:string;

  selectedItem = undefined
  selectItem($item){
    if(this.selectedItem) {
      this.selectedItem.show = false
    }
    this.selectedItem = $item
    this.selectedItem.show = true
  }


  cuenta = [
    { texto: "Mi cuenta", id: 0 },
    { texto: "Mis datos", id: 1 },
    { texto: "Mis frecuentes", id: 2 },
    { texto: "Ultimas compras", id: 3 },
    { texto: "Cerrar sesión", id: 4 }
  ]
  texto_busqueda:string = ""
  ResultadoBusqueda: any
  enterBusqueda(event) {
    if(event.keyCode == 13) {
      this.router.navigate(["/busqueda/" + this.texto_busqueda])
      this.cerrarBusqueda()
    }
  }  
  clickBusqueda(item) {
    const ruta = "/articulo/" + (item.categoria ? item.categoria.nombre.split(' ').join('-').toUpperCase() : '') + "/" + item['id']
    this.router.navigate([ruta])
    this.cerrarBusqueda()

  }
  buscarPalabra(event) {
    if(event.target.value.length >= 3) {
      let body = new URLSearchParams();
      body.set("frase", this.texto_busqueda);
      this.auth.post('producto/busqueda',body)
      .then($response => {
          this.ResultadoBusqueda = $response.body.response.slice(0,6)
      })
      .catch($error => {
        console.log($error)
      })  
    }
  }
  cerrarBusqueda() {
    this.ResultadoBusqueda = []
  }
  constructor(private menu: MenuService, private router: Router, private data: SharedService, private auth: AutenticacionService) { 
    this.MenuClass = '';
    this.menu.notifyObservable$.subscribe($cambio => {
      if($cambio) {
        this.closeCompra()
      }
    })
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
    //subscribing to data on carritoStatus
    this.data.currentCarrito.subscribe(
      status => {
        this.carritoStatus = status
        if( (this.headerStatus > 90 && window.innerWidth > 960) ||
        (this.headerStatus > 0  && window.innerWidth <= 960) )
          this.popup.compra = status
        else
          this.popup2.compra = status
      }
    )
    //subscribing to data on carritoStatus
    this.data.currentLogin.subscribe(
      status => {
        this.UserLog = status
        try {
          this.UserName = this.data.user.razonSocial
          this.UserJob  = this.data.user.categoriaIva
          this.representado = JSON.parse(localStorage.getItem("login")).administrativo
        }catch(e){}
      }
    )
    this.data.currentUser.subscribe($user => {
      try {
        console.log("user viejo", this.data.user.razonSocial)
        this.UserName = $user["razonSocial"]
        this.UserJob  = $user["categoriaIva"]
      }catch(e){
        console.log("error", e)
      }
    })
    
  }
  representado: boolean = false
  //auxiliar value
  lastInput: Boolean = false
  ngOnChanges() {
    if( (this.headerStatus > 90 && window.innerWidth > 960) ||
        (this.headerStatus > 0  && window.innerWidth <= 960) 
      ){
      this.headerPosition = 'header--fixed';
      if(this.popup.cuenta){
        this.popup2.cuenta = true        
      }
      if(this.popup.compra){
        this.popup2.compra = true        
      }
      this.popup.cuenta = false
      this.popup.compra = false
    }else{
      if(this.popup2.cuenta){
        this.popup.cuenta = true        
      }
      if(this.popup2.compra){
        this.popup.compra = true        
      }
      this.headerPosition = '';
      this.popup2.cuenta = false
      this.popup2.compra = false
    }
  }
  actualIndex:number = 0
  changeStyle($event, itemIndex){
    this.actualIndex = itemIndex

    if(window.innerWidth > 960) {
      this.MenuClass = $event.type == 'mouseover' ? 'header__filter--hover' : '';
      if(this.actualIndex >= 0){
        this.MenuList   = this.LinkList[this.actualIndex].links;      
        this.MenuTitle  = this.LinkList[this.actualIndex].texto;        
      }
    }
  }
  changeStyleMenu($event, itemIndex){
    if(window.innerWidth > 960) {
      this.MenuClass = $event.type == 'mouseover' ? 'header__filter--hover' : '';
      if(itemIndex >= 0){
        this.MenuList   = this.LinkList[this.actualIndex].links;      
        this.MenuTitle  = this.LinkList[this.actualIndex].texto;        
      }else{
        this.MenuList = undefined;           
      }
    }
  }
  changeStyleClick(itemIndex){
    if(window.innerWidth >  960) {
        this.MenuList   = this.LinkList[itemIndex].links;      
        this.MenuTitle  = this.LinkList[itemIndex].texto;   
        this.MenuClass = this.menuToggle === false ? 'header__filter--hover' : '';
      }else {
    }

  }    
  itemClicked(){
    this.MenuClass = '';  
  }
  closeCompra() {
    this.popup.compra = false
    this.popup2.compra = false
    this.popup.cuenta = false
    this.popup2.cuenta = false
  }
  toggle(component){
    if(this.UserLog){
      if(component === 'cuenta'){
        this.popup.cuenta = !this.popup.cuenta
        this.popup.compra = false
      }else{
        this.popup.compra = !this.popup.compra
        this.popup.cuenta = false
      }
    }else{
      this.data.toggleLoginModal()
    }
  }
  toggle2(component){
    if(this.UserLog){
      if(component === 'cuenta'){
        this.popup2.cuenta = !this.popup2.cuenta
        this.popup2.compra = false
      }else{
        this.popup2.compra = !this.popup2.compra
        this.popup2.cuenta = false
      }
    }else{
      this.data.toggleLoginModal()
    }
  }
  toggleMenu() {
    this.data.toggleSideBar();    
  }
  removeMessage(msg){
    this.data.removeMessage(msg);    
  }
  listFilter($array){
    if($array.length > 8)
      return $array.slice($array.length - 8, $array.length)
    else
      return $array
  }
  focusFunction() {
    this.SearchFocus = "onSearchFocus"
  }
  focusclickFunction() {
      this.SearchFocus = "onSearchFocus"
  }
  focusoutFunction() {
    setTimeout(() => {
      this.SearchFocus = ""
      this.cerrarBusqueda()
    }, 1000);
  }
  updatePrecio($precio, $cantidad):string {
    var subtotal = $precio * $cantidad 
    return this.formatMoney(subtotal)
  }
  formatMoney(n, c = undefined, d = undefined, t = undefined) {
    var c = isNaN(c = Math.abs(c)) ? 2 : c,
      d = d == undefined ? "," : d,
      t = t == undefined ? "." : t,
      s = n < 0 ? "-" : "",
      i = String(parseInt(n = Math.abs(Number(n) || 0).toFixed(c))),
      j = (j = i.length) > 3 ? j % 3 : 0;
  
    return s + (j ? i.substr(0, j) + t : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) + (c ? d + Math.abs(n - +i).toFixed(c).slice(2) : "");
  };  
}