import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { CoreService } from '../../../services/core.service';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { MyOrdersService } from '../../../services/myorder.service';

@Component({
  selector: 'app-mail-trackorder',
  template: '<div class="header bgimage"><div>',
  encapsulation: ViewEncapsulation.None
})
export class MailTrackOrderComponent implements OnInit {
  orderId: any;
  unAuthorized: boolean;
  loader: boolean;
  userId: any;
  productId: any;
  carrier: any;
  trackingNumber: any;
  constructor(private router: Router,
    route: ActivatedRoute,
    private auth: AuthService,
    public core: CoreService, private myOrdersService: MyOrdersService) {
    this.userId = route.snapshot.params['userId'];
    this.orderId = route.snapshot.params['orderId'];
    this.productId = route.snapshot.params['productId'];
    this.carrier = route.snapshot.params['carrier'];
    this.trackingNumber = route.snapshot.params['trackingNumber'];
  }

  ngOnInit() {
    if (!this.core.validateUser(this.userId)) {
      this.core.resetAllConvoFlags();
      this.core.redirectTo(this.router.url);
      this.router.navigateByUrl('/search-result');
    } else {
      this.trackOrder(this.orderId, this.productId);
    }
  }
  trackOrder(orderId, productId) {
    if (!window.localStorage['token']) {
      this.core.redirectTo(this.router.url);
      this.router.navigateByUrl('/home');
      return false;
    }
    this.myOrdersService.getById(orderId).subscribe(order => {
      if (order.orderItems.filter(p => p.productId === productId).length > 0) {
        this.myOrdersService.trackOrder(this.carrier, this.trackingNumber, this.productId).subscribe((res) => {
          window.localStorage['productForTracking'] = JSON.stringify({ modal: order, order: order.orderItems.filter(p => p.productId === productId)[0], goShippoRes: res });
          this.core.redirectTo('app-track-order');
        }, (err) => {
          console.log(err);
        });
      }
    });
  }
}
