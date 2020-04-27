import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';
import { environment } from '../../environments/environment';
import { CoreService } from './core.service';

@Injectable()
export class MyAlertsService {
    private BASE_URL: string = environment.profileInterest;

    constructor(private http: Http, private core: CoreService) { }

    loadAllAlerts(userId, page, size) {
        const url: string = `${this.BASE_URL}/user/${userId}/${environment.apis.profileInterest.getAllAlerts}?page=${page}&size=${size}&sortOrder=desc&sort=alertDate,DESC`;
        return this.http.get(url, { headers: this.core.setHeaders() }).map((res) => res.json())
    }

    checkSubscription(userId) {
        const url: string = `${this.BASE_URL}/${environment.apis.profileInterest.checkAlertSubscription}/${userId}`;
        return this.http.get(url, { headers: this.core.setHeaders() }).map((res) => res.text())
    }

    trackOrder(carrier, shippingTrackId, productId) {
        const BASE_URL: string = environment.checkout;
        const url: string = `${BASE_URL}/${environment.apis.consumerCheckout.trackOrderShipment}/${carrier}/${shippingTrackId}/${productId}`;
        return this.http.get(url, { headers: this.core.setHeaders() }).map(res => res.json());
    }

    updateAlerts(alert) {
        const BASE_URL: string = environment.profileInterestPublic;
        const url: string = `${BASE_URL}/${environment.apis.profileInterest.getAllAlerts}/${'read'}`;
        return this.http.post(url, alert).map((res) => res.json())
    }
}
