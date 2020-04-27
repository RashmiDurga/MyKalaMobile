import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { CoreService } from '../../services/core.service';

@Component({
  selector: 'app-elastic-search-bar',
  templateUrl: './elastic-search-bar.component.html',
  styleUrls: ['./elastic-search-bar.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class ElasticSearchBarComponent implements OnInit {

  constructor(
    public core: CoreService
  ) { }

  ngOnInit() {
  }

}
