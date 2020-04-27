import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';
import { environment } from '../../environments/environment';

@Injectable()
export class ProfileInfoService {
    private BASE_URL: string = environment.profileInterestPublic;
    constructor(private http: Http) { }

    getLocation(term: string) {
        const url: string = `${environment.geoCode}?address=${term}${environment.apis.geoCode.key}`;
        return this.http.get(url).map(res => res.json());
    }

    completeProfile(profileInformation) {
        const url: string = `${this.BASE_URL}/${environment.apis.profileInterest.saveProfile}`;
        return this.http.post(url, profileInformation).map((res) => res.text())
    }
}
