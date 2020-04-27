import { Component, OnInit, ViewEncapsulation, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { CoreService } from '../../services/core.service';
import { Conversation } from '../../models/conversation';
import { userMessages, inputValidation } from './login.messges';
import { RememberMe } from '../../models/rememberMe';
import { LocalStorageService } from '../../services/LocalStorage.service';
import { regexPatterns } from '../../common/regexPatterns';
import { User } from '../../models/user';
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class LoginComponent implements OnInit {
  loginKala: FormGroup;
  loader: boolean = false;
  loginError: boolean;
  userInactive: boolean = false;
  unAuthorized: boolean = false;
  verificationMail: boolean = false;
  emailRegex = regexPatterns.emailRegex;
  loginUserMessage = userMessages;
  loginInputValMsg = inputValidation;
  getCredentials = window.localStorage['rememberMe'];
  credentialModal = new RememberMe();
  userCredential: any;
  emailValidation: boolean = false;
  passwordValidation: boolean = false;

  @Input() data: any;
  @Output() clicked = new EventEmitter<Conversation>();
  user: User = new User();
  @Input() hideNavi: string;

  constructor(
    private router: Router,
    private auth: AuthService,
    public core: CoreService,
    private formBuilder: FormBuilder,
    private localStorageService: LocalStorageService) { }

  ngOnInit() {
    /**Clearing the Logged In Session */
    localStorage.removeItem('token');
    this.core.clearUser();
    this.core.hideUserInfo(true);
    this.core.LoungeShowHide();
    /**Clearing the Logged In Session */
    if (this.getCredentials != '' && this.getCredentials != undefined) {
      this.loginKala = this.formBuilder.group({
        email: [JSON.parse(this.getCredentials).email, [Validators.required, Validators.pattern(this.emailRegex)]],
        password: [window.atob(JSON.parse(this.getCredentials).password), Validators.compose([Validators.required])],
        remember: [JSON.parse(this.getCredentials).remember]
      });
    }
    else {
      this.loginKala = this.formBuilder.group({
        email: ['', [Validators.required, Validators.pattern(this.emailRegex)]],
        password: ['', Validators.compose([Validators.required])],
        remember: ['']
      });
    }
  }

  onLogin(): void {
    this.auth.login(this.user)
      .then((user) => {
        localStorage.setItem('token', user.json().auth_token);
        this.core.hide();
        //this.clicked.emit(new Conversation(MsgDirection.Out, "Login Completed"));
        //this.clicked.emit(new Conversation(MsgDirection.In, "Hi, " + user.json().auth_token));
        this.router.navigateByUrl('/status');
      })
      .catch((err) => {
        console.log(err);
      });
  }

  hideValidation() {
    this.emailValidation = false;
    this.passwordValidation = false;
    this.loginError = false;
    this.userInactive = false;
    this.unAuthorized = false;
    this.verificationMail = false;
  }

  onSubmit() {
    this.emailValidation = false;
    this.passwordValidation = false;
    this.loginError = false;
    this.userInactive = false;
    this.unAuthorized = false;
    this.verificationMail = false;
    this.loader = false;
    if (!this.loginKala.controls.email.value) this.emailValidation = true;
    else if (this.loginKala.controls.email.value && this.loginKala.controls.email.errors) this.emailValidation = true;
    else if (!this.loginKala.controls.password.value) this.passwordValidation = true;
    else {
      this.loader = true;
      this.userCredential = new User(this.loginKala.controls.email.value, this.loginKala.controls.email.value, this.loginKala.controls.password.value)
      this.credentialModal.email = this.loginKala.controls.email.value;
      this.credentialModal.password = window.btoa(this.loginKala.controls.password.value);
      this.credentialModal.remember = this.loginKala.controls.remember.value;
      this.auth.login(this.userCredential).then((res) => {
        this.checkRememberMe();
        const resJson = res.json();
        this.localStorageService.setItem('token', resJson.access_token, resJson.expires_in);
        this.auth.getUserInfo(resJson.access_token).subscribe(res => {
          this.loader = false;
          if (res.userCreateStatus == false) {
            localStorage.removeItem("token");
            this.userInactive = true;
          }
          else {
            if (res.roleName[0] != "consumer") this.unAuthorized = true;
            else {
              window.localStorage['userInfo'] = JSON.stringify(res);
              this.core.hideUserInfo(false);
              this.core.setUser(res);
              if (window.localStorage['tbnAfterLogin'] != undefined) {
                let url = window.localStorage['tbnAfterLogin'];
                localStorage.removeItem("tbnAfterLogin");
                this.router.navigateByUrl(url);
              }
              else this.router.navigateByUrl('/home');
            }
          }
        }, err => {
          console.log(err);
        })
      }).catch((err) => {
        this.loader = false;
        this.loginError = true;
        console.log(err);
      });
    }
  }

  verifyAccount() {
    this.loginError = false;
    this.userInactive = false;
    this.unAuthorized = false;
    this.verificationMail = false;
    this.loader = true;
    this.auth.verifyAccount(this.loginKala.controls.email.value).subscribe((res) => {
      this.loader = false;
      this.verificationMail = true;
    })
  }

  checkRememberMe() {
    if (this.credentialModal.remember) {
      window.localStorage['rememberMe'] = JSON.stringify(this.credentialModal);
      console.log(JSON.parse(window.localStorage['rememberMe']));
    }
    else localStorage.removeItem('rememberMe');
  }
}
