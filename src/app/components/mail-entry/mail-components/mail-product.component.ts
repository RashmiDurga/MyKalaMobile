import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { CoreService } from '../../../services/core.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-mail-product',
  template: '<div class="header bgimage"><div>',
  encapsulation: ViewEncapsulation.None
})
export class MailProductComponent implements OnInit {
  userId: any;
  productId: any;
  constructor(private router: Router,
    route: ActivatedRoute,
    public core: CoreService) {
    this.userId = route.snapshot.params['userId'];
    this.productId = route.snapshot.params['id'];
  }

  ngOnInit() {
    // console.log(`mail/${this.userId}/product/${this.productId}`);
    this.core.getProductDetails(this.productId);
  }
}
