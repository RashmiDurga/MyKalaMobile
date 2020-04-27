import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';
import { environment } from '../../environments/environment';

@Injectable()
export class JoinKalaService {
  private BASE_URL: string = environment.userService;

  constructor(private http: Http) { }

  joinKalaStepOne(userModel) {
    const url: string = `${this.BASE_URL}/${environment.apis.userService.createAccount}`;
    return this.http.post(url, userModel).map((res) => res.json())
  }

  verifyAccount(emailId) {
    const BASE_URL = environment.userService;
    const url: string = `${BASE_URL}/${environment.apis.userService.resendVerification}/${emailId}`;
    return this.http.get(url).map((res) => res.json());
  }
}
