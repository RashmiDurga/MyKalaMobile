import { Component, OnInit, ViewEncapsulation, Input } from '@angular/core';

@Component({
  selector: 'app-swipe-slider',
  templateUrl: './swipe-slider.component.html',
  styleUrls: ['./swipe-slider.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class SwipeSliderComponent implements OnInit {
  @Input() productImages: any;
  config: SwiperOptions = {
    pagination: '.swiper-pagination',
    paginationClickable: true,
    nextButton: '.swiper-button-next',
    prevButton: '.swiper-button-prev',
    spaceBetween: 30
  };
  constructor() { }

  ngOnInit() {
  }

}
