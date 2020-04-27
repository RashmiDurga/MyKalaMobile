import { Component, OnInit, ViewEncapsulation, ViewChild, ElementRef } from '@angular/core';
import { CoreService } from '../../../services/core.service';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { MyOrdersService } from '../../../services/myorder.service';

@Component({
  selector: 'app-mail-leavereview',
  template: `
  <div class="header bgimage"><div>
  <ng-template #productAlreadyReviewed let-c="close" let-d="dismiss">
  <div class="modal-body">
    <p>You have already reviewed this product.</p>
  </div>
  <div class="modal-footer">
    <button type="button" class="btn btn-outer btn_redouter_right" (click)="c('Close click')">Close</button>
  </div>
</ng-template>
  `,
  encapsulation: ViewEncapsulation.None
})
export class MailLeaveReviewComponent implements OnInit {
  @ViewChild('productAlreadyReviewed') productAlreadyReviewed: ElementRef;
  orderId: any;
  unAuthorized: boolean;
  loader: boolean;
  userId: any;
  productId: any;
  constructor(private router: Router,
    route: ActivatedRoute,
    private auth: AuthService,
    public core: CoreService, private myOrdersService: MyOrdersService) {
    this.userId = route.snapshot.params['userId'];
    this.orderId = route.snapshot.params['orderId'];
    this.productId = route.snapshot.params['productId'];
  }

  ngOnInit() {
    if (!this.core.validateUser(this.userId)) {
      this.core.resetAllConvoFlags();
      this.core.redirectTo(this.router.url);
      this.router.navigateByUrl('/search-result');
    } else {
      this.leaveReview(this.orderId, this.productId);
    }
  }
  leaveReview(orderId, productId) {
    if (!window.localStorage['token']) {
      this.core.redirectTo(this.router.url);
      this.router.navigateByUrl('/home');
      return false;
    }
    this.myOrdersService.getById(orderId).subscribe(order => {
      if (order.orderItems.filter(p => p.productId === productId).length > 0) {
        this.myOrdersService.getOrderReviewStatus(orderId, productId).subscribe((res) => {
          if (res === '') {
            window.localStorage['forReview'] = JSON.stringify({ modal: order, order: order.orderItems.filter(p => p.productId === productId)[0] });
            this.core.redirectTo('app-leave-review');
          }
          else {
            this.core.openModal(this.productAlreadyReviewed);
            this.core.getProductDetails(productId);
          }
        }, (err) => console.log(err));
      }
    });
  }
}
