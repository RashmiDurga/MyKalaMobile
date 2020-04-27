import { Injectable, ViewChild, ElementRef } from '@angular/core';
import { Http, Headers } from '@angular/http';
import { User, UserProfile, BasicAuth } from '../models/user';
import { environment } from '../../environments/environment';
import { Router, NavigationEnd } from '@angular/router';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import animateScrollTo from 'animated-scroll-to';
import { Subject } from 'rxjs/Subject';
import { BrowseProductsModal } from '../models/browse-products';
import { Location } from '@angular/common';
import { LocalStorageService } from './LocalStorage.service';
import { SuggestionList } from '../models/suggestionList';

@Injectable()
export class CoreService {
  hideUser: boolean = true;
  navVisible: boolean = true;
  logoutVisible: boolean = false;
  showSearch: boolean = true;
  lastSearch :boolean = false;
  highestScore :any =0;
  showHeaderMessage: string;
  searchMessage: string;
  user: User;
  pageMsg: string;
  showPageMsg: boolean = false;
  noOfItemsInCart: boolean = false;
  userImg: string;
  footerInputText: string;
  public modalReference: any;
  tilesData: any[];
  esKey = new Subject<any[]>();
  IsCheckout: boolean = false;
  IsTrackOrder: boolean = false;
  IsElasticSearch: boolean = false;
  IsGetoffers: boolean = false;
  IsContactKala: boolean = false;
  searchBar: any = "";
  onlyPassword: boolean = false;
  inputNewLocation: boolean = false;
  inputNewOption: boolean = false;
  signOutToCUI: boolean = false;
  signInToCUI: boolean = false;
  signInFromLonge : boolean = false;
  signUpToCUI : boolean = false;
  whereIsItFromCUI: boolean = false;
  onlyEmailId: boolean = false;
  deactivateRouteFlagVal: boolean = false;
  offersDetailFlag: boolean = false;
  IsBrowseProduct: boolean = false;
  isGuestCheckout: boolean = false;
  showMyorderDetail: boolean = false;
  session: any;
  refreshingSession: boolean = false;
  suggesstionList: Array<any>;
  isWithSpecialCharacter: boolean = false;
  loader_suggestion: boolean = false;
  resetToDefault: number;
  isSearchWithoutSuggestion: boolean = false;
  loaderSearch: boolean = false;
  esSizeCounter: number = 30;
  esFromCounter: number = 0;
  enableElasticSearch: boolean = false;
  @ViewChild('esSearchBar') esSearchBar: ElementRef;
  selectSearchOrCUI: boolean = false;
  noProductsFoundModal: boolean = false;
  isSliderZoomedIn: boolean = false;
  previousUrl: string;
  currentUrl: string;
  getbackToGetOffer : boolean = false;
  getbackToMakeAnOffer : boolean = false;
  getbackToBuyProduct : boolean = false;
  placeCategDataArrayGeneric=[];
  headerImgCateg:any;
  showaskKalaConverationDefault : boolean = true;
  showaskKalaConveration:boolean = true;
  productNotFound: boolean = false;
  hideSearchField:boolean = true;
  arrowkeyLocation = 0;
  constructor(
    private http: Http,
    private route: Router,
    private modalService: NgbModal,
    private _location: Location,
    private localStorageService: LocalStorageService) {
    if (window.localStorage['token'] != undefined) this.startTokenValidation();
    this.currentUrl = this.route.url;
    route.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.previousUrl = this.currentUrl;
        this.currentUrl = event.url;
      };
    });
  }

  getPreviousUrl() {
    return this.previousUrl;
  }

  hide() { this.navVisible = false; }

  searchMsgToggle(msg?: any) {
    if (msg != undefined) {
      this.showSearch = false;
      this.searchMessage = msg;
    }
    else this.showSearch = true;
  }

  pageLabel(pageMessage?: any) {
    if (pageMessage == undefined) this.showPageMsg = false;
    else {
      this.showPageMsg = true;
      this.pageMsg = pageMessage;
    }
  }

  showLogout() { return this.user !== null }

  show(msg?: any) { this.navVisible = true; this.showHeaderMessage = msg; }

  toggle() { this.navVisible = !this.navVisible; }

  setUser(usr: User) {
    this.user = usr;
    this.show();
  }

  clearUser() {
    this.user = null;
    this.hide();
  }

  hideUserInfo(showuser: boolean) {

    if (showuser === true) this.hideUser = true;
    else {
      this.hideUser = false;
      if (window.localStorage['userInfo'] !== undefined) {
        this.userImg = JSON.parse(window.localStorage['userInfo']).consumerImagePath;
        if (this.userImg != undefined && this.userImg != null && this.userImg != "") {
          if (this.userImg.indexOf('https:') === -1 && this.userImg.indexOf('http:') === -1 && this.userImg.indexOf('data:') === -1 && this.userImg.indexOf('assets') === -1) {
            this.userImg = environment.s3 + this.userImg
          }
        }
      }
    }

  }

  checkIfLoggedOut() {
    if (window.localStorage['token'] !== undefined) this.hideUserInfo(false);
    else {
      this.clearUser();
      this.hideUserInfo(true);
    }
  }

  headerScroll() {
    setTimeout(function () {
      var header = document.getElementsByClassName("header_sub")[0];
      var searchBox = document.getElementsByClassName("searchBox")[0];
      var logoContainer = document.getElementsByClassName("logo")[0];
      header != undefined? header.classList.add("header_Scroll"):{};
      searchBox != undefined? searchBox.classList.remove("invisible"):{};
      if(logoContainer != undefined)
      {
        logoContainer.classList.remove("d-none");
        logoContainer.nextElementSibling.classList.add("d-none");
      }
     
    }, 100);
  }

  showNoOfItemsInCart() {
    if (window.localStorage['existingItemsInCart'] != undefined) {
      this.noOfItemsInCart = JSON.parse(window.localStorage['existingItemsInCart']).length;
      return true;
    }
    else return false;
  }

  footerSwap() {
    let appFooter = document.getElementsByClassName("footer")[0];
    let pageFooter = document.getElementsByClassName("optionalFooter")[0];
    appFooter.classList.add("hideFooter");
    if (pageFooter != undefined) {
      pageFooter.classList.add("showFooter");
      pageFooter.children[0].children[0].classList.add("enableFooterText");
      pageFooter.children[0].children[1].classList.add("disableFooterButton");
    }
    else appFooter.classList.remove("hideFooter");

  }
  LoungeShowHide() {
    var lounge = document.getElementsByClassName("loungeMenu")[0];
    lounge.classList.remove("d-block");
    lounge.classList.add("d-none");

  }
  footerSwapCUI(flagButton: any, flagText: any) {
    let appFooter = document.getElementsByClassName("footer")[0];
    appFooter.classList.add("hideFooter");
    if (flagButton) {
      let pageFooter = document.getElementsByClassName("optionalFooter")[0];
      if (pageFooter != undefined) {
        pageFooter.classList.add("showFooter");
        pageFooter.children[0].children[0].classList.remove("enableFooterText");
        pageFooter.children[0].children[0].classList.remove("disableFooterButton");
        pageFooter.children[0].children[1].classList.remove("enableFooterText");
        pageFooter.children[0].children[1].classList.remove("disableFooterButton");

        pageFooter.children[0].children[0].classList.add("enableFooterText");
        pageFooter.children[0].children[1].classList.add("disableFooterButton");

      }
    }
    else {
      let pageFooter = document.getElementsByClassName("optionalFooter")[0];
      if (pageFooter != undefined) {
        pageFooter.classList.add("showFooter");
        pageFooter.children[0].children[0].classList.remove("enableFooterText");
        pageFooter.children[0].children[0].classList.remove("disableFooterButton");
        pageFooter.children[0].children[1].classList.remove("enableFooterText");
        pageFooter.children[0].children[1].classList.remove("disableFooterButton");

        pageFooter.children[0].children[0].classList.add("disableFooterButton");
        pageFooter.children[0].children[1].classList.add("enableFooterText");
      }
    }

  }
  openModal(content, size?: any) {
    this.modalReference = this.modalService.open(content)
    this.modalReference.result.then(
      (result) => { },
      (reason) => {
        this.getDismissReason(reason);
      });
  }
  getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return `with: ${reason}`;
    }
  }

  allowOnlyNumbers(event) {
    var key = window.event ? event.keyCode : event.which;
    if (event.keyCode == 8 || event.keyCode == 46
      || event.keyCode == 37 || event.keyCode == 39) {
      return true;
    }
    else if (key < 48 || key > 57) return false;
    else return true;
  }

  filterIamgeURL() {
    for (var i = 0; i < this.tilesData.length; i++) {
      if (this.tilesData[i].product.productImages) {
        for (var j = 0; j < this.tilesData[i].product.productImages.length; j++) {
          let product = this.tilesData[i].product.productImages[j];
          if (product.location.indexOf('data:') === -1 && product.location.indexOf('https:') === -1 && product.location.indexOf('http:') === -1 ) {
            this.tilesData[i].product.productImages[j].location = environment.s3 + product.location;
          }
          if (product.location.indexOf('maxHeight') > -1) {
            this.tilesData[i].product.productImages[j].location = product.location.split(";")[0];
          }
        }
      }
    }
  }

  getMainImage() {
    for (var i = 0; i < this.tilesData.length; i++) {
      if (this.tilesData[i].product.productImages) {
        for (var j = 0; j < this.tilesData[i].product.productImages.length; j++) {
          let product = this.tilesData[i].product.productImages[j]
          if (product.mainImage == true) this.tilesData[i].product.mainImageSrc = product.location;
        }
      }
    }
  }

  getDetails(productId) {
    const url: string = `${environment.productList}/${environment.apis.products.getProduct}/${productId}`;
    return this.http.get(url).map((res) => res.json());
  }

  
  getProductDetails(productId) {
    this.getDetails(productId).subscribe((res) => {
      const tile = new BrowseProductsModal(res);
      window.localStorage['selectedProduct'] = JSON.stringify(tile);
      if (window.localStorage['levelSelections']) {
        const updateStorage = JSON.parse(window.localStorage['levelSelections']);
        updateStorage.subType.id = tile.product.kalaUniqueId;
        updateStorage.subType.name = tile.product.productName;
        updateStorage.subType.text = tile.product.productName;
        updateStorage.subType.level = '5';
        window.localStorage['levelSelections'] = JSON.stringify(updateStorage);
      }
      //this.route.navigateByUrl('/view-product?productId='+tile.product.kalaUniqueId);
      //this.route.navigateByUrl('/view-product?brandName='+ tile.product.retailerName.replace(/ /g, "-") + '&productName='+ tile.product.productName.replace(/ /g, "-") + '&productId='+tile.product.kalaUniqueId );

      let url = '';
      if(tile.product.attributes != undefined)
      {

      
      if(tile.product.attributes.Brand !=  undefined)
      {
        url ='/view-product?brandName='+ tile.product.attributes.Brand .replace(/ /g, "-") + '&productName='+ tile.product.productName.replace(/ /g, "-") + '&productId='+tile.product.kalaUniqueId;

      }
      else
      {
        url = '/view-product?productName='+ tile.product.productName.replace(/ /g, "-") + '&productId='+tile.product.kalaUniqueId ;
      }
    }
      else
      {
        url = '/view-product?productName='+ tile.product.productName.replace(/ /g, "-") + '&productId='+tile.product.kalaUniqueId ;
      }
      this.route.navigateByUrl(url);
     
    }, (err) => {
      console.log(err);
    });
  }
  goPrevPage() {
    if (this.previousUrl.indexOf('/search-result') > -1) this.route.navigateByUrl('/home');
    // else this.route.navigateByUrl(this.previousUrl);
    else this._location.back();
  }

  deactivateRouteFlag(flag?: boolean) {
    return !flag ? this.deactivateRouteFlagVal = false : this.deactivateRouteFlagVal = true;
  }

  resetAllConvoFlags() {
    this.IsContactKala = false;
    this.IsCheckout = false;
    this.IsTrackOrder = false;
    this.IsElasticSearch = false;
    this.signOutToCUI = false;
    this.IsGetoffers = false;
    this.IsBrowseProduct = false;
    this.signInFromLonge = false;
    this.isGuestCheckout = false;
    //this.signInToCUI = false;
    //this.signUpToCUI = false;
  }
  resetSignInOutFlags()
  {
    this.signInToCUI = false;
    this.signUpToCUI = false;
  }
  resetAllInputFlag() {
    this.inputNewLocation = false;
    this.onlyEmailId = false;
    this.onlyPassword = false;
  }

  scrollIntoConvoView() {
    let element = document.querySelector('.scrollIntoView');
    setTimeout(() => {
      //element.scrollIntoView({ block: "end" });
      window.scrollTo(0, document.querySelector(".scrollIntoView").scrollHeight);
    }, 500)

  }

  getBearerToken() {
    let token = window.localStorage['token'] != undefined ? JSON.parse(JSON.parse(window.localStorage['token']).value) : '';
    return token;
  }

  setHeaders() {
    let header = new Headers({
      Authorization: 'Bearer ' + this.getBearerToken()
    });

    return header;
  }

  setRefereshToken(token) {
    window.localStorage['rf_Token'] = token;
  }

  startTokenValidation() {
    if (window.localStorage['token'] != undefined) this.session = setInterval(() => this.callRefereshIfExpired(), 1000);
    else clearInterval(this.session);
  }

  clearTokenValidation() {
    clearInterval(this.session);
  }

  callRefereshIfExpired() {
    let loggedInTime = new Date(JSON.parse(JSON.parse(window.localStorage['token']).timestamp));
    let currentTime = new Date();
    if (currentTime > loggedInTime) {
      this.clearTokenValidation();
      let refereshToken = window.localStorage['rf_Token'];
      let basicAuth = new BasicAuth();
      let headers: Headers = new Headers({
        'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8;',
        Authorization: `Basic ${basicAuth.encoded}`
      });
      const BASE_URL: string = `${environment.login}/${environment.apis.auth.token}?client_id=${basicAuth.client_id}&grant_type=refresh_token&refresh_token=${refereshToken}`;
      return this.http.post(BASE_URL, null, { headers: headers }).map((res) => res.json()).subscribe((res) => {
        this.refreshingSession = true;
        this.localStorageService.setItem('token', res.access_token, res.expires_in);
        this.setRefereshToken(res.refresh_token);
        this.startTokenValidation();
        setTimeout(() => this.refreshingSession = false, 3000);
      }, (err) => {
        this.refreshingSession = true;
        setTimeout(() => {
          this.refreshingSession = false;
          this.route.navigateByUrl("/logout");
        }, 3000);
      });
    }
  }

  hideSuggesstionList() {
    setTimeout(() => {
      this.suggesstionList = [];
      this.arrowkeyLocation = 0;
    }, 200)
  }

  searchFromText(text, parentName, parentId,levelId, e){
    this.loader_suggestion = false;
    let keyword = document.getElementsByClassName('activeList')[0];
    this.searchBar = text;
    this.search(this.searchBar, parentName, parentId,levelId);
    this.suggesstionList = [];
  }
  searchSuggestion(text, parentName, parentId,levelId, e) {
    let regexCheck = /[ !@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/;
    this.isWithSpecialCharacter = false;
    if (regexCheck.test(text)) this.isWithSpecialCharacter = true;
    this.loader_suggestion = true;
    if (e.keyCode == 13) {
      this.loader_suggestion = false;
      let keyword = document.getElementsByClassName('activeList')[0];
      this.searchBar = text;
      this.search(this.searchBar, parentName, parentId,levelId);
      this.suggesstionList = [];
    }
    else {
      if (e.keyCode != 38 && e.keyCode != 40) this.arrowkeyLocation = 0
      if (text === '') {
        this.loader_suggestion = false;
        this.suggesstionList = [];
      }
      else {
        this.getProductSuggesstion(text).subscribe((res) => {
          if (res.length > 0) {
            this.suggesstionList = new Array<SuggestionList>();
            this.suggesstionList = res.map((item) => new SuggestionList(item.levelId, item.parentId, item.parentName, item.productLevelName, item.productLevelSuggestion, item.type));
            this.resetToDefault = this.suggesstionList.length;
            this.loader_suggestion = false;
          }
          else {
            this.loader_suggestion = false;
            this.suggesstionList = [];
          }
        }, (err) => {
          console.log(err)
        })
      }
    }
  }

  async search(text, parentName, parentId,levelId?:any) {
    this.lastSearch = false;
    this.highestScore = 0;
    if (text !== '' && text !== undefined) {
      text && parentName && parentId ? this.isSearchWithoutSuggestion = false : this.isSearchWithoutSuggestion = true;
      if (this.isSearchWithoutSuggestion) window.localStorage['searchedWithoutSuggestion'] = true;
      else localStorage.removeItem("searchedWithoutSuggestion");
      this.loaderSearch = true;
      this.tilesData = [];
      this.searchBar = text;
      this.isWithSpecialCharacter ? text = text.replace(/[^a-zA-Z0-9 ]/g, "") : text;
      text = text.replace(/ /g, "%20").replace(/&/g, "%26");
      if (parentName) parentName = parentName.replace(/&/g, "%26").replace(/ /g, "%20");
      var response = await this.searchProduct(text, parentName,parentId,levelId, this.esSizeCounter, this.esFromCounter,this.lastSearch,this.highestScore);
      if (response.products.length > 0) {
        this.lastSearch = response.lastSearch;
        this.highestScore = response.highestScore;
        this.tilesData = response.products.map(p => new BrowseProductsModal(p));
        this.filterIamgeURL();
        this.getMainImage();
        this.esKey.next(this.tilesData);
        this.suggesstionList = [];
        window.localStorage['esKeyword'] = JSON.stringify({ text: text, parentName: parentName, parentId: parentId ,levelId:levelId});
        let url ="/elastic-product?search="+text.replace(/%20/g, '-');
        this.route.navigateByUrl('/', {skipLocationChange: true})
          .then(()=>this.route.navigateByUrl(url));
        //this.route.navigateByUrl("/elastic-product?search="+text.replace(/%20/g, '-'));
        this.loaderSearch = false;
      }
      else {
        this.loaderSearch = false;
        this.searchBar = '';
        this.productNotFound = true;
      }
      localStorage.removeItem("levelSelections");
    }
  }

  

  getProductSuggesstion(text) {
    this.isWithSpecialCharacter ? text = text.replace(/[^a-zA-Z0-9 ]/g, "") : text;
    const url: string = `${environment.productList}/${environment.apis.products.typeAhead}/${text}`;
    return this.http.get(url).map((res) => res.json());
  }

  focusSearchBar() {
    let sb = document.getElementsByClassName('esSearchBar')[0] as HTMLElement;
    sb.focus();
  }

  clearAllStorage() {
    localStorage.removeItem("token");
    localStorage.removeItem("userInfo");
    localStorage.removeItem("browseProductSearch");
    localStorage.removeItem("existingItemsInCart");
    localStorage.removeItem("existingItemsInWishList");
    localStorage.removeItem("levelSelections");
    localStorage.removeItem("selectedProduct");
    localStorage.removeItem("TotalAmount");
    localStorage.removeItem("savedInterest");
    localStorage.removeItem('rf_Token');
    localStorage.removeItem('esKeyword');
    localStorage.removeItem('searchProducts');
    localStorage.removeItem('searchedWithoutSuggestion');
    localStorage.removeItem('fromES');
    localStorage.removeItem('forReview');
  }

  zoomInSlider() {
    this.isSliderZoomedIn = true;
  }

  closeZoomInSlider() {
    this.isSliderZoomedIn = false;
  }

  validateUser(userId) {
    this.clearUser();
    this.hideUserInfo(true);
    if (localStorage.getItem('userInfo')) {
      const usr = new UserProfile(JSON.parse(localStorage.getItem('userInfo')));
      // if (usr && usr.isConsumer && usr.userId === userId) {
      if (usr && usr.userId === userId) {
        this.setUser(usr);
        return true;
      }
      else return false;
    }
    else return false;
  }

  clearStorageUserInfo() {
    localStorage.removeItem('userInfo');
  }

  redirectTo(pageName: string) {
    if (!localStorage.getItem('userInfo')) {
      window.localStorage['tbnAfterLogin'] = pageName;
      this.route.navigateByUrl('/login');
    } else {
      this.route.navigateByUrl('/' + pageName);
    }
  }
  getUserInfoOnLoadCall(userId) {
    const url: string = `${environment.profileInterest}/${environment.apis.profileInterest.userDataOnLoad}/${userId}`;
    return this.http.get(url, { headers: this.setHeaders() }).map((res) => res.json());
  }
  getUserInfoOnLoad(userId) {
    this.getUserInfoOnLoadCall(userId).subscribe((res) => {
      window.localStorage['userInfo'] = JSON.stringify(res);
    }, (err) => {
      console.log(err);
    });
  }
  getOfferMakeAnOffer(productId,userId,attempts,offerPrice = 0,checkOfferExistBefore) {
    const url: string = `${environment.makeOfferList}/${environment.apis.products.makeAnOffer}?productId=${productId}&userId=${userId}&offerPrice=${offerPrice}&checkOfferExistBefore=${checkOfferExistBefore}`;
    return this.http.get(url, { headers: this.setHeaders() }).map((res) => res.json());
  }
  searchProductCarousel(url:any)
  {
    return this.http.get(url).toPromise().then((res) => res.json());
    //return this.http.get(url, { headers: this.setHeaders() }).map((res) => res.json());
  }
  closeAskKala()
  {
    this.showaskKalaConveration = ! this.showaskKalaConveration;
  }
  // getPriceRange(id,searchTerm?,parentName?,parentId?, )
  // {
  //   let url = '';
  //   if((id == undefined || id == null) && searchTerm != undefined)
  //   {
  //     url = `${environment.productList}/${environment.apis.products.priceRange}?searchTerm=${searchTerm}`;
  //   } 
  //   else if(id != undefined && searchTerm == undefined)
  //   {
  //     url = `${environment.productList}/${environment.apis.products.priceRange}/${id}?`;
  //   }
  //   else if(id != undefined && searchTerm != undefined && parentName != undefined)
  //   {
  //     url = `${environment.productList}/${environment.apis.products.priceRange}/${id}?searchTerm=${searchTerm}&parentName=${parentName}`;
  //   }   
  //   return this.http.get(url).toPromise().then((res) => res.json());
  // }
  getPriceRange(levelId,searchTerm?,parentName?,parentId?,freeFormText?)
{
let url = '';
if((levelId == undefined || levelId == null) && searchTerm != undefined && parentName != undefined)
{
if(freeFormText != undefined)
{
url = `${environment.productList}/${environment.apis.products.priceRange}/${parentId}?searchTerm=${(searchTerm)}&parentName=${(parentName)}&freeFormText=${(freeFormText)}`;
}
else
{
url = `${environment.productList}/${environment.apis.products.priceRange}/${parentId}?searchTerm=${(searchTerm)}&parentName=${(parentName)}`;
}
}
else if(levelId != undefined && searchTerm != undefined && parentName != undefined)
{
if(freeFormText != undefined)
{
url = `${environment.productList}/${environment.apis.products.priceRange}/${parentId}?searchTerm=${(searchTerm)}&levelId=${levelId}&parentName=${(parentName)}&freeFormText=${(freeFormText)}`;
}
else
{
url = `${environment.productList}/${environment.apis.products.priceRange}/${parentId}?searchTerm=${(searchTerm)}&levelId=${levelId}&parentName=${(parentName)}`;
}
}
else if((levelId == undefined || levelId == null) && searchTerm != undefined)
{
if(freeFormText != undefined)
{
url = `${environment.productList}/${environment.apis.products.priceRange}?searchTerm=${(searchTerm)}&freeFormText=${(freeFormText)}`;
}
else
{
url = `${environment.productList}/${environment.apis.products.priceRange}?searchTerm=${(searchTerm)}`;
}
}
else if(levelId != undefined && searchTerm == undefined)
{
if(freeFormText != undefined)
{
url = `${environment.productList}/${environment.apis.products.priceRange}/${levelId}?freeFormText=${(freeFormText)}`;
}
else
{
url = `${environment.productList}/${environment.apis.products.priceRange}/${levelId}?`;
}
}
return this.http.get(url).toPromise().then((res) => res.json());
}
  getBannerProducts(fromBanner,ids, size, from) {
    let url ='';
    let levelIdsStr='';
    let bIds= ids.split('|');
    for (var i = 0; i < bIds.length; i++) {
      levelIdsStr+="&levelId="+bIds[i];
    }
    url = `${environment.productList}/${environment.apis.products.getpromotionalBannerProduts}?size=${size}&from=${from}${levelIdsStr}`;
    return this.http.get(url).toPromise().then((res) => res.json());
  }
  removeWithoutLogClass()
  {
    var header = document.getElementsByClassName("withoutLog");
    if(header.length !=0)
    {
      header[0].classList.remove("withoutLog");
    }
  }

  // searchProduct(text, parentName,parentId,levelId, size, from, lastSearch?:any,highestScore?:any) {
  //   let url ='';
  //   if(parentId == null)
  //   {
  //     url = `${environment.productList}/${environment.apis.products.search}?type=${text}&parentName=${parentName}&parentId=${parentId}&levelId=${levelId}&size=${size}&from=${from}&lastSearch=${lastSearch}&highestScore=${highestScore}`;
  //   }
  //   else
  //   {
  //     url = `${environment.productList}/${environment.apis.products.search}/${parentId}/?type=${text}&parentName=${parentName}&parentId=${parentId}&levelId=${levelId}&size=${size}&from=${from}&lastSearch=${lastSearch}&highestScore=${highestScore}`;
  //   }
    
  //   return this.http.get(url).toPromise().then((res) => res.json());
  // }
  searchProduct(text, parentName,parentId,levelId, size, from, lastSearch?:any,highestScore?:any) {
    let url ='';
    if(parentId == null)
    {
    url = `${environment.productList}/${environment.apis.products.search}?type=${text}&size=${size}&from=${from}&lastSearch=${lastSearch}&highestScore=${highestScore}&freeFormText=${(true)}`;
    }
    else if(parentId != null && levelId != null)
    {
    url = `${environment.productList}/${environment.apis.products.search}/${parentId}/?type=${text}&parentName=${parentName}&parentId=${parentId}&levelId=${levelId}&size=${size}&from=${from}&lastSearch=${lastSearch}&highestScore=${highestScore}&freeFormText=${(false)}`;
    }
    else if(levelId == null && parentId != null)
    {
    url = `${environment.productList}/${environment.apis.products.search}/${parentId}/?type=${text}&parentName=${parentName}&parentId=${parentId}&size=${size}&from=${from}&lastSearch=${lastSearch}&highestScore=${highestScore}&freeFormText=${(false)}`;
    }
    return this.http.get(url).toPromise().then((res) => res.json());
    }

  // searchProduct(text, parentName,parentId,levelId, size, from) {
  //   let url :string;
  //   if(parentId == null)
  //   {
  //     url = `${environment.productList}/${environment.apis.products.search}?type=${text}&parentName=${parentName}&parentId=${parentId}&levelId=${levelId}&size=${size}&from=${from}`;
  //   }
  //   else
  //   {
  //     url = `${environment.productList}/${environment.apis.products.search}/${parentId}/?type=${text}&parentName=${parentName}&parentId=${parentId}&levelId=${levelId}&size=${size}&from=${from}`;
  //   }
  //   return this.http.get(url).toPromise().then((res) => res.json());
  // }

  disableNtFoundFlag() {
    this.productNotFound = false;
  }

  
  
}
