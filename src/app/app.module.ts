import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { HeaderComponent } from './header/header.component';
import { HomeComponent } from './home/home.component';
import { RouterModule, Routes } from '@angular/router';
import { PopoverModule } from 'ngx-popover';
import { NgxGalleryModule } from 'ngx-gallery';
import { NgxMyDatePickerModule } from 'ngx-mydatepicker';
import { SharedService } from '../app/shared.service';
import { AutenticacionService } from './autenticacion.service';
import { MenuService } from './menu.service';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { HttpClientModule } from '@angular/common/http';
import { SidebarModule } from 'ng-sidebar';
import { NgSelectModule } from '@ng-select/ng-select';


// bootstrap
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FooterComponent } from './footer/footer.component';
import { FilterComponent } from './filter/filter.component';
import { ProductoComponent } from './producto/producto.component';
import { CuentaComponent } from './cuenta/cuenta.component';
import { CompraComponent } from './compra/compra.component';
import { FilterPipe } from './filter.pipe';
import { MyFilterPipe } from './my-filter.pipe';
import { BusquedaCuentaPipe } from './app.component';
import { SidebarComponent } from './sidebar/sidebar.component';

// firebase
// import { environment } from '../environments/environment';
import { ProductoItemComponent } from './producto-item/producto-item.component';
import { ConfirmacionComponent } from './confirmacion/confirmacion.component';
import { ShareButtonsModule } from 'ngx-sharebuttons';
// import { ComoComprarComponent } from './como-comprar/como-comprar.component';
// import { EnviosComponent } from './envios/envios.component';
// import { NosotrosComponent } from './nosotros/nosotros.component';
// import { ContactoComponent } from './contacto/contacto.component';
import { RecuperarPassComponent } from './recuperar-pass/recuperar-pass.component';
// import { PreguntasFrecuentesComponent } from './preguntas-frecuentes/preguntas-frecuentes.component';
import { ConfirmarDatosComponent } from './confirmar-datos/confirmar-datos.component';
import { LoadingComponent } from './shared/loading/loading.component';
import { CategoriasComponent } from './categorias/categorias.component';

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
    path: 'confirmar_datos_cliente',
    component: ConfirmarDatosComponent,
    data: { id: 1 }
  },
  {
    path: 'recuperar_contrasena',
    component: RecuperarPassComponent,
    data: { id: 1 }
  },
  {
    path: 'preguntas-frecuentes',
    // component: PreguntasFrecuentesComponent
    loadChildren: './preguntas-frecuentes/preguntas-frecuentes.module#PreguntasFrecuentesModule',
  },
  {
    path: 'como-comprar',
    // component: ComoComprarComponent
    loadChildren: './como-comprar/como-comprar.module#ComoComprarModule',
  },
  {
    path: 'contacto',
    // component: ContactoComponent
    loadChildren: './contacto/contacto.module#ContactoModule',
  },
  {
    path: 'envios',
    // component: EnviosComponent
    loadChildren: './envios/envios.module#EnviosModule',
  },
  {
    path: 'nosotros',
    // component: NosotrosComponent
    loadChildren: './nosotros/nosotros.module#NosotrosModule',
  },
  {
    path: 'busqueda/:id',
    component: FilterComponent
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
    path: 'Limpieza',
    component: FilterComponent,
    data: { title: 'Other text' }
  },
  {
    path: 'Bazar',
    component: FilterComponent,
    data: { title: 'Other text' }
  },
  {
    path: 'Textil',
    component: FilterComponent,
    data: { title: 'Other text' }
  },
  {
    path: 'Liquidos',
    component: FilterComponent,
    data: { title: 'Other text' }
  },
  {
    path: 'Jardin y riego',
    component: FilterComponent,
    data: { title: 'Other text' }
  },
  {
    path: 'Profesional',
    component: FilterComponent,
    data: { title: 'Other text' }
  },
  {
    path: 'Mas productos',
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
    path: 'compra/carrito',
    component: CompraComponent,
    data: { id: 1 },
  },
  {
    path: 'compra/envio',
    component: CompraComponent,
    data: { id: 1 },
  },
  {
    path: 'compra/finalizada',
    component: CompraComponent,
    data: { id: 1 },
  },
  {
    path: 'productos',
    component: CategoriasComponent,
    data: { title: 'Other text' }
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
    // ComoComprarComponent,
    // EnviosComponent,
    // NosotrosComponent,
    // ContactoComponent,
    RecuperarPassComponent,
    // PreguntasFrecuentesComponent,
    ConfirmarDatosComponent,
    LoadingComponent,
    CategoriasComponent,
  ],
  imports: [
    NgSelectModule,
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
