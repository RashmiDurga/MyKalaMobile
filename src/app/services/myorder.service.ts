import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';
import { environment } from '../../environments/environment';
import { CoreService } from './core.service';
import { Observable } from 'rxjs';
import { MyOrders } from '../models/myOrder';

@Injectable()
export class MyOrdersService {
    private BASE_URL: string = environment.checkout;

    constructor(private http: Http, private core: CoreService) { }

    getOrders(userId) {
        const url: string = `${this.BASE_URL}/${userId}/myOrders`;
        return this.http.get(url, { headers: this.core.setHeaders() }).map(res => res.json());
    }

    cancelOrder(cancelOrderModel) {
        const url: string = `${this.BASE_URL}/${environment.apis.consumerCheckout.cancelOrder}`;
        return this.http.post(url, cancelOrderModel, { headers: this.core.setHeaders() }).map(res => res.text());
    }

    trackOrder(carrier, shippingTrackId, productId) {
        const url: string = `${this.BASE_URL}/${environment.apis.consumerCheckout.trackOrderShipment}/${carrier}/${shippingTrackId}/${productId}`;
        return this.http.get(url, { headers: this.core.setHeaders() }).map(res => res.json());
    }

    support(model) {
        const url: string = `${this.BASE_URL}/${environment.apis.consumerCheckout.support}`;
        return this.http.post(url, model, { headers: this.core.setHeaders() }).map(res => res.json());
    }

    getById(orderId: any): Observable<MyOrders> {
        const url = `${this.BASE_URL}/${orderId}`;
        return this.http
            .get(url, { headers: this.core.setHeaders() })
            .map(res => {
                if (res.text() === '') {
                    return new MyOrders();
                } else {
                    return new MyOrders(res.json());
                }
            });
    }

    getOrderReviewStatus(orderId, productId) {
        let BASE_URL = environment.profileInterest;
        const url: string = `${BASE_URL}/${environment.apis.profileInterest.review}/${environment.apis.profileInterest.checkReviewStatus}/order/${orderId}/product/${productId}`;
        return this.http
            .get(url, { headers: this.core.setHeaders() })
            .map(res => {
                if (res.text() === '') return res.text();
                else return res.json()
            });
    }

}
