import { Injectable } from '@angular/core';
import { Headers, Http } from '@angular/http';
import { User, BasicAuth } from '../models/user';

import 'rxjs/add/operator/toPromise';
import { environment } from '../../environments/environment';
import { CoreService } from './core.service';

@Injectable()
export class AuthService {
  private BASE_URL: string = environment.login;
  basicAuth = new BasicAuth();
  private headers: Headers = new Headers({
    'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8;',
    Authorization: `Basic ${this.basicAuth.encoded}`
  });

  constructor(private http: Http, private core: CoreService) { }

  login(user): Promise<any> {
    const data = {
      grant_type: this.basicAuth.grant_type,
      username: user.username.charAt(0).toLowerCase() + user.username.slice(1).toLowerCase(),
      password: user.password,
      client_id: this.basicAuth.client_id
    };

    const url = `${this.BASE_URL}/${environment.apis.auth.token}?client_id=${this.basicAuth.client_id}&grant_type=password&username=${user.username}&password=${encodeURIComponent(user.password)}`;
    return this.http.post(url, '', { headers: this.headers }).toPromise();
  }

  ensureAuthenticated(token): Promise<any> {
    const url = `${this.BASE_URL}/${environment.apis.auth.status}`;
    const headers: Headers = new Headers({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    });
    return this.http.get(url, { headers: headers }).toPromise();
  }

  getUserInfo(token) {
    const url = `${this.BASE_URL}/users/${environment.apis.auth.userInfo}`;
    return this.http.get(url, { headers: this.core.setHeaders() }).map((res) => res.json());
  }

  verifyAccount(emailId) {
    const BASE_URL = environment.userService;
    const url: string = `${BASE_URL}/${environment.apis.userService.resendVerification}/${emailId}`;
    return this.http.get(url).map((res) => res.json());
  }

  getVerified(token) {
    let BASE_URL: string = environment.userService;
    const url: string = `${BASE_URL}/${environment.apis.userService.validateToken}/${token}`;
    return this.http.get(url).map((res) => res.text())
  }

  resetPassword(rpModal) {
    let BASE_URL: string = environment.userService;
    const url = `${BASE_URL}/${environment.apis.userService.resetPassword}`;
    return this.http.post(url, rpModal).map((res) => res.text());
  }
}
