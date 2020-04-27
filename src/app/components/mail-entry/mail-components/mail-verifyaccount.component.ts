import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { userMessages } from './messages';
import { CoreService } from '../../../services/core.service';
import { ActivatedRoute, Router } from '@angular/router';
import { LocalStorageService } from '../../../services/LocalStorage.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-mail-verifyaccount',
  template: `
  <div class="header bgimage">
    <div class="container">
      <div style="height:15px;width:100%;"></div>
      <div class="thankWrapper text-center p-3" style="background:#fff">
        <div *ngIf="verficationStatus == 'alreadyVerified'">
          <h2>Already Verified</h2>
          <p>Your account has been already verified.</p>
        </div>
        <div *ngIf="verficationStatus == 'success'">
          <h2>Thank You</h2>
          <p>You've successfully verfied your account.</p>
        </div>
        <div *ngIf="verficationStatus == 'tokenExpired'">
          <h2>Token Expired</h2>
          <p>Your token session has been expired.</p>
        </div>
      </div>
    </div>
  </div>
  `,
  encapsulation: ViewEncapsulation.None
})
export class MailVerifyAccountComponent implements OnInit {
  token: string;
  verficationStatus: any;
  constructor(private router: Router,
    route: ActivatedRoute,
    private auth: AuthService,
    public core: CoreService, private localStorageService: LocalStorageService) {
    this.token = route.snapshot.params['tokenId'];
  }

  ngOnInit() {
    localStorage.clear();
    this.core.resetAllConvoFlags();
    this.auth.getVerified(this.token).subscribe((data) => {
      this.verficationStatus = data;
      setTimeout(() => this.router.navigateByUrl('/search-result'), 3000);
    });
  }
}
