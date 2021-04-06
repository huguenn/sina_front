import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs/Subject';
import { Subscription } from 'rxjs/Subscription';
import { AutenticacionService } from '../autenticacion.service';
import { SharedService } from '../shared.service';

@Component({
  selector: 'app-confirmacion',
  templateUrl: './confirmacion.component.html',
  styleUrls: ['./confirmacion.component.css'],
})
export class ConfirmacionComponent implements OnInit, OnDestroy {
  private destroy$: Subject<void> = new Subject<void>();
  sub: Subscription;
  respuesta: string = 'Esperando respuesta...';
  loading: boolean = true;
  constructor(
    private route:  ActivatedRoute,
    // private router: Router,
    // private http:   HttpClient,
    private auth:   AutenticacionService,
    private data: SharedService,
  ) { }

  ngOnInit() {
    this.data.updatePageTitle();
    this.data.closeLoginModal();
    this.sub = this.route
    .queryParams
    .pipe(takeUntil(this.destroy$)).subscribe((params) => {
      if (params['codigo'] || 0) {
        this.auth.get('public/cliente/confirmar_email/' + params['codigo'])
        .then(($response)  => {
          this.loading = false;
          this.respuesta = $response.response;
        })
        .catch(($error) => {
          this.respuesta = $error.error.response;
          this.data.log('oninit confirmarmail error confirmacion', $error);
        });

      }
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.sub.unsubscribe();
  }
}
