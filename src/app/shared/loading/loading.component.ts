import { Component, OnInit, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-loading',
  templateUrl: './loading.component.html',
  styleUrls: ['./loading.component.css']
})
export class LoadingComponent implements OnInit {

  @Output() cerrarModal: EventEmitter<boolean> = new EventEmitter();

  constructor() { }

  ngOnInit() {
  }

  cerrar() {
    this.cerrarModal.emit(true);
  }


  // [ngClass]="{'modalHide': loginStatus}"
}
