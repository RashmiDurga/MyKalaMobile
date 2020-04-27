import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';
import { CoreService } from './core.service';
@Injectable()
export class CheckoutService {
    private BASE_URL_ORDER: string = environment.checkout;
    private BASE_URL_CARD: string = environment.card;
    private BASE_URL_RETAILER: string = environment.shippingMethod;
    constructor(private http: Http, private auth: AuthService, private core: CoreService) { }

    addCard(stripeAddCard) {
        this.auth.getUserInfo({});
        const url: string = `${this.BASE_URL_CARD}/${environment.apis.consumerCheckout.addCard}`;
        return this.http.post(url, stripeAddCard, { headers: this.core.setHeaders() }).map((res) => res.json());
    }

    getShippingAddress(userId) {
        const BASE_URL: string = environment.profileInterestPublic;
        const url: string = `${BASE_URL}/userId/${userId}`;
        return this.http.get(url).map(res => res.json());
    }

    getCards(userId) {
        const url: string = `${this.BASE_URL_CARD}/${userId}/${environment.apis.consumerCheckout.getCards}`;
        return this.http.get(url, { headers: this.core.setHeaders() }).map((res) => res.json());
    }

    updateCard(stripeAddCard) {
        const url: string = `${this.BASE_URL_CARD}/${environment.apis.consumerCheckout.updateCard}`;
        return this.http.post(url, stripeAddCard, { headers: this.core.setHeaders() }).map((res) => res.json());
    }

    deleteCard(customerId, cardId) {
        const url: string = `${this.BASE_URL_CARD}/${customerId}/${cardId}/${environment.apis.consumerCheckout.deleteCard}`;
        return this.http.delete(url, { headers: this.core.setHeaders() }).map((res) => res.text());
    }

    chargeAmount(productCheckout) {
        const url: string = `${this.BASE_URL_ORDER}/${environment.apis.consumerCheckout.orderPayment}`;
        return this.http.post(url, productCheckout, { headers: this.core.setHeaders() }).toPromise().then(res => res.text());
    }

    getShippingMethods(shippingProfileState, shippingProfileId, productQuantity, productWeight, productPrice, productLength, productHeight, productWidth) {
        const BASE_URL: string = environment.shippingMethod;
        const url: string = `${BASE_URL}/${environment.apis.shippingMethod.method}/shippingMethods?locationName=${shippingProfileState}&shippingProfileId=${shippingProfileId}&productQuantity=${productQuantity}&productWeight=${productWeight}&productPrice=${productPrice}&productLength=${productLength}&productHeight=${productHeight}&productWidth=${productWidth}`;
        return this.http.get(url, { headers: this.core.setHeaders() }).map((res) => res.json());
    }
    getShippingMethodsOnAddress(checkoutOrderList)
    {
        const BASE_URL: string = environment.shippingMethod;
        const url: string = `${BASE_URL}/${environment.apis.shippingMethod.method}/shippingMethods`;
        return this.http.post(url, checkoutOrderList, { headers: this.core.setHeaders() }).map((res) => res.json());
    }

   
    getGuestShippingMethodsOnAddress(checkoutOrderList) {
        const BASE_URL: string = environment.shippingMethod;
        const url: string = `${BASE_URL}/${environment.apis.shippingMethod.guestShipMethod}/shippingMethods`;
        return this.http.post(url, checkoutOrderList).map((res) => res.json());
    }

    addEditShippingAddress(AddressModel) {
        const BASE_URL: string = environment.profileInterest;
        const url: string = `${BASE_URL}/${environment.apis.profileInterest.myAccountLocation}`;
        return this.http.post(url, AddressModel, { headers: this.core.setHeaders() }).map((res) => res.json());
    }

    getTax(avalarataxModel) {
        const url: string = `${this.BASE_URL_RETAILER}/${environment.apis.shippingMethod.getTax}`;
        return this.http.post(url, avalarataxModel, { headers: this.core.setHeaders() }).map((res) => res.json());
    }

    getAllStates() {
        const url: string = `${this.BASE_URL_RETAILER}/${environment.apis.shippingMethod.getStates}`;
        return this.http.get(url, { headers: this.core.setHeaders() }).map((res) => res.json());
    }
    getAllGuestStates()
    {
        const url: string = `${this.BASE_URL_RETAILER}/${environment.apis.shippingMethod.getGuestStates}`;
        return this.http.get(url).map((res) => res.json());
    }

    productAvailability(productId) {
        const url: string = `${environment.productList}/${environment.apis.consumerCheckout.productQuantity}/${productId}`;
        return this.http.get(url).toPromise().then(res => res.json());
    }


    addGuestCard(stripeAddCard) {
        const url: string = `${this.BASE_URL_CARD}/${environment.apis.consumerCheckout.addCard}`;
        return this.http.post(url, stripeAddCard, { headers: this.core.setHeaders() }).map((res) => res.json());
    }

    getGuestTax(avalarataxModel) {
        const url: string = `${this.BASE_URL_RETAILER}/${environment.apis.shippingMethod.guestShipMethod}/productsTax`;
        return this.http.post(url, avalarataxModel).map((res) => res.json());
    }

    chargeGuestAmount(productCheckout) {
        const url: string = `${this.BASE_URL_ORDER}/${environment.apis.consumerCheckout.guestOrderPayment}`;
        return this.http.post(url, productCheckout).map((res) => res.text());
    }

    productGuestAvailability(productId) {
        const url: string = `${environment.productList}/${environment.apis.consumerCheckout.productQuantity}/${productId}`;
        return this.http.get(url).map((res) => res.json());
    }
    
    
}