import { Component, OnInit, ViewEncapsulation, ElementRef, ViewChild } from '@angular/core';
import { CoreService } from '../../services/core.service';
import { Router, RouterOutlet } from '@angular/router';
import { environment } from '../../../environments/environment';
import { MyAlertsService } from '../../services/MyNewsAlertsService';
import { MyOrdersService } from '../../services/myorder.service';

@Component({
  selector: 'app-my-news-alerts',
  templateUrl: './my-news-alerts.component.html',
  styleUrls: ['./my-news-alerts.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class MyNewsAlertsComponent implements OnInit {
  userData: any;
  s3: any;
  loader: boolean = false;
  loaderShowMore: boolean = false;
  pageCounter = 0;
  sizeCounter = 10;
  enableShowMore: boolean = false;
  alerts: Array<any>;
  IsUserLoggedIn: boolean = false;
  alertSubscribed: boolean = false;
  @ViewChild('productAlreadyReviewed') productAlreadyReviewed: ElementRef;
  @ViewChild('freightOrderModal') freightOrderModal: ElementRef;
  @ViewChild('canttrackModal') canttrackModal: ElementRef;
  
  constructor(
    public core: CoreService,
    private myalerts: MyAlertsService,
    private route: Router,
    private routerOutlet: RouterOutlet,
    private myorder: MyOrdersService
  ) { }

  ngOnInit() {
    this.core.checkIfLoggedOut(); /*** If User Logged Out*/
    this.core.hide();
    this.core.searchMsgToggle();
    this.core.LoungeShowHide();
    this.core.footerSwap();
    let appFooter = document.getElementsByClassName("footer")[0];
    appFooter.classList.remove("hideFooter");
    if (window.localStorage['userInfo'] != undefined) {
      this.userData = JSON.parse(window.localStorage['userInfo']);
      this.IsUserLoggedIn = true;
      this.s3 = environment.s3;
      this.loadAllAlerts();
    }
    else this.IsUserLoggedIn = false;
    //this.loadOffers();
  }

  loadAllAlerts(from?: string) {
    this.loader = true;
    this.myalerts.checkSubscription(this.userData.userId).subscribe((res) => {
      res == 'true' ? this.alertSubscribed = true : this.alertSubscribed = false;
      this.myalerts.loadAllAlerts(this.userData.userId, this.pageCounter, this.sizeCounter).subscribe((res) => {
        this.loader = false;
        if (res.totalPages > 1) this.enableShowMore = true;
        this.alerts = res.content;
        this.filterImageURL();
        this.getMainImage();
      }, (err) => {
        console.log("Error from Load All Alerts")
      })
    }, (err) => {
      console.log("Error from Check Alert Subscription API")
    })
  }

  loadMore() {
    this.loaderShowMore = true;
    this.pageCounter++;
    this.myalerts.loadAllAlerts(this.userData.userId, this.pageCounter, this.sizeCounter).subscribe((res) => {
      this.loaderShowMore = false;
      if ((res.totalPages - 1) > this.pageCounter) this.enableShowMore = true;
      else this.enableShowMore = false;
      this.alerts = [...this.alerts, ...res.content];
      this.filterImageURL();
      this.getMainImage();
    }, (err) => {
      console.log("Error from Load More")
    })
  }

  updateAlert(alert, from) {
    let newAlerts = [];
    alert.alertRead = true;
    newAlerts.push(alert)
    this.myalerts.updateAlerts(newAlerts).subscribe((res) => {
      if (from == 'offer') this.route.navigateByUrl('/app-myoffers');
      else if (from == 'review') this.core.getProductDetails(alert.reviewedProductId);
      else if (from == 'order') {
        /* Uncomment when using DEV Environment 
        alert.orderItems.carrier = 'shippo';
        alert.orderItems.shipTrackingId = 'SHIPPO_TRANSIT';
        */
       if(alert.orderItems.shipmentClass=='Freight')
       {
        this.core.openModal(this.freightOrderModal);
       }
       else
       {
        this.myalerts.trackOrder(alert.orderItems.carrier, alert.orderItems.shipTrackingId, alert.orderItems.productId).subscribe((res) => {
          this.core.IsTrackOrder = false;
          window.localStorage['productForTracking'] = JSON.stringify({ modal: alert, order: alert.orderItems, goShippoRes: res });
         if(res.address_to==null)
         {
          this.core.openModal(this.canttrackModal);
         }
         else
         {
          this.route.navigateByUrl("/app-track-order");
         }
        }, (err) => {
          console.log(err);
        })
      }
      }
      else {
        let modal = { purchasedDate: alert.purchasedDate, orderId: alert.orderId };
        this.myorder.getOrderReviewStatus(alert.orderId, alert.orderItems.productId).subscribe((res) => {
          if (res === '') {
            window.localStorage['forReview'] = JSON.stringify({ modal: modal, order: alert.orderItems, from: 'NA' });
            this.route.navigateByUrl("/app-leave-review");
          }
          else {
            this.core.getProductDetails(alert.orderItems.productId);
            this.core.openModal(this.productAlreadyReviewed);
          }
        }, (err) => console.log(err));
      }
    }, (err) => {
      console.log("Error while updating alerts")
    })
  }

  filterImageURL() {
    for (var i = 0; i < this.alerts.length; i++) {
      if (this.alerts[i].alertType == 'OFFER') {
        for (var j = 0; j < this.alerts[i].offerResponse.length; j++) {
          for (var k = 0; k < this.alerts[i].offerResponse[j].product.productImages.length; k++) {
            let product = this.alerts[i].offerResponse[j].product.productImages[k];
            if (product.location.indexOf('data:') === -1 && product.location.indexOf('https:') === -1 && product.location.indexOf('http:') === -1) {
              this.alerts[i].offerResponse[j].product.productImages[k].location = this.s3 + product.location;
            }
            if (product.location.indexOf('maxHeight') > -1) {
              this.alerts[i].offerResponse[j].product.productImages[k].location = product.location.split(";")[0];
            }
          }
        }
      }
    }
  }

  getMainImage() {
    for (var i = 0; i < this.alerts.length; i++) {
      if (this.alerts[i].alertType == 'OFFER') {
        for (var j = 0; j < this.alerts[i].offerResponse.length; j++) {
          for (var k = 0; k < this.alerts[i].offerResponse[j].product.productImages.length; k++) {
            let product = this.alerts[i].offerResponse[j].product.productImages[k]
            if (product.mainImage == true) {
              this.alerts[i].offerResponse[j].product.mainImageSrc = product.location
            }
          }
        }
      }
    }
  }

  getTotaPrice(priceWithQuantity, productTaxCost, shippingCost) {
    return eval(`${priceWithQuantity + productTaxCost + shippingCost}`);
  }

  loopNumber(number, from) {
    if (from == 'offers') return Array(number).fill(number)
    else return Array(parseFloat(number)).fill(parseFloat(number))
  }

  getFullDate(date) {
    if (typeof date != 'number' && date.indexOf("+") > -1) date = date.split("+")[0];
    let objDate = new Date(date), locale = "en-us", month = objDate.toLocaleString(locale, { month: "long" });
    return objDate.toLocaleString(locale, { month: "long" }) + ' ' + objDate.getDate() + ', ' + this.formatAMPM(objDate);
  }

  getDeliveryDate(deliveryMethod, purchaseDate) {
    if (typeof purchaseDate != 'number' && purchaseDate.indexOf("+") > -1) purchaseDate = purchaseDate.split("+")[0];
    let weekday = new Array("Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday")
    // Express: 3 to 5 business days Delivery
    if (deliveryMethod == 'Express: 3 to 5 business days') {
      let date = new Date(purchaseDate), locale = "en-us", month = date.toLocaleString(locale, { month: "long" });
      let getDay = new Date(date.getTime() + 120 * 60 * 60 * 1000); //Calculating on the next 5days basis
      return weekday[getDay.getDay()] + ', ' + getDay.toLocaleString(locale, { month: "long" }) + ' ' + (getDay.getDate())
    }
    // 2 day: 2 business day shipping days Delivery
    else if (deliveryMethod == '2 day: 2 business day shipping') {
      let date = new Date(purchaseDate), locale = "en-us", month = date.toLocaleString(locale, { month: "long" });
      let getDay = new Date(date.getTime() + 48 * 60 * 60 * 1000); //Calculating on the next 5days basis
      return weekday[getDay.getDay()] + ', ' + getDay.toLocaleString(locale, { month: "long" }) + ' ' + (getDay.getDate())
    }
    // Standard: 5 to 8 business days Delivery
    else if (deliveryMethod == 'Standard: 5 to 8 business days') {
      let date = new Date(purchaseDate), locale = "en-us", month = date.toLocaleString(locale, { month: "long" });
      let getDay = new Date(date.getTime() + 192 * 60 * 60 * 1000); //Calculating on the next 5days basis
      return weekday[getDay.getDay()] + ', ' + getDay.toLocaleString(locale, { month: "long" }) + ' ' + (getDay.getDate())
    }
    else if(deliveryMethod.indexOf('Custom')> -1 ) {
      let maxDay = deliveryMethod.substr(deliveryMethod.length -3,2).replace('(','');
      let date = new Date(purchaseDate), locale = "en-us", month = date.toLocaleString(locale, { month: "long" });
      let getDay = new Date(date.getTime() + (parseInt(maxDay) *24) * 60 * 60 * 1000); //Calculating on the next 5days basis
      return weekday[getDay.getDay()] + ', ' + getDay.toLocaleString(locale, { month: "long" }) + ' ' + (getDay.getDate())
    
    }
    // Next day: 1 business day shipping
    else {
      let date = new Date(purchaseDate), locale = "en-us", month = date.toLocaleString(locale, { month: "long" });
      let getDay = new Date(date.getTime() + 24 * 60 * 60 * 1000); //Calculating on the next 5days basis
      return weekday[getDay.getDay()] + ', ' + getDay.toLocaleString(locale, { month: "long" }) + ' ' + (getDay.getDate())
    }
  }

  formatAMPM(date) {
    date = new Date(date);
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? '0' + minutes : minutes;
    var strTime = hours + ':' + minutes + ' ' + ampm;
    return strTime;
  }

}