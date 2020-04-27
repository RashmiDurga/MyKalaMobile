import { Component, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { } from '@types/googlemaps';
import { CoreService } from '../../services/core.service';
import { Router } from '@angular/router';
import { Ng4LoadingSpinnerModule, Ng4LoadingSpinnerService, Ng4LoadingSpinnerComponent } from 'ng4-loading-spinner';

@Component({
  selector: 'app-track-order',
  templateUrl: './track-order.component.html',
  styleUrls: ['./track-order.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class TrackOrderComponent implements OnInit {
  @ViewChild('gmap') gmapElement: any;
  map: google.maps.Map;
  selectedOrder: any;
  markers = [];
  getMarkersForMap = [];
  loader: boolean = true;
  template: string = `<img src="./assets/images/kalaLoader.svg" class="custom-spinner-template" alt="Kala Loader">`;
  constructor(
    public core: CoreService,
    private route: Router, private ng4LoadingSpinnerService: Ng4LoadingSpinnerService
  ) { }

  ngOnInit() {
    this.ng4LoadingSpinnerService.show();
    this.core.checkIfLoggedOut(); /*** If User Logged Out*/
    this.core.hide();
    this.core.searchMsgToggle();
    let appFooter = document.getElementsByClassName("footer")[0];
    appFooter.classList.remove("hideFooter");
    this.selectedOrder = JSON.parse(window.localStorage['productForTracking']);
    console.log(this.selectedOrder);
    this.getAddress();
    setTimeout(() => {
      this.loadMap();
      this.ng4LoadingSpinnerService.hide();
    }, 4000);
  }

  getAddress() {
    let Cordinates = [];
    let geocoder = new google.maps.Geocoder();
    let goShippo = this.selectedOrder.goShippoRes;
    for (var key in goShippo) {
      if (key == 'address_from' || key == 'address_to' && goShippo[key] != null) {
        this.getMarkersForMap.push(`${goShippo[key].city},${goShippo[key].state},${goShippo[key].country},${goShippo[key].zip}`)
      }
    }
    for (var i = 0; i < this.getMarkersForMap.length; i++) {
      if (geocoder) {
        geocoder.geocode({
          'address': this.getMarkersForMap[i]
        }, function (results, status) {
          if (status == google.maps.GeocoderStatus.OK) {
            Cordinates.push({ location: [results[0].geometry.location.lat(), results[0].geometry.location.lng()] })
          }
        });
      }
    }
    setTimeout(() => {
      window.localStorage['Cordinates'] = JSON.stringify(Cordinates)
    }, 3000)
  }

  loadMap() {
    var directionsDisplay = new google.maps.DirectionsRenderer();
    var directionsService = new google.maps.DirectionsService();
    var labels = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    var labelIndex = 0;
    const mapOptions = {
      center: new google.maps.LatLng(37.09024, -95.71289100000001),
      zoom: 10
    }
    const map = new google.maps.Map(document.getElementById("map"), mapOptions);
    const trackingPosition = JSON.parse(window.localStorage['Cordinates']);
    for (var position of trackingPosition) {
      let marker = new google.maps.Marker({
        map: map,
        animation: google.maps.Animation.DROP,
        label: labels[labelIndex++ % labels.length],
        position: new google.maps.LatLng(position.location[0], position.location[1]),
      })
    }
    directionsDisplay.setMap(map);
    var start = new google.maps.LatLng(trackingPosition[0].location[0], trackingPosition[0].location[1]);
    var end = new google.maps.LatLng(trackingPosition[1].location[0], trackingPosition[1].location[1]);
    var request = {
      origin: start,
      destination: end,
      travelMode: google.maps.TravelMode.DRIVING
    };
    var bounds = new google.maps.LatLngBounds();
    bounds.extend(start);
    bounds.extend(end);
    map.fitBounds(bounds);
    var request = {
      origin: start,
      destination: end,
      travelMode: google.maps.TravelMode.DRIVING
    };
    this.loader = false;
    directionsService.route(request, function (response, status) {
      if (status == google.maps.DirectionsStatus.OK) {
        directionsDisplay.setDirections(response);
        directionsDisplay.setMap(map);
      } else {
        alert("Directions Request from " + start.toUrlValue(6) + " to " + end.toUrlValue(6) + " failed: " + status);
      }
    });
    localStorage.removeItem("Cordinates");
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

  getPurchaseDate(date) {
    let objDate = new Date(date), locale = "en-us", month = objDate.toLocaleString(locale, { month: "long" });
    return objDate.toLocaleString(locale, { month: "short" }) + ' ' + objDate.getDate() + ', ' + this.formatAMPM(objDate);
  }

  formatAMPM(date) {
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
