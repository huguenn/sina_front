import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import 'rxjs/add/operator/toPromise';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { environment } from './../environments/environment';
import { SharedService } from './shared.service';

@Injectable()
export class AutenticacionService {
  public  username:     string;
  // private token:        string;
  public  password:     string;
  public  razonsocial:  string;
  public  email:     	string;

  private refreshingToken: boolean = false;
  private renewingToken: boolean = false;

  // Observable para el estado del login
  private tokenSource = new BehaviorSubject<string>('');
  public  tokenStatus = this.tokenSource.asObservable();
  public  tokenValue: string = '';
  tokenUpdate($value) {
      this.tokenValue  = $value;
      this.tokenSource.next($value);
  }

  // Observable para el estado del login
  private loginSource = new BehaviorSubject<boolean>(false);
  public  loginStatus = this.loginSource.asObservable();
  public  loginValue: boolean = false;
  loginUpdate($value) {
      this.loginValue  = $value;
      this.loginSource.next($value);
  }
  // Observable para el estado del headerTitile
  private titleSource = new BehaviorSubject<string>('Dashboard');
  public  titleStatus = this.titleSource.asObservable();
  public  titleValue: string = 'Dashboard';
  titleUpdate($value) {
      this.titleValue  = $value;
      this.titleSource.next($value);
  }
  // Observable para el estado del userType
  private userTypeSource = new BehaviorSubject<boolean>(false);
  public  userTypeStatus = this.userTypeSource.asObservable();
  public  userTypeValue: boolean = false;
  userTypeUpdate($value) {
    const lista = ['6', '11', '16', '35', '41', '61'];
    this.userTypeValue  = lista.indexOf($value) !== -1;
    this.userTypeSource.next(this.userTypeValue);
  }

  getPath($path): string {
    if ($path.indexOf('https://') !== -1) {
      return $path;
    }
    if ($path.indexOf('http://') !== -1) {
      return $path;
    }

    if (environment.production) {
      return 'https://apisina.leren.com.ar/' + $path;
    }
    return 'http://127.0.0.1:8080/' + $path;
  }

  getParams($params) {
    let httpParams = new HttpParams();
    Object.keys($params).forEach((key) => {
      httpParams = httpParams.set(key, $params[key]);
    });
    return httpParams;
  }

