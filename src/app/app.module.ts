import { BrowserModule }    from '@angular/platform-browser';
import { NgModule }         from '@angular/core';

import { AppComponent }     from './app.component';
import { HeaderComponent }  from './header/header.component';
import { HomeComponent }    from './home/home.component';
import { RouterModule, Routes } from '@angular/router';
import { PopoverModule } from "ngx-popover";
import { NgxGalleryModule } from 'ngx-gallery';
import { NgxMyDatePickerModule } from 'ngx-mydatepicker';
import { SharedService } from "../app/shared.service";
import { AutenticacionService } from "./autenticacion.service"
import { MenuService } from './menu.service';
import { FormsModule } from '@angular/forms'
import { HttpModule }      from '@angular/http';
import { HttpClientModule }      from '@angular/common/http';
import { SidebarModule } from 'ng-sidebar';
import { SelectModule } from 'ng2-select';


//bootstrap
import { NgbModule }          from '@ng-bootstrap/ng-bootstrap';
import { FooterComponent } from './footer/footer.component';
import { FilterComponent } from './filter/filter.component';
import { ProductoComponent } from './producto/producto.component';
import { CuentaComponent } from './cuenta/cuenta.component';
import { CompraComponent } from './compra/compra.component';
import { FilterPipe } from './filter.pipe';
import { MyFilterPipe } from './my-filter.pipe';
import { BusquedaCuentaPipe } from './app.component';
import { SidebarComponent } from './sidebar/sidebar.component';

//firebase
import { AngularFireModule } from 'angularfire2';
import { environment } from '../environments/environment';
import { AngularFirestoreModule } from 'angularfire2/firestore';
import { ProductoItemComponent } from './producto-item/producto-item.component';
import { ConfirmacionComponent } from './confirmacion/confirmacion.component';
import { ShareButtonsModule } from 'ngx-sharebuttons';
import { ComoComprarComponent } from './como-comprar/como-comprar.component';
import { EnviosComponent } from './envios/envios.component';
import { NosotrosComponent } from './nosotros/nosotros.component';
import { ContactoComponent } from './contacto/contacto.component';
import { RecuperarPassComponent } from './recuperar-pass/recuperar-pass.component';

// router config
const appRoutes: Routes = [
  { 
    path: '',    
    component: HomeComponent 
  },
  { 
    path: 'home', 
    component: HomeComponent 
  },
  {
    path: 'confirmacion',
    component: ConfirmacionComponent,
    data: { id: 1 }
  },
  {
    path: 'recuperar_contrasena',
    component: RecuperarPassComponent,
    data: { id: 1 }
  },
  {
    path: 'como-comprar',
    component: ComoComprarComponent
  },
  {
    path: 'contacto',
    component: ContactoComponent
  },
  {
    path: 'envios',
    component: EnviosComponent
  },
  {
    path: 'nosotros',
    component: NosotrosComponent
  },
  {
    path: 'busqueda/:id',
    component: FilterComponent
  },
  {
    path: ':id/:id2',
    component: FilterComponent,
    data: { title: 'Other text' }
  },
  {
    path: ':padre/:id/:id2',
    component: FilterComponent,
    data: { title: 'Other text' }
  },
  {
    path: 'ofertas',
    component: FilterComponent,
    data: { title: 'Other text' }
  },
  {
    path: 'novedades',
    component: FilterComponent,
    data: { title: 'Other text' }
  },
  {
    path: ':algo/:algo2/:id/:id2',
    component: ProductoComponent
  },
  {
    path: 'cuenta',
    component: CuentaComponent,
    data: { id: 1 }
  },
  {
    path: 'compra',
    component: CompraComponent,
    data: { id: 1 },
  },
  { path: '',
    redirectTo: '/heroes',
    pathMatch: 'full'
  },
  { path: '**', component: FilterComponent }
];


@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    HomeComponent,
    FooterComponent,
    FilterComponent,
    ProductoComponent, 
    MyFilterPipe,
    CuentaComponent,
    CompraComponent,
    FilterPipe,
    BusquedaCuentaPipe,
    SidebarComponent,
    ProductoItemComponent,
    ConfirmacionComponent,
    ComoComprarComponent,
    EnviosComponent,
    NosotrosComponent,
    ContactoComponent,
    RecuperarPassComponent
  ],
  imports: [
    AngularFireModule.initializeApp(environment.firebase),
    AngularFirestoreModule,
    SelectModule,
    FormsModule,
    PopoverModule,
    NgbModule.forRoot(),
    RouterModule.forRoot(
      appRoutes,
      { enableTracing: false } // <-- debugging purposes only
    ),
    NgxMyDatePickerModule.forRoot(),
    SidebarModule.forRoot(),
    NgxGalleryModule,
    BrowserModule,
    HttpClientModule,
    HttpModule,
    ShareButtonsModule.forRoot(),
  ],
  providers: [SharedService, AutenticacionService, MenuService],
  bootstrap: [AppComponent]
})
export class AppModule { }
