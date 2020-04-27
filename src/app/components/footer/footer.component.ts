import { Component, OnInit, ViewEncapsulation, Input, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { AppComponent } from '../../app.component';
import { core } from '@angular/compiler';
import { CoreService } from '../../services/core.service';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment.local';
import { trigger, transition, animate, style } from '@angular/animations'

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css'],
  encapsulation: ViewEncapsulation.None,
  animations: [
    trigger('slideInOut', [
      transition(':enter', [
        style({ transform: 'translateY(-100%)' }),
        animate('200ms ease-in', style({ transform: 'translateY(0%)' }))
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ transform: 'translateY(-100%)' }))
      ])
    ])
  ]
})
export class FooterComponent implements OnInit {
  @Input() footerData: Array<any>;
  UserInput: any;
  @Output() writtenInput = new EventEmitter<any>();
  @Output() signOutEmit = new EventEmitter<any>();
  @Output() signInEmit = new EventEmitter<any>();
  firstName: string;
  lastName: string;
  emailId: string;
  userImg: string;
  showLounge: boolean = false;
  getUserInfo: any;
  year = new Date().getFullYear();
  showInput: boolean = false;
  constructor(public core: CoreService, private route: Router, private changDetRef: ChangeDetectorRef) {
    this.getUserInfo = window.localStorage['userInfo'] != undefined ? JSON.parse(window.localStorage['userInfo']) : null;
  }

  ngOnInit() {
    var lounge = document.getElementsByClassName("loungeMenu")[0];
    lounge.classList.remove("d-block");
    lounge.classList.add("d-none");
    this.getLoungeData();
  }
  cartDetails() {
    this.getUserInfo = window.localStorage['userInfo'] != undefined ? JSON.parse(window.localStorage['userInfo']) : null;
    if(this.getUserInfo != null) {
      this.route.navigateByUrl('/mycart')
    }
    else this.route.navigateByUrl('/guest-cart')
    
  }
  getLoungeData() {
    if (window.localStorage['userInfo'] != undefined) {

      this.core.getUserInfoOnLoad(JSON.parse(window.localStorage['userInfo']).userId);
      setTimeout(() => {
        if(window.localStorage['userInfo'] != undefined)
        {
          this.firstName = JSON.parse(window.localStorage['userInfo']).firstName;
          this.lastName = JSON.parse(window.localStorage['userInfo']).lastName;
          this.emailId = JSON.parse(window.localStorage['userInfo']).emailId;
          //this.userImg = JSON.parse(window.localStorage['userInfo']).consumerImagePath == undefined ? "/assets/images/avatar.png" : JSON.parse(window.localStorage['userInfo']).consumerImagePath;
          this.userImg = JSON.parse(window.localStorage['userInfo']).consumerImagePath;
          if (this.userImg == undefined || this.userImg == "") this.userImg = './assets/images/avatar.png';
          else {
            if (this.userImg.indexOf("https:") === -1 && this.userImg.indexOf("data:") === -1 && this.userImg.indexOf('assets') === -1) {
              this.userImg = environment.s3 + this.userImg + '?random+\=' + Math.random();
              //this.changDetRef.detectChanges();
            }
          }
        }
        else
        {
          this.firstName = "Guest";
          this.lastName = "";
          this.emailId = "";
          this.userImg = "./assets/images/avatar.png";
        } 
      }, 1000);

      // this.showLounge = true;
    }
    else {
      // this.showLounge = false;
      this.firstName = "Guest";
      this.lastName = "";
      this.emailId = "";
      this.userImg = "./assets/images/avatar.png";
    }
  }
  getWrittenText(userInput: any) {
    this.writtenInput.emit({ userInput });
    this.UserInput = "";
  }
  ShowLounge() {
    this.getUserInfo = window.localStorage['userInfo'] != undefined ? JSON.parse(window.localStorage['userInfo']) : null;
    this.showLounge = !this.showLounge;
    var lounge = document.getElementsByClassName("loungeMenu")[0];
    if (this.showLounge) {
      lounge.classList.remove("d-none");
      lounge.classList.add("d-block");
      this.getLoungeData();
    }
    else {
      lounge.classList.remove("d-block");
      lounge.classList.add("d-none");
    }
  }
  footerSwap() {
    let pageFooter = document.getElementsByClassName("optionalFooter")[0];
    if (pageFooter != undefined) {
      if (pageFooter.children[0].children[0].classList.contains("enableFooterText")) this.core.selectSearchOrCUI = !this.core.selectSearchOrCUI;
      else {
        this.showInput = true;
        this.core.footerSwapCUI(true, false);
      }
    }
    else this.enableSearchBar()
  }
  continueCUI() {
    this.core.selectSearchOrCUI = false;
    if (this.showInput) {
      this.core.footerSwapCUI(false, true);
      this.showInput = false;
    }
    else this.core.footerSwapCUI(true, false);
  }
  enableSearchBar() {
    this.core.searchBar = '';
    if (this.route.url == '/home') {
      window.scroll(0, 0)
      this.core.focusSearchBar();
    }
    else {
      this.core.selectSearchOrCUI = false;
      this.core.enableElasticSearch = true;
      setTimeout(() => this.core.focusSearchBar(), 1000);
    }
  }
  disableElasticSearch() {
    this.core.enableElasticSearch = false;
  }
  disablenNoProdFoundModal() {
    this.core.noProductsFoundModal = false;
  }
  signOut() {
    //this.core.signOutToCUI = true;  //To navigate To login in CUI
    let currentUrl = this.route.url; /// this will give you current url
    this.core.clearAllStorage();
    this.core.clearTokenValidation();
    this.core.clearUser();
    this.core.hideUserInfo(true);
    var lounge = document.getElementsByClassName("loungeMenu")[0];
    lounge.classList.remove("d-block");
    lounge.classList.add("d-none");
    this.showLounge = false;
    this.getLoungeData();
    this.route.navigateByUrl('/home');
  }
  signIn() {
    this.core.signInToCUI = true;
    this.core.signInFromLonge = true;
    localStorage.removeItem("token");
    if (this.route.url == '/search-result') {
      this.core.getbackToGetOffer = false;
      this.core.getbackToBuyProduct = false;
      this.core.getbackToMakeAnOffer = false;
      this.core.resetAllConvoFlags();
      this.route.navigateByUrl('/', { skipLocationChange: true })
        .then(() => this.route.navigateByUrl('/search-result'))
      this.signInEmit.emit();
    }
    else {
      //this.core.signInToCUI = false;
      this.core.getbackToGetOffer = false;
      this.core.getbackToBuyProduct = false;
      this.core.getbackToMakeAnOffer = false;
      window.localStorage['tbnAfterLogin']  = undefined;
      this.route.navigateByUrl('/search-result');
    }
    this.core.LoungeShowHide();
  }
  blur()
  {
    document.body.focus();
  }

}
