import { Component, OnInit } from '@angular/core';
import { SharedService } from '../shared.service';

@Component({
  selector: 'app-contacto',
  templateUrl: './contacto.component.html',
  styleUrls: ['./contacto.component.css']
})
export class ContactoComponent implements OnInit {

  constructor(private data: SharedService) { }

  ngOnInit() {
  }
  registrar() {
    this.data.toggleLoginModal()
  }

}
