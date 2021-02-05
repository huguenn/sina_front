import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs/Subject';
import { Subscription } from 'rxjs/Subscription';
import { AutenticacionService } from '../autenticacion.service';
import { SharedService } from '../shared.service';

@Component({
  selector: 'app-recuperar-pass',
  templateUrl: './recuperar-pass.component.html',
  styleUrls: ['./recuperar-pass.component.css'],
})
export class RecuperarPassComponent implements OnInit, OnDestroy {
    private destroy$: Subject<void> = new Subject<void>();
    sub: Subscription;
    respuesta: string = '';
    tokenCode: string = '';
    password: string = '';
    password_re: string = '';
    volviendoAlHome: boolean = false;
    constructor(
    private route:  ActivatedRoute,
    private router: Router,
    private http:   HttpClient,
    private auth:   AutenticacionService,
    private data: SharedService,
    ) {

    }

    public password_type: string = 'password';

    ngOnInit() {
        this.data.updatePageTitle('Recuperar contraseña | Sina');
        this.data.closeLoginModal();
        this.sub = this.route
        .queryParams
        .pipe(takeUntil(this.destroy$)).subscribe((params) => {
          if (params['codigo']) {
              this.tokenCode = params['codigo'];
          }
        });
    }

    ngOnDestroy() {
      this.destroy$.next();
      this.sub.unsubscribe();
    }

    confirmarClaveKey($event) {
        if ($event.keyCode == 13) {
            this.confirmarClave();
        }
    }
    volver_home() {
        this.data.toggleLoginModal();
        this.router.navigate(['/']);
    }
    confirmarClave() {
        /*this.auth.get()
        .then(($response)  =>{
          this.respuesta = $response.response
        })
        .catch($error => {
          this.respuesta = $error.error.response
          this.data.log('confirmarclave error recuperar-pass', $error)
        }) */
        this.respuesta = 'Esperando respuesta';

        const body = new URLSearchParams();
        body.set('password', this.password);
        body.set('password_re', this.password_re);

        const headers = new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' });
        this.http.post(this.auth.getPath('public/cliente/cambiar_contrasena/' + this.tokenCode), body.toString(), {headers, observe: 'response'})
        .pipe(takeUntil(this.destroy$)).subscribe(($response: any) => {
          this.respuesta = ($response.body.response);
          this.volviendoAlHome = true;

          // if($response.body.response.mensaje) {
            // this.respuesta = $response.body.response.mensaje
          // }
        }, ($error) => {
          /*try {
            Object.keys($error.error.response.error).forEach(element => {
              this.recuperarError += $error.error.response.error[element] + " "
            })
          } catch($throw) {
            this.data.log('confirmarclave error recuperar-pass', $throw)
          }*/
          this.respuesta = ($error.error.response);
        });
    }

    togglePasswordType() {
      if (this.password_type === 'password') {
        this.password_type = 'text';
      } else {
        if (this.password_type === 'text') {
          this.password_type = 'password';
        }
      }
    }
}