  getHeader($data) {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type':  'application/x-www-form-urlencoded',
        'X-API-TOKEN': this.tokenValue,
      }),
      params: this.getParams($data),
    };
    return httpOptions;
  }
  getFileHeader($data) {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type':  'application/x-www-form-urlencoded',
        'X-API-TOKEN': this.tokenValue,
      }),
      responseType: 'arraybuffer' as 'json',
    };
    return httpOptions;
  }

  localSet($item, $data) {
    window.localStorage.setItem($item, JSON.stringify($data));
  }

  localGet($item) {
    const data = window.localStorage.getItem($item);
    if (data === '') {
      return '';
    }else {
      return JSON.parse(data);
    }
  }

  /**********************************/
  /*********      LOGIN      ********/
  /**********************************/

  autorizar($username, $password): Promise<any> {
    return new Promise((resolve, reject) => {
      this.http.post(this.getPath('auth/login'), {
        username: $username,
        password: $password,
      })
      .subscribe(($response) => {
        this.username = $username;
        this.localSet('login', {username: this.username, token: $response['token'], administrativo: $response['administrativo'] === 1 ? true : false,
          primer_login: $response['primer_login']});
        this.localSet('fecha', Date.now());

        this.tokenUpdate($response['token']);

        // reading carrito data
        this.get('carrito')
        .then(($responseCarrito) => {
          this.data.log('response getcarrito autenticacion', $responseCarrito);
          if ($responseCarrito.response) {
            for (const item of $responseCarrito.response.items) {
              const prod = item.producto;
              this.data.changeMessage(item.cantidad ? parseInt(item.cantidad, 10) : 1, prod.titulo, prod.precio, parseFloat(prod.precio) * parseInt(prod.cantidad, 10),
                                      prod.id, prod.codInterno, (prod.categorias && prod.categorias.length > 0) ? prod.categorias[0].nombre : '', prod.cantPack);
            }
          }

          if (!$response['primer_login']) {
            this.loginUpdate(true);
          } else {
            this.email = $response['email'];
            this.razonsocial = $response['razon_social'];
          }
        })
        .catch(($error) => {
          this.data.log('error getcarrito autenticacion', $error);

          if (!$response['primer_login']) {
            this.loginUpdate(true);
          } else {
            this.email = $response['email'];
            this.razonsocial = $response['razon_social'];
          }
        });

        resolve($response);
      }, ($error) => {
        reject({error: $error['error']});
        /*let dialogRef = this.dialog.open(LoginDialog, {
          width: '400px',
          data: { login: $error.json(), title: "Error en el logueo"}
        });*/
      });
    });
  }

  desacreditar() {
    this.localSet('user', '');
    this.localSet('login', '');
    this.localSet('fecha', '');
    this.loginUpdate(false);
    this.username = '';
    this.password = '';
    this.tokenUpdate('');
  }

  /**********************************/
  /*********    FIN LOGIN    ********/
  /**********************************/

  // TODO: Agregar que en cualquier 403 Forbidden, te desloguee
  get($url): Promise<any> {
    const ahora = Date.now();
    // checkeo si el token se genero entre 14 dias (1209600000) y 21 dias (1814400000) en el pasado
    if (this.localGet('login') !== '' && !this.refreshingToken && !this.renewingToken) {
      const $username = this.localGet('login').username;
      if ((ahora - this.localGet('fecha') > 1209600000) && (ahora - this.localGet('fecha') < 1814400000)) {
        this.data.log('get msg autenticacion', 'Ya pasaron entre 14 y 21 días del ultimo token');
        // Hago refresh del token acá...
        this.refreshingToken = true;
        this.http.get(this.getPath('auth/refresh'), this.getHeader({'username': $username}))
        .subscribe(($response) => {
          this.data.log('response auth/refresh autenticacion.service', $response);

          this.username = $username;
          this.localSet('login', {username: this.username, token: $response['token'], administrativo: $response['administrativo'] === 1 ? true : false,
            primer_login: $response['primer_login']});
          this.localSet('fecha', Date.now());
          this.tokenUpdate($response['token']);

          // No recargo la pagina y continuo con el request que desencadenó el refresh acá...
          return new Promise((resolve, reject) => {
            this.http.get(this.getPath($url), this.getHeader({}))
            .subscribe(($response) => {
              resolve($response);
            }, ($error) => {
              if ($error.status === 400 || $error.status === 403) {
                this.data.log('error 400 o 403 get desacreditando..', $error);
                this.desacreditar();
                this.loginUpdate(false);
                window.location.reload();
              }
              reject({error: $error['error']});
            });
          });
        }, ($error) => {
          this.data.log('error auth/refresh get autenticacion.service', $error);
          this.desacreditar();
          this.loginUpdate(false);
          window.location.reload();
        });
      } else {
        if (ahora - this.localGet('fecha') >= 1814400000) {
          this.data.log('get msg autenticacion', 'Ya pasaron 21 días o más del ultimo token');

          // acá hago auth/renew...
          this.renewingToken = true;

          this.http.get(this.getPath('auth/renew'), this.getHeader({'username': $username}))
          .subscribe(($response) => {
            this.data.log('response auth/renew autenticacion.service', $response);

            this.username = $username;
            this.localSet('login', {username: this.username, token: $response['token'], administrativo: $response['administrativo'] === 1 ? true : false,
              primer_login: $response['primer_login']});
            this.localSet('fecha', Date.now());
            this.tokenUpdate($response['token']);

            // Recargo la pagina porque hay otros requests que van a fallar y deben reintentarse
            window.location.reload();
          }, ($error) => {
            this.data.log('error auth/renew get autenticacion.service', $error);
            this.desacreditar();
            this.loginUpdate(false);
            window.location.reload();
          });
        }
      }
    }
    return new Promise((resolve, reject) => {
      this.http.get(this.getPath($url), this.getHeader({}))
      .subscribe(($response) => {
        /*this.username = $username
        this.localSet("login", {username: this.username, token: this.tokenValue,})
        this.loginUpdate(true)*/
        resolve($response);
      }, ($error) => {
        if ($error.status === 400 || $error.status === 403) {
          this.data.log('error 400 o 403 get desacreditando..', $error);
          this.desacreditar();
          this.loginUpdate(false);
          window.location.reload();
        }
        reject({error: $error['error']});
        /*let dialogRef = this.dialog.open(LoginDialog, {
          width: '400px',
          data: { login: $error.json(), title: "Error en el logueo"}
        });*/
      });
    });
  }

  // TODO: Agregar que en cualquier 403 Forbidden, te desloguee
  post($url, $body): Promise<any> {
    const ahora = Date.now();
    // checkeo si el token se genero entre 14 dias y 21 dias en el pasado
    if (this.localGet('login') !== '' && !this.refreshingToken && !this.renewingToken) {
      const $username = this.localGet('login').username;
      if ((ahora - this.localGet('fecha') > 1209600000) && (ahora - this.localGet('fecha') < 1814400000)) {
        this.data.log('get msg autenticacion', 'Ya pasaron entre 14 y 21 días del ultimo token');
        // Hago refresh del token acá...
        this.refreshingToken = true;
        this.http.get(this.getPath('auth/refresh'), this.getHeader({'username': $username}))
        .subscribe(($response) => {
          this.data.log('response auth/refresh autenticacion.service', $response);

          this.username = $username;
          this.localSet('login', {username: this.username, token: $response['token'], administrativo: $response['administrativo'] === 1 ? true : false,
            primer_login: $response['primer_login']});
          this.localSet('fecha', Date.now());
          this.tokenUpdate($response['token']);

          // No recargo la pagina y continuo con el request que desencadenó el refresh acá...
          const headers = new HttpHeaders({
            'Content-Type':  'application/x-www-form-urlencoded',
            'X-API-TOKEN': this.tokenValue,
          });
          return new Promise((resolve, reject) => {
            this.http.post(this.getPath($url), $body.toString(), {headers, observe: 'response'})
            .subscribe(($response) => {
              resolve($response);
            }, ($error) => {
              if ($error.status === 400 || $error.status === 403) {
                this.data.log('error 400 o 403 post desacreditando..', $error);
                this.desacreditar();
                this.loginUpdate(false);
                window.location.reload();
              }
              reject({error: $error['error']});
            });
          });
        }, ($error) => {
          this.data.log('error auth/refresh get autenticacion.service', $error);
          this.desacreditar();
          this.loginUpdate(false);
          window.location.reload();
        });
      } else {
        if (ahora - this.localGet('fecha') >= 1814400000) {
          this.data.log('get msg autenticacion', 'Ya pasaron 21 días o más del ultimo token');
          
          // acá hago auth/renew...
          this.renewingToken = true;

          this.http.get(this.getPath('auth/renew'), this.getHeader({'username': $username}))
          .subscribe(($response) => {
            this.data.log('response auth/renew autenticacion.service', $response);

            this.username = $username;
            this.localSet('login', {username: this.username, token: $response['token'], administrativo: $response['administrativo'] === 1 ? true : false,
              primer_login: $response['primer_login']});
            this.localSet('fecha', Date.now());
            this.tokenUpdate($response['token']);

            // Recargo la pagina porque hay otros requests que van a fallar y deben reintentarse
            window.location.reload();
          }, ($error) => {
            this.data.log('error auth/renew get autenticacion.service', $error);
            this.desacreditar();
            this.loginUpdate(false);
            window.location.reload();
          });
        }
      }
    }
    const headers = new HttpHeaders({
      'Content-Type':  'application/x-www-form-urlencoded',
      'X-API-TOKEN': this.tokenValue,
    });
    return new Promise((resolve, reject) => {
      this.http.post(this.getPath($url), $body.toString(), {headers, observe: 'response'})
      .subscribe(($response) => {
        resolve($response);
      }, ($error) => {
        if ($error.status === 400 || $error.status === 403) {
          this.data.log('error 400 o 403 post desacreditando..', $error);
          this.desacreditar();
          this.loginUpdate(false);
          window.location.reload();
        }
        reject({error: $error['error']});
      });
    });
  }

  checkNull($value) {
    return $value === null || $value === '';
  }

  constructor(private http: HttpClient, private data: SharedService ) {

    // initialization of user on localStorage
    if (this.checkNull(this.localGet('user'))) {
      this.data.toggleLoginModal();
    }else {
      if (localStorage.getItem('user')) {
        const user = JSON.parse(localStorage.getItem('user'));
        if (user !== '') {
          this.data.updateUser(user);
          this.userTypeUpdate(user['numeroListaPrecios']);
        }
      }
    }

    if (this.checkNull(this.localGet('login'))) {
      this.desacreditar();
      this.loginUpdate(false);
    } else {
      this.username = this.localGet('login').username;
      this.tokenUpdate(this.localGet('login').token);
      this.loginUpdate(true);
      this.titleUpdate('Dashboard');

      // reading carrito data
      this.get('carrito')
      .then(($response) => {
        this.data.log('response getcarrito autenticacion', $response);
        if ($response.response) {
          for (const item of $response.response.items) {
            const prod = item.producto;
            this.data.changeMessage(item.cantidad ? parseInt(item.cantidad, 10) : 1, prod.titulo, prod.precio, parseFloat(prod.precio) * parseInt(prod.cantidad, 10),
                                    prod.id, prod.codInterno, (prod.categorias && prod.categorias.length > 0) ? prod.categorias[0].nombre : '', prod.cantPack);
          }
        }
      })
      .catch(($error) => {
        this.data.log('error getcarrito autenticacion', $error);
      });
    }
  }
}
