import { Component, OnInit, ViewEncapsulation, Input, Output, EventEmitter } from '@angular/core';
import { PromotionalBannerModel } from '../../../models/browse-products';
import { environment } from '../../../../environments/environment';
import { Router, RouterOutlet } from '@angular/router';
import { CoreService } from '../../../services/core.service';
import { DeviceDetectorService } from 'ngx-device-detector';
import { NgbCarouselConfig } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-tiles',
  templateUrl: './tiles.component.html',
  styleUrls: ['./tiles.component.css'],
  providers: [NgbCarouselConfig],
  encapsulation: ViewEncapsulation.None
})
export class TilesComponent implements OnInit {
  @Input() tilesData: Array<any>;
  @Output() selectTile = new EventEmitter<any>();
  
  dealBanner:any;
  s3 = environment.s3;
   
  constructor(private router: Router, public core: CoreService, private deviceService: DeviceDetectorService) { 
  }

  ngOnInit() {
    
} 
 
  resetOverlay(e) {
    let elements = document.querySelectorAll('.overlay_CS');
    if (elements) {
      for (let i = 0; i < elements.length; i++) {
        let elem = elements[i] as HTMLElement;
        elem.classList.add('d-none');
      }
    }
    if (e.currentTarget.querySelectorAll('.overlay_CS')[0]) e.currentTarget.querySelectorAll('.overlay_CS')[0].classList.remove('d-none');
  }

  getSelectedTile(tile) {
    this.selectTile.emit({ tile })
  }

}
