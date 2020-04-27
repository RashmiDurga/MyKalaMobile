import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { CoreService } from '../../services/core.service';

@Component({
  selector: 'app-logout',
  templateUrl: './logout.component.html',
  styleUrls: ['./logout.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class LogoutComponent implements OnInit {

  constructor(private router: Router, public core: CoreService) { }

  ngOnInit() {
    this.onLogout();
  }
  onLogout(): void {
    this.core.clearAllStorage();
    this.core.clearTokenValidation();
    this.core.clearUser();
    this.core.hideUserInfo(true);
    var lounge = document.getElementsByClassName("loungeMenu")[0];
    lounge.classList.remove("d-block");
    lounge.classList.add("d-none");
    this.router.navigateByUrl('/home');
  }
}
