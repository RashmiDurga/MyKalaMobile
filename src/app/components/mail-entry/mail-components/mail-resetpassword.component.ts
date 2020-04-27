import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { userMessages } from './messages';
import { CoreService } from '../../../services/core.service';
import { ActivatedRoute, Router } from '@angular/router';
import { LocalStorageService } from '../../../services/LocalStorage.service';
import { AuthService } from '../../../services/auth.service';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { regexPatterns } from '../../../common/regexPatterns';
import { ResetPasswordModal } from '../../../models/resetPassword.modal';

@Component({
  selector: 'app-mail-resetpassword',
  templateUrl: './mail-resetpassword.component.html',
  encapsulation: ViewEncapsulation.None
})
export class MailResetPasswordComponent implements OnInit {
  userId: string;
  loader: boolean = false;
  resetPassword: FormGroup;
  passwordRegex = regexPatterns.password;
  rpUserMessage = {
    success: "Your password has been reset successfully.",
    fail: "Something went worng, please try again.",
  };
  rpInputMessage = {
    passwordRequired: 'Please enter your password',
    confirmPasswordRequired: 'Please confirm your password',
    passwordMismatch: 'Password does not match',
    validPassword: 'Password length must be at least 8 characters: 1 Uppercase Character, 1 Lowercase Character, 1 Number and 1 Special Character'
  };
  passwordMissMatch: boolean = false;
  rpModal = new ResetPasswordModal();
  userInfo: any;
  responseHandling = { status: false, response: "" };
  newPasswordValidation: boolean = false;
  confirmPasswordValidation: boolean = false;

  constructor(private router: Router,
    route: ActivatedRoute,
    private auth: AuthService,
    private formBuilder: FormBuilder,
    public core: CoreService,
    private localStorageService: LocalStorageService) {
    this.userId = route.snapshot.queryParams.id
  }

  ngOnInit() {
    localStorage.clear();
    this.core.resetAllConvoFlags();
    this.resetPassword = this.formBuilder.group({
      newPassword: ['', Validators.compose([Validators.pattern(this.passwordRegex), Validators.required, Validators.minLength(8)])],
      confirmPassword: ['', Validators.compose([Validators.pattern(this.passwordRegex), Validators.required, Validators.minLength(8)])]
    });
  }

  hideValidations() {
    this.newPasswordValidation = false;
    this.confirmPasswordValidation = false;
    this.passwordMissMatch = false;
    this.loader = false;
  }

  onSubmit() {
    this.newPasswordValidation = false;
    this.confirmPasswordValidation = false;
    this.loader = false;
    this.passwordMissMatch = false;
    if (!this.resetPassword.controls.newPassword.value) this.newPasswordValidation = true;
    else if (this.resetPassword.controls.newPassword.value && this.resetPassword.controls.newPassword.errors) this.newPasswordValidation = true;
    else if (!this.resetPassword.controls.confirmPassword.value) this.confirmPasswordValidation = true;
    else if (this.resetPassword.controls.confirmPassword.value && this.resetPassword.controls.confirmPassword.errors) this.confirmPasswordValidation = true;
    else if (this.resetPassword.controls.newPassword.value != this.resetPassword.controls.confirmPassword.value) {
      this.passwordMissMatch = true;
      this.loader = false;
    }
    else {
      this.passwordMissMatch = false;
      this.responseHandling.status = false;
      this.rpModal.id = this.userId;
      this.rpModal.password = this.resetPassword.controls.confirmPassword.value;
      this.auth.resetPassword(this.rpModal).subscribe(res => {
        this.loader = false;
        this.responseHandling.status = true;
        this.responseHandling.response = res;
        setTimeout(() => this.router.navigateByUrl('/search-result'), 3000);
      });
    }
  }
}
