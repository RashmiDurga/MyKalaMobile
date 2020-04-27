import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { CoreService } from '../../services/core.service';
import { MyOffersService } from '../../services/myOffer.service';
import { Router, RouterOutlet } from '@angular/router';
import { environment } from '../../../environments/environment';
import { BrowseProductsModal } from '../../models/browse-products';
import { SearchDataModal } from '../../models/searchData.modal';

@Component({
  selector: 'app-myoffers',
  templateUrl: './myoffers.component.html',
  styleUrls: ['./myoffers.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class MyoffersComponent implements OnInit {
  userData: any;
  myOffersDetails = [];
  loader: boolean = false;
  startDate: {};
  s3: any;
  remainingTime: any;
  getOffersData: any;
  getOffersDataAttr = [];
  noOffer: any;
  constructor(
    public core: CoreService,
    private myOffer: MyOffersService,
    private route: Router,
    private routerOutlet: RouterOutlet
  ) { }

   ngOnInit() {
    this.core.checkIfLoggedOut(); /*** If User Logged Out*/
    this.core.hide();
    this.core.searchMsgToggle();
    this.core.LoungeShowHide();
    this.core.footerSwap();
    let appFooter = document.getElementsByClassName("footer")[0];
    appFooter.classList.remove("hideFooter");
    this.userData = JSON.parse(window.localStorage['userInfo']);
    localStorage.removeItem("offerIdForEdit");
    if (window.localStorage['getOffers'] != undefined) this.getOffersData = JSON.parse(window.localStorage['getOffers']);
    //this.getOffersDataFn() //Temperaroy based on the confirm result
    this.getOffers(); //Enable once get offers algorithm is implemented
    this.s3 = environment.s3;
  }

  getOffersDataFn() {
    for (var key in this.getOffersData.getOffersRequestDTO.attributes) {
      if (key == "Zipcode" || key == "DeliveryMethod") { }
      else {
        this.getOffersDataAttr.push({
          key: key,
          values: this.getOffersData.getOffersRequestDTO.attributes[key]
        })
      }
    }
    this.getOffersData.getOffersRequestDTO.attributes['getOffersDataAttr'] = [];
    this.getOffersData.getOffersRequestDTO.attributes['getOffersDataAttr'] = this.getOffersDataAttr;
    let objDate = new Date(this.getOffersData.getOffersRequestDTO.startDate), locale = "en-us", month = objDate.toLocaleString(locale, { month: "long" });
    this.getOffersData.getOffersRequestDTO.startDate = objDate.toLocaleString(locale, { month: "short" }) + ' ' + objDate.getDate() + ', ' + this.formatAMPM(objDate);
    this.calculateTimeLeft(this.getOffersData.getOffersRequestDTO);
  }

  getOffers() {
    this.loader = true;
    let userId = this.userData.userId
    this.myOffer.loadOffers(userId).subscribe((res) => {
      console.log(res);
      this.loader = false;
      let filteredRes = [];
      for (var i = 0; i < res.length; i++) {
        if (res[i].getOffersResponse.length > 0) filteredRes.push(res[i])
      }
      res = filteredRes;
      this.myOffersDetails = res;
      this.filterIamgeURL(res);
      this.getMainImage(res);
      this.refineAttributes();
      for (var i = 0; i < this.myOffersDetails.length; i++) {
        if (this.myOffersDetails[i].getOffersRequestDTO.startDate.indexOf("+") > -1) {

          this.myOffersDetails[i].getOffersRequestDTO.startDate = this.myOffersDetails[i].startDate.split("+")[0]
          console.log("after if", this.myOffersDetails[i].getOffersRequestDTO.startDate);
        }
        if (this.myOffersDetails[i].getOffersRequestDTO.endDate.indexOf("+") > -1) {

          this.myOffersDetails[i].getOffersRequestDTO.endDate = this.myOffersDetails[i].endDate.split("+")[0]
          console.log("after if end date", this.myOffersDetails[i].getOffersRequestDTO.endDate);
        }
        this.myOffersDetails[i].getOffersRequestDTO.endDate =new Date(this.myOffersDetails[i].getOffersRequestDTO.endDate );
        console.log("end date", this.myOffersDetails[i].getOffersRequestDTO.endDate );
        let objDate = new Date(this.myOffersDetails[i].getOffersRequestDTO.startDate), locale = "en-us", month = objDate.toLocaleString(locale, { month: "long" });
        console.log("oibjdt", objDate);
        this.myOffersDetails[i].getOffersRequestDTO.startDate = objDate.toLocaleString(locale, { month: "short" }) + ' ' + objDate.getDate() + ', ' + this.formatAMPM(objDate);

        this.calculateTimeLeft(this.myOffersDetails[i].getOffersRequestDTO);
      }
      this.myOffersDetails.sort(function (a, b) {
        var nameA = a.startDate, nameB = b.startDate
        if (nameA < nameB) return -1
        if (nameA > nameB) return 1
        return 0
      });
    });
  }

  filterIamgeURL(res) {
    for (var i = 0; i < res.length; i++) {
      for (var j = 0; j < res[i].getOffersResponse.length; j++) {
        if (res[i].getOffersResponse[j].product.productImages) {
          for (var k = 0; k < res[i].getOffersResponse[j].product.productImages.length; k++) {
            let product = res[i].getOffersResponse[j].product.productImages[k];
            if (product.location.indexOf('data:') === -1 && product.location.indexOf('https:') === -1 && product.location.indexOf('http:') === -1) {
              res[i].getOffersResponse[j].product.productImages[k].location = this.s3 + product.location;
            }
            if (product.location.indexOf('maxHeight') > -1) {
              res[i].getOffersResponse[j].product.productImages[k].location = product.location.split(";")[0];
            }
          }
        }
      }
    }
  }

  getMainImage(res) {
    for (var i = 0; i < res.length; i++) {
      for (var j = 0; j < res[i].getOffersResponse.length; j++) {
        if (res[i].getOffersResponse[j].product.productImages) {
          for (var k = 0; k < res[i].getOffersResponse[j].product.productImages.length; k++) {
            let product = res[i].getOffersResponse[j].product.productImages[k]
            if (product.mainImage == true) res[i].getOffersResponse[j].product.mainImageSrc = product.location
          }
        }
      }
    }
  }

  refineAttributes() {
    for (var i = 0; i < this.myOffersDetails.length; i++) {
      this.getOffersDataAttr = [];
      if (this.myOffersDetails[i].getOffersRequestDTO.attributes != null) {
        for (var key in this.myOffersDetails[i].getOffersRequestDTO.attributes) {
          if (key == "Zipcode" || key == "DeliveryMethod") { }
          else {
            this.getOffersDataAttr.push({
              key: key,
              values: this.myOffersDetails[i].getOffersRequestDTO.attributes[key]
            })
          }
        }
        this.myOffersDetails[i].getOffersRequestDTO.attributes = this.getOffersDataAttr;
      }
    }
  }

  formatAMPM(date) {
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? '0' + minutes : minutes;
    var strTime = hours.toString() + ':' + minutes.toString() + ' ' + ampm;
    return strTime;
  }

  calculateTimeLeft(Obj) {
   // if (Obj.endDate.indexOf("+") > -1) Obj.endDate = Obj.endDate.split("+")[0]
    var deadline = new Date(Obj.endDate).getTime();
    var x = setInterval(function () {
      var now = new Date().getTime();
      var t = deadline - now;
      var days = Math.floor(t / (1000 * 60 * 60 * 24));
      var hours = Math.floor((t % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      var minutes = Math.floor((t % (1000 * 60 * 60)) / (1000 * 60));
      var seconds = Math.floor((t % (1000 * 60)) / 1000);
      if (t < 0) {
        clearInterval(x);
        Obj.remainingTime = "EXPIRED";
      }
      else Obj.remainingTime = days.toString() + "d " + hours.toString() + "h " + minutes.toString() + "m " + seconds.toString() + "s ";
    }, 1000);
  }

  editOffer(offer) {
    window.localStorage['offerIdForEdit'] = offer.offerID;
    setTimeout(() => {
      if (this.routerOutlet.isActivated) this.routerOutlet.deactivate();
      /** LevelSelection Storage Creation */
      let place = [], category = [], subcategory = [], levelSelection;
      place = new Array<SearchDataModal>();
      category = new Array<SearchDataModal>();
      place.push(new SearchDataModal(offer.getOffersRequestDTO.placeId, offer.getOffersRequestDTO.placeName, offer.getOffersRequestDTO.placeName, "1"));
      category.push(new SearchDataModal(offer.getOffersRequestDTO.categoryId, offer.getOffersRequestDTO.categoryName, offer.getOffersRequestDTO.categoryName, "2"));
      subcategory.push(new SearchDataModal(offer.getOffersRequestDTO.subCategoryId, offer.getOffersRequestDTO.subCategoryName, offer.getOffersRequestDTO.subCategoryName, "3"));
      if (window.localStorage['levelSelections'] == undefined) levelSelection = new Object();
      else levelSelection = JSON.parse(window.localStorage['levelSelections']);
      levelSelection.place = place[0];
      levelSelection.category = category[0];
      levelSelection.subcategory = subcategory[0];
      levelSelection.subType = {};
      levelSelection.type = [];
      window.localStorage['levelSelections'] = JSON.stringify(levelSelection);
      /** LevelSelection Storage Creation */
      this.core.IsGetoffers = true;
      this.route.navigateByUrl('/search-result');
    }, 1000);
  }

  endOffer(offer) {
    this.myOffer.endOffer(offer.offerID).subscribe((res) => {
      this.getOffers();
    })
  }

  viewOfferDetails(product, offerID) {
    product.product.kalaPrice = product.offerPrice;
    let selectedProduct = new BrowseProductsModal(product.product);
    window.localStorage['selectedProduct'] = JSON.stringify({ selectedProduct: selectedProduct, offerId: offerID });
    this.core.offersDetailFlag = true;

    this.route.navigateByUrl("/view-offer?productId="+ selectedProduct.product.kalaUniqueId);
  }

}
