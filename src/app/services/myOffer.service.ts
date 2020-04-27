import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';
import { environment } from '../../environments/environment';
import { CoreService } from './core.service';

@Injectable()
export class MyOffersService {
    private BASE_URL: string = environment.profileInterest;

    constructor(private http: Http, private core: CoreService) { }

    loadOffers(userId) {
        const url: string = `${this.BASE_URL}/loadMyOffers/${userId}`;
        return this.http.get(url, { headers: this.core.setHeaders() }).map((res) => res.json())
    }

    endOffer(offerId) {
        const url: string = `${this.BASE_URL}/endOffer/${offerId}`;
        return this.http.delete(url, { headers: this.core.setHeaders() }).map((res) => res.text())
    }
}
