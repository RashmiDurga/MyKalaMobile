import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { CoreService } from '../../../services/core.service';
import { ActivatedRoute, Router } from '@angular/router';
import { LocalStorageService } from '../../../services/LocalStorage.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-mail-vieworder',
  template: '<div class="header bgimage"><div>',
  encapsulation: ViewEncapsulation.None
})
export class MailViewOrderComponent implements OnInit {
  orderId: any;
  unAuthorized: boolean;
  loader: boolean;
  userId: any;
  productId: any;
  constructor(private router: Router,
    route: ActivatedRoute,
    private auth: AuthService,
    public core: CoreService, private localStorageService: LocalStorageService) {
    this.userId = route.snapshot.params['userId'];
    this.orderId = route.snapshot.params['orderId'];
  }

  ngOnInit() {
    if (!this.core.validateUser(this.userId)) {
      this.core.resetAllConvoFlags();
      this.core.redirectTo(this.router.url);
      this.router.navigateByUrl('/search-result');
    } else {
      this.core.redirectTo('myorders');
    }
  }
}
