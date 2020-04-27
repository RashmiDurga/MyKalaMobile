import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';
import { environment } from '../../environments/environment';

@Injectable()
export class ConsumerInterestService {
  private BASE_URL: string = environment.profileInterestPublic;
  constructor(private http: Http) { }

  getInterest() {
    const url: string = `${this.BASE_URL}/${environment.apis.profileInterest.getCatalogue}`;
    return this.http.get(url).map((res) => res.json());
  }

  postInterest(interest) {
    const url: string = `${this.BASE_URL}/${environment.apis.profileInterest.saveProfile}`;
    return this.http.post(url, interest).map((res) => res.json());
  }
}
