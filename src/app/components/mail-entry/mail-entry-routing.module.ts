import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MailProductComponent } from './mail-components/mail-product.component';
import { MailMyaccountComponent } from './mail-components/mail-myaccount.component';
import { MailLeaveReviewComponent } from './mail-components/mail-leavereview.component';
import { MailTrackOrderComponent } from './mail-components/mail-trackorder.component';
import { MailMyoffersComponent } from './mail-components/mail-myoffers.component';
import { MailChangeNotificationComponent } from './mail-components/mail-changenotification.component';
import { MailViewOrderComponent } from './mail-components/mail-vieworder.component';
import { MailVerifyAccountComponent } from './mail-components/mail-verifyaccount.component';
import { MailResetPasswordComponent } from './mail-components/mail-resetpassword.component';

const appRoutes: Routes = [
  {
    path: 'mail/product/:id',
    component: MailProductComponent,
  },
  {
    path: 'mail/:userId/myaccount',
    component: MailMyaccountComponent,
  },
  {
    path: 'mail/:userId/myoffer',
    component: MailMyoffersComponent,
  },
  {
    path: 'mail/:userId/order/:orderId/product/:productId/review',
    component: MailLeaveReviewComponent,
  },
  {
    path: 'mail/:userId/order/:orderId/product/:productId/carrier/:carrier/trackingNumber/:trackingNumber/track',
    component: MailTrackOrderComponent,
  },
  {
    path: 'mail/:userId/order/:orderId',
    component: MailViewOrderComponent,
  },
  {
    path: 'mail/:userId/changenotification',
    component: MailChangeNotificationComponent,
  },
  {
    path: 'mail/:userId/unsubscribe',
    component: MailMyaccountComponent,
  },
  {
    path: 'mail/token/:tokenId/thank',
    component: MailVerifyAccountComponent
  },
  {
    path: 'mail/reset-password',
    component: MailResetPasswordComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(appRoutes)],
  exports: [RouterModule]
})
export class MailEntryRoutingModule { }
