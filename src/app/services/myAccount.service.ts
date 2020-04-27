import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';
import { environment } from '../../environments/environment';
import { CoreService } from './core.service';

@Injectable()
export class MyAccountService {
    private BASE_URL: string = environment.profileInterest;
    private BASE_RET_URL: string = environment.shippingMethod;

    constructor(private http: Http, private core: CoreService) { }

    getUserDetails(userId) {
        const BASE_URL: string = environment.profileInterestPublic;
        const url: string = `${BASE_URL}/userId/${userId}`;
        return this.http.get(url).map(res => res.json());
    }

    getLocation(term: string) {
        const url: string = `${environment.geoCode}?address=${term}${environment.apis.geoCode.key}`;
        return this.http.get(url).map(res => res.json());
    }

    getCards(userId) {
        const BASE_URL: string = environment.card;
        const url: string = `${BASE_URL}/${userId}/${environment.apis.consumerCheckout.getCards}`;
        return this.http.get(url, { headers: this.core.setHeaders() }).map((res) => res.json());
    }

    addCard(stripeAddCard) {
        const BASE_URL: string = environment.card;
        const url: string = `${BASE_URL}/${environment.apis.consumerCheckout.addCard}`;
        return this.http.post(url, stripeAddCard, { headers: this.core.setHeaders() }).map((res) => res.json());
    }

    updateCard(stripeAddCard) {
        const BASE_URL: string = environment.card;
        const url: string = `${BASE_URL}/${environment.apis.consumerCheckout.updateCard}`;
        return this.http.post(url, stripeAddCard, { headers: this.core.setHeaders() }).map((res) => res.json());
    }

    deleteCard(customerId, cardId) {
        const BASE_URL: string = environment.card;
        const url: string = `${BASE_URL}/${customerId}/${cardId}/${environment.apis.consumerCheckout.deleteCard}`;
        return this.http.delete(url, { headers: this.core.setHeaders() }).map((res) => res.text());
    }

    deleteAddress(addressId, emailId) {
        const url: string = `${this.BASE_URL}/${emailId}/${environment.apis.profileInterest.deleteAddress}/${addressId}`;
        return this.http.delete(url, { headers: this.core.setHeaders() }).map((res) => res.json());
    }

    getInterest() {
        const BASE_URL: string = environment.profileInterestPublic;
        const url: string = `${BASE_URL}/${environment.apis.profileInterest.getCatalogue}`;
        return this.http.get(url).map((res) => res.json());
    }

    saveProfileImage(profileImageModel) {
        const url: string = `${this.BASE_URL}/${environment.apis.profileInterest.myAccountProfileImage}`;
        return this.http.post(url, profileImageModel, { headers: this.core.setHeaders() }).map((res) => res.json());
    }

    saveEmail(EmailModel) {
        const url: string = `${this.BASE_URL}/${environment.apis.profileInterest.myAccountEmailId}`;
        return this.http.post(url, EmailModel, { headers: this.core.setHeaders() }).map((res) => res.json());
    }

    savePassword(PasswordModal) {
        const url: string = `${this.BASE_URL}/${environment.apis.profileInterest.myAccountPassword}`;
        return this.http.post(url, PasswordModal, { headers: this.core.setHeaders() }).map((res) => res.text());
    }

    saveDOB(DOBModel) {
        const url: string = `${this.BASE_URL}/${environment.apis.profileInterest.myAccountDOB}`;
        return this.http.post(url, DOBModel, { headers: this.core.setHeaders() }).map((res) => res.json());
    }
    saveLocation(AddressModel) {
        const url: string = `${this.BASE_URL}/user/${AddressModel.userId}/zipcode/${AddressModel.zipcode}`;
        return this.http
          .put(url, null, { headers: this.core.setHeaders() })
          .map((res) => res.json());
    }

    saveGender(userId, gender) {
        const url: string = `${this.BASE_URL}/user/${userId}/gender/${gender}`;
        return this.http.put(url, '', { headers: this.core.setHeaders() }).map((res) => res.json());
    }

    saveAddress(AddressModel) {
        const url: string = `${this.BASE_URL}/${environment.apis.profileInterest.myAccountLocation}`;
        return this.http.post(url, AddressModel, { headers: this.core.setHeaders() }).map((res) => res.json());
    }
    validateAddress(AddressModel) {
        const url: string = `${this.BASE_RET_URL}/${environment.apis.shippingMethod.validateAddress}`;
        return this.http.post(url, AddressModel, { headers: this.core.setHeaders() }).map((res) => res.json());
    }
    validateGuestAddress(AddressModel) {
        const url: string = `${this.BASE_RET_URL}/${environment.apis.shippingMethod.validateAddress}`;
        return this.http.post(url, AddressModel).map((res) => res.json());
    }
    saveInterest(InterestModel) {
        const url: string = `${this.BASE_URL}/${environment.apis.profileInterest.myAccountInterest}`;
        return this.http.post(url, InterestModel, { headers: this.core.setHeaders() }).map((res) => res.json());
    }

    getAllStates() {
        const BASE_URL_RETAILER: string = environment.shippingMethod;
        const url: string = `${BASE_URL_RETAILER}/${environment.apis.shippingMethod.getStates}`;
        return this.http.get(url, { headers: this.core.setHeaders() }).map((res) => res.json());
    }

    emailNotification(model) {
        const url: string = `${this.BASE_URL}/${environment.apis.profileInterest.emailNotification}`;
        return this.http.post(url, model, { headers: this.core.setHeaders() }).map((res) => res.json());
    }

    alertNotification(model) {
        const url: string = `${this.BASE_URL}/${environment.apis.profileInterest.alertNotification}`;
        return this.http.post(url, model, { headers: this.core.setHeaders() }).map((res) => res.json());
    }

    closeAccount(model) {
        const url: string = `${this.BASE_URL}/${environment.apis.profileInterest.closeAccount}`;
        return this.http.post(url, model, { headers: this.core.setHeaders() }).map((res) => res.json());
    }
}
