import { Component, OnInit, ViewEncapsulation, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-breadcrums',
  templateUrl: './breadcrums.component.html',
  styleUrls: ['./breadcrums.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class BreadcrumsComponent implements OnInit {
  @Input() breadCrums: Array<any>;
  @Output() selectTile = new EventEmitter<any>();
  constructor() { }

  ngOnInit() {
  }

  sendBreadCrum(tile, IsBc) {
    this.selectTile.emit({ tile, IsBc });
  }

}
