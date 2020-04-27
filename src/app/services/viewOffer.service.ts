import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';
import { environment } from '../../environments/environment';
import { CoreService } from './core.service';

@Injectable()
export class ViewOfferService {
    private BASE_URL: string = environment.profileInterestPublic;
    constructor(private http: Http, private core: CoreService) { }

    getReviews(productId) {
        const url: string = `${this.BASE_URL}/${environment.apis.profileInterest.getProductReviews}?page=0&size=10&sortOrder=asc&elementType=createdDate&productId=${productId}`;
        return this.http.get(url).map((res) => res.json());
    }

    getReviewsSummary(productId) {
        const url: string = `${this.BASE_URL}/${environment.apis.profileInterest.productReviewSummary}/${productId}`;
        return this.http.get(url).map((res) => res.json());
    }

    getRetailerPolicy(retailerId) {
        const BASE_URL: string = environment.shippingMethod;
        const url: string = `${BASE_URL}/retailer/v1/public/${retailerId}/${environment.apis.shippingMethod.retailerPolicy}`;
        return this.http.get(url).map((res) => res.json());
    }

    getItBy(shippingProfileId) {
        const BASE_URL: string = environment.shippingMethod;
        const url: string = `${BASE_URL}/retailer/v1/public/${shippingProfileId}/${environment.apis.shippingMethod.latestShipMethodName}`;
        return this.http.get(url).map((res) => res.text());
    }

   
    declineOffer(offerId, productId) {
        const BASE_URL: string = environment.profileInterest;
        const url: string = `${BASE_URL}/offers/${offerId}/products/${productId}`;
        return this.http.delete(url, { headers: this.core.setHeaders() }).map((res) => res.text())
    }
}