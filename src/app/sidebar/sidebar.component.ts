import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs/Subject';
import { MenuService } from '../menu.service';
import { SharedService } from '../shared.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css'],
})
export class SidebarComponent implements OnInit, OnDestroy {
  private destroy$: Subject<void> = new Subject<void>();
  LinkList  = [];
  MenuList  = [];
  LinkIndex = 0;
  LinkIndexHija = 0;
  UserLog: boolean;
  SideStateIcon: boolean;
  UserName: any;
  UserJob: any;

  constructor(
    private menu: MenuService,
    private router: Router,
    private data: SharedService,
    // private http: HttpClient,
    // private auth: AutenticacionService
  ) {
    this.menu.LinkList$.pipe(takeUntil(this.destroy$)).subscribe(($cambio_link: any) => {
      if ($cambio_link) {
        this.LinkList = $cambio_link;
      }

    });
    this.menu.MenuList$.pipe(takeUntil(this.destroy$)).subscribe(($cambio_menu: any) => {
      if ($cambio_menu) {
        this.MenuList = $cambio_menu;
      }
    });
  }
  ngOnInit() {
    // subscribing to data on carritoStatus
    this.data.currentLogin.pipe(takeUntil(this.destroy$)).subscribe(
      (status) => {
        this.UserLog = status;
        if (this.data.user) {
          try {
            this.UserName = this.data.user.razonSocial;
            this.UserJob  = this.data.user.categoriaIva;
          }catch (e) {
            this.data.log('oninit error sidebar:', e);
          }
        }
      },
    );
  }

  ngOnDestroy() {
    this.destroy$.next();
  }

  convertLink= ($subcategoria) => {
    try {
      const texto = $subcategoria.nombre.split(' ').join('-') + '/' + $subcategoria.id;
      return texto;
    } catch ($error) {
      this.data.log('Alguno de los datos de la subcategoria esta incompleto error sidebar');
      return '';
    }
  }
  convertLink2= ($categoria, $subcategoria) => {
    try {
      const texto = $categoria.nombre.split(' ').join('-')  + '/' +  $subcategoria.nombre.split(' ').join('-') + '/' + $subcategoria.id;
      return texto;
    } catch ($error) {
      this.data.log('Alguno de los datos de la subcategoria esta incompleto 2 error sidebar');
      return '';
    }
  }

  toggleMenu() {
    this.data.toggleSideBar();
  }
  changeStyleClick($index) {
    if (this.LinkIndex !== $index) {
      this.LinkIndex = $index;
    } else {
      this.LinkIndex = 0;
    }
  }
  changeStyleClickHija($index, $seccion) {
    if ($seccion.items.length) {
      if (this.LinkIndexHija !== $index) {
        this.LinkIndexHija = $index;
      } else {
        this.LinkIndexHija = 0;
      }
    } else {
      this.data.toggleSideBar();
    }
  }
  closeHija() {
    this.LinkIndexHija = 0;
  }
  registrar() {
    this.data.toggleLoginModal();
    this.data.toggleSideBar();
  }
  toggleSideBar() {
    this.data.toggleSideBar();
  }
  sidebarCerrarSesion() {
    this.toggleSideBar();
    this.router.navigateByUrl('/', {skipLocationChange: true}).then(() => this.router.navigate(['/cuenta'], { queryParams: {tab: 4}}));
  }

}
