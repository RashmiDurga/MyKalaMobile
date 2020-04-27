import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { environment } from '../../environments/environment';
import { CoreService } from './core.service';

@Injectable()
export class GetOfferService {
    constructor(private http: Http, private core: CoreService) { }

    getLocation(term: string) {
        const url: string = `${environment.geoCode}?address=${term}${environment.apis.geoCode.key}`;
        return this.http.get(url).map(res => res.json());
    };

    getExistingLocations(userId) {
        const url: string = `${environment.profileInterest}/${environment.apis.profileInterest.addressList}/${userId}`;
        return this.http.get(url, { headers: this.core.setHeaders() }).map(res => res.json());
    }

    confirmOffer(step4Modal) {
        const url: string = `${environment.productList.split("/public")[0]}/${environment.apis.getOffers.confirmOffer}`;
        return this.http.post(url, step4Modal, { headers: this.core.setHeaders() }).map(res => res.json());
    }

    getofferSubCategory(gSCM) {
        const url: string = `${environment.productList}/${environment.apis.getOffers.partial}`;
        return this.http.post(url, gSCM).toPromise().then(res => res.json());
    }
}