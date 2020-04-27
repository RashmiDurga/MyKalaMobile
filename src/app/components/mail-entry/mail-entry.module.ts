import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { MailProductComponent } from './mail-components/mail-product.component';
import { MailMyaccountComponent } from './mail-components/mail-myaccount.component';
import { MailLeaveReviewComponent } from './mail-components/mail-leavereview.component';
import { MailTrackOrderComponent } from './mail-components/mail-trackorder.component';
import { MailMyoffersComponent } from './mail-components/mail-myoffers.component';
import { MailChangeNotificationComponent } from './mail-components/mail-changenotification.component';
import { MailViewOrderComponent } from './mail-components/mail-vieworder.component';
import { MailVerifyAccountComponent } from './mail-components/mail-verifyaccount.component';
import { MailResetPasswordComponent } from './mail-components/mail-resetpassword.component';


@NgModule({
  imports: [
    CommonModule,
    NgbModule,
    ReactiveFormsModule,
    FormsModule, HttpClientModule,
  ],
  declarations: [
    MailProductComponent,
    MailMyaccountComponent,
    MailLeaveReviewComponent,
    MailTrackOrderComponent,
    MailMyoffersComponent,
    MailChangeNotificationComponent,
    MailViewOrderComponent,
    MailVerifyAccountComponent,
    MailResetPasswordComponent
  ],
  providers: []
})
export class MailEntryModule { }
