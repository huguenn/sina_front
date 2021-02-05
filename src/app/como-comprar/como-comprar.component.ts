import { Component, OnInit } from '@angular/core';
import { SharedService } from '../shared.service';

@Component({
  selector: 'app-como-comprar',
  templateUrl: './como-comprar.component.html',
  styleUrls: ['./como-comprar.component.css'],
})
export class ComoComprarComponent implements OnInit {

  constructor(private data: SharedService) { }

  ngOnInit() {
    this.data.updatePageTitle();
  }

}
