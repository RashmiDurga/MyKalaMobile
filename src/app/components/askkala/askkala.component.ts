import { Component, OnInit, ViewEncapsulation, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { CoreService } from '../../services/core.service';
import { Router, NavigationEnd } from '@angular/router';
import { SidebarModule } from 'ng-sidebar';
import { environment } from '../../../environments/environment.local';

@Component({
  selector: 'app-askkala',
  templateUrl: './askkala.component.html',
  styleUrls: ['./askkala.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class AskKalaComponent implements OnInit {
  getHeader: any;
  firstName: string;
  lastName: string;
  emailId: string;
  userImg: string;
  showLounge: boolean;
  s3 = environment.s3;
  confirmValidationMsg = { label: '', message: '' };

  @ViewChild('loginSignUpModal') loginSignUpModal: ElementRef;

  constructor(private router: Router, public core: CoreService) { }

  ngOnInit() {
    this.core.showaskKalaConverationDefault = true;
  }
  getOffers() {
    if (window.localStorage['token'] == undefined) {
      this.confirmValidationMsg.label = 'login';
      this.confirmValidationMsg.message = "You must be logged in as a member to receive custom offers. Do you want to log in now or create an account?"
      this.core.openModal(this.loginSignUpModal);
      this.core.getbackToGetOffer = true;
      this.core.getbackToMakeAnOffer = false;
      this.core.getbackToBuyProduct = false;
    }
    else {
      //if (window.localStorage['esKeyword'])
      // let place = [], category = [], subcategory = [], levelSelection;
      // place = new Array<SearchDataModal>();
      // category = new Array<SearchDataModal>();
      // place.push(new SearchDataModal(this.selectedProduct.product.productHierarchyWithIds[0].levelId, this.selectedProduct.product.productHierarchyWithIds[0].levelName, this.selectedProduct.product.productHierarchyWithIds[0].levelName, this.selectedProduct.product.productHierarchyWithIds[0].levelCount));
      // category.push(new SearchDataModal(this.selectedProduct.product.productHierarchyWithIds[1].levelId, this.selectedProduct.product.productHierarchyWithIds[1].levelName, this.selectedProduct.product.productHierarchyWithIds[1].levelName, this.selectedProduct.product.productHierarchyWithIds[1].levelCount));
      // subcategory.push(new SearchDataModal(this.selectedProduct.product.productHierarchyWithIds[2].levelId, this.selectedProduct.product.productHierarchyWithIds[2].levelName, this.selectedProduct.product.productHierarchyWithIds[2].levelName, this.selectedProduct.product.productHierarchyWithIds[2].levelCount));
      // if (window.localStorage['levelSelections'] == undefined) levelSelection = new Object();
      // else levelSelection = JSON.parse(window.localStorage['levelSelections']);
      // levelSelection.place = place[0];
      // levelSelection.category = category[0];
      // levelSelection.subcategory = {};
      // levelSelection.subType = {};
      // levelSelection.type = [];
      // window.localStorage['levelSelections'] = JSON.stringify(levelSelection);
      //if (window.localStorage['esKeyword'])
      this.core.isSearchWithoutSuggestion = false;
      this.core.IsGetoffers = true;
      this.router.navigateByUrl('/search-result');
    }
  }
  refineImage(img) {
    let userInformation = JSON.parse(window.localStorage['userInfo']);
    userInformation.consumerImagePath = img;
    window.localStorage['userInfo'] = JSON.stringify(userInformation);
  }
  confirmUser() {
    window.localStorage['tbnAfterLogin'] = window.location.hash.split("#")[1];
    this.core.resetAllConvoFlags();
    this.core.signInToCUI = true;
    this.router.navigateByUrl('/search-result');
    this.core.LoungeShowHide();
  }
  
  signUpUser()
  {
    window.localStorage['tbnAfterLogin'] = window.location.hash.split("#")[1];
    this.core.resetAllConvoFlags();
    this.core.signUpToCUI = true;
    this.router.navigateByUrl('/search-result');
    this.core.LoungeShowHide();
  }

}
