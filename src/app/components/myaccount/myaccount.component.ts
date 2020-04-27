import { Component, OnInit, ViewEncapsulation, ViewChild, ElementRef, AfterViewInit, OnDestroy, ChangeDetectorRef, NgZone } from '@angular/core';
import { MyAccountGetModel, MyAccountConsumerInterest, MyaccountProfileInfo, MyAccountUserData, MyAccountAddress } from '../../models/myAccountGet';
import { CoreService } from '../../services/core.service';
import { MyAccountService } from '../../services/myAccount.service';
import { environment } from '../../../environments/environment';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { GetCustomerCards } from '../../models/getCards';
import { StripeAddCardModel } from '../../models/StripeAddCard';
import { StripeCheckoutModal } from '../../models/StripeCheckout';
import { FormGroup, FormControl, FormBuilder, Validators, NgForm } from '@angular/forms';
import { MyAccountProfileModel, MyAccountEmailModel, MyAccountPasswordModel, MyAccountAddressModel, MyAccountDOBModel, MyAccountInterestModel } from '../../models/myAccountPost';
import { Router } from '@angular/router';
import { MatDatepickerInputEvent } from '@angular/material';
import { CreditCardValidator } from 'angular-cc-library';
import { PaymentCardModal } from '../../models/paymentCard';

declare let navigator: any;
@Component({
  selector: 'app-myaccount',
  templateUrl: './myaccount.component.html',
  styleUrls: ['./myaccount.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class MyaccountComponent implements OnInit, AfterViewInit, OnDestroy {
  addCard: boolean = false;
  savedCardDetails: any;
  getStates: any;
  addPaymentCard: FormGroup;
  changePasswordForm: FormGroup;
  changeLocationForm: FormGroup;
  addShippingAddressForm: FormGroup;
  changeGenderForm: FormGroup;
  editShippingAddressForm: FormGroup;
  readStripe: boolean = false;
  addEditInvalidZipCode:boolean=false;
  error: string;
  cardHandler = this.onChange.bind(this);
  @ViewChild('cardNumber') cardNumber: ElementRef;
  @ViewChild('cardExpiry') cardExpiry: ElementRef;
  @ViewChild('cardCVC') cardCVC: ElementRef;
  @ViewChild('cardZipcode') cardZipcode: ElementRef;
  @ViewChild('fileSizeTooBig') fileSizeTooBig: ElementRef;
  cardNumberBrand: any;
  cardBrandToPfClass = {
    'visa': 'pf-visa',
    'mastercard': 'pf-mastercard',
    'amex': 'pf-american-express',
    'discover': 'pf-discover',
    'diners': 'pf-diners',
    'jcb': 'pf-jcb',
    'unknown': 'pf-credit-card',
  }
  getAPICP: any;
  stripeAddCard = new StripeAddCardModel();
  stripeCheckout = new StripeCheckoutModal();
  getCardsDetails: any;
  uploadFile: any;
  loader: boolean = false;
  loader_profileImage: boolean = false;
  loader_emailImage: boolean = false;
  loader_password: boolean = false;
  loader_profileAddress: boolean = false;
  loader_DOB: boolean = false;
  loader_Interest: boolean = false;
  loader_shippingAddress: boolean = false;
  loader_Card: boolean = false;
  loader_addCard: boolean = false;
  loader_gender: boolean = false;
  myAccountModel = new MyAccountGetModel();
  imgS3: string;
  input_Email: boolean = false;
  append_Email: string;
  emptyEmailAddress: boolean = false;
  invalidEmailAddress: boolean = false;
  emailRegex = new RegExp('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+[\.]+[a-zA-Z0-9]{2,4}$');
  @ViewChild('emailElement') emailElement: ElementRef
  input_Password: boolean = false;
  append_Password: string;
  append_NewPassword: string;
  append_ConfirmPassword: string;
  emptyOldPassword: boolean = false;
  emptyNewPassword: boolean = false;
  emptyConfirmPassword: boolean = false;
  invalidPassword: boolean = false;
  oldNewPassword: boolean = false;
  newConfirmPassword: boolean = false;
  passwordRegex = new RegExp('^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$');
  @ViewChild('passwordElement') passwordElement: ElementRef
  input_Location: boolean = false;
  append_location:string;
  input_getLocation: boolean = false;
  fetchGeoCode: string;
  profileAddress: MyAccountAddress;
  fetchValidGeoCode:string;
  @ViewChild('locationElement') locationElement: ElementRef
  input_dob: boolean = false;
  append_dob: any;
  minDate;
  maxDate;
  model: NgbDateStruct;
  today = new Date();
  @ViewChild('dobElement') dobElement: ElementRef
  @ViewChild('invalidAddressModel') invalidAddressModel: ElementRef;
  getInterest = [];
  selectImg: boolean;
  input_shippingAddress: boolean = false;
  append_editAddressLine1: string;
  append_editAddressLine2: string;
  append_editShippingCity: string;
  append_editShippingState: string;
  append_editShippingZipcode: string;
  append_addAddressLine1: string;
  append_addAddressLine2: string;
  append_addShippingCity: string;
  append_addShippingState: string;
  append_addShippingZipcode: string;
  addShippingAddress: boolean = false;
  appendAdddefaultShipping : boolean = false;
  ProfileSaveModel = new MyAccountProfileModel();
  EmailSaveModel = new MyAccountEmailModel();
  PasswordSaveModel = new MyAccountPasswordModel();
  AddressSaveModel = new MyAccountAddressModel();
  DOBSaveModel = new MyAccountDOBModel();
  InterestSaveModel = new MyAccountInterestModel();
  getUserInfo: any;
  customerId: string;
  @ViewChild('closeAccountModal') closeAccountModal: ElementRef;
  @ViewChild('deleteCardModal') deleteCardModal: ElementRef;
  @ViewChild('deleteAddressModal') deleteAddressModal: ElementRef;
  @ViewChild('camModal') camModal: ElementRef;
  invalidAddress:any ='The shipping address you selected is not valid.';
  saveCardDetails: any;
  pageLoader: boolean = false;
  IsEmailNotify: boolean = false;
  IsAlertNotify: boolean = false;
  addressIdForDelete: string;
  addresscount: any = 1; // To show ony 1 address by default
  selectedDOB = { year: "1940", month: "1", date: "1" };
  invalidDOB: boolean = false;
  dateSelected: boolean = true;
  defaultPayment:boolean= false;

  editProfileImage: boolean = false;
  editPassword: boolean = false;
  editLocation: boolean = false;
  addShipping: boolean = false;
  editShipping: boolean = false;
  editCard: boolean = false;
  editConsumerInterest: boolean = false;
  editDateOfBirth: boolean = false;
  editGender: boolean = false;
  editShippingId: string;
  mockProfileImage: string;
  errorValidationMessage: string;

  // dobSelected: boolean = true;
  constructor(
    public core: CoreService,
    private myAccount: MyAccountService,
    private cd: ChangeDetectorRef,
    private route: Router,
    private formBuilder: FormBuilder,
    private zone: NgZone
  ) {
    this.minDate = new Date(1940, 0, 1);
    this.maxDate = new Date(this.today.getFullYear(), this.today.getMonth(), this.today.getDate())
  }

  turnOnOffNotifications(e, from) {
    let emailId = this.getUserInfo.emailId;
    let userId = this.getUserInfo.userId;
    let emailNotification: boolean;
    let alertNotification: boolean;
    if (from == 'email') {
      if (e.target.checked) emailNotification = false;
      else emailNotification = true;
      let model = {userId:userId, emailId: emailId, emailNotification: emailNotification };
      this.myAccount.emailNotification(model).subscribe((res) => {
        window.localStorage['userInfo'] = JSON.stringify(res);
      });
    }
    else {
      if (e.target.checked) alertNotification = false;
      else alertNotification = true;
      let model = { userId:userId,emailId: emailId, alertNotification: alertNotification };
      this.myAccount.alertNotification(model).subscribe((res) => {
        window.localStorage['userInfo'] = JSON.stringify(res);
      });
    }
  }

  confirmCloseAccount() {
    this.core.openModal(this.closeAccountModal)
  }

  closeAccount() {
    let model = {userId:this.getUserInfo.userId, emailId: this.getUserInfo.emailId };
    this.myAccount.closeAccount(model).subscribe((res) => {
      this.route.navigateByUrl('/app-logout');
    }, (err) => {
      console.log(err)
    })
  }

  onChange({ error }) {
    if (error) {
      this.error = error.message;
    } else {
      this.error = null;
    }
    this.cd.detectChanges();
  }

  ngAfterViewInit() {
    this.zone.runOutsideAngular(() => {
      cordova.plugins.stripe.setPublishableKey(environment.stripePK);
    });

    this.addPaymentCard = this.formBuilder.group({
      creditCard: ['', [Validators.required, CreditCardValidator.validateCCNumber]],
      expirationDate: ['', [Validators.required, CreditCardValidator.validateExpDate]],
      cvc: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(4)]],
      cardZipcode: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(5)]],
      defaultPayment: ['']
    });

    this.changePasswordForm = this.formBuilder.group({
      currentPassword: ['********'],
      newPassword: ['', [Validators.required, Validators.pattern(this.passwordRegex)]],
      confirmPassword: ['', [Validators.required, Validators.pattern(this.passwordRegex)]]
    });

    this.changeGenderForm = this.formBuilder.group({
      gender: ['', Validators.required]
    });

    this.changeLocationForm = this.formBuilder.group({
      location: ['', [Validators.minLength(5), Validators.maxLength(5)]]
    });

    this.addShippingAddressForm = this.formBuilder.group({
      addressLineOne: ['', [Validators.required]],
      addressLineTwo: [''],
      addCity: ['', [Validators.required]],
      addStates: ['', [Validators.required]],
      addZipcode: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(5)]],
      appendAdddefaultShipping: [''],
    });

    this.editShippingAddressForm = this.formBuilder.group({
      editaddressLineOne: ['', [Validators.required]],
      editaddressLineTwo: [''],
      editCity: ['', [Validators.required]],
      editStates: ['', [Validators.required]],
      editZipcode: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(5)]],
      appendAdddefaultShipping: [''],
    });
  }

  ngOnDestroy() {
  }

   ngOnInit() {
    this.core.checkIfLoggedOut(); /*** If User Logged Out*/
    this.core.hide();
    this.core.searchMsgToggle();
    this.core.hideUserInfo(false);
    this.core.footerSwap();
    let appFooter = document.getElementsByClassName("footer")[0];
    appFooter.classList.remove("hideFooter");
    this.imgS3 = environment.s3;
    if (window.localStorage['userInfo'] != undefined) this.getUserInfo = JSON.parse(window.localStorage['userInfo'])
    this.getConsumerProfile();
    this.core.LoungeShowHide();
  }

  getConsumerProfile() {
    this.pageLoader = true;
    let userId = this.getUserInfo.userId;
    this.myAccount.getUserDetails(userId).subscribe((res) => {
      this.pageLoader = false;
      if (res.consumerImagePath != undefined && res.consumerImagePath != null && res.consumerImagePath != "") {
        if (res.consumerImagePath.indexOf('data:') === -1 && res.consumerImagePath.indexOf('https:') === -1 && res.consumerImagePath.indexOf('http:') === -1) {
          res.consumerImagePath = this.imgS3 + res.consumerImagePath + '?random+\=' + Math.random();;
        }
      }
      else res.consumerImagePath = "./assets/images/avatar.png";
      this.mockProfileImage = res.consumerImagePath;
      window.localStorage['userInfo'] = JSON.stringify(res);
      this.getUserInfo = JSON.parse(window.localStorage['userInfo']);
      this.getAPICP = res;
      this.myAccountModel.profileInfo = new MyaccountProfileInfo();
      this.myAccountModel.userData = new MyAccountUserData();
      this.myAccountModel.profileInfo.consumerInterests = new Array<MyAccountConsumerInterest>();
      this.myAccountModel.profileInfo.address = new Array<MyAccountAddress>();
      this.myAccountModel.profileInfo.address = res.address == null ? [] : res.address.sort(function(a, b) {
        return b.defaultAddress - a.defaultAddress;
      });
      // this.myAccountModel.profileInfo.consumerImagePath = this.imgS3.concat(res.consumerImagePath);
      this.myAccountModel.profileInfo.consumerImagePath = res.consumerImagePath;
      this.myAccountModel.profileInfo.consumerInterests = res.consumerInterests;
      window.localStorage['savedInterest'] = JSON.stringify(res.consumerInterests);
      if (res.stringDateOfBirth != null) {
        this.myAccountModel.profileInfo.dob = new Date(res.stringDateOfBirth);
        this.myAccountModel.profileInfo.birthDate = new Date(res.stringDateOfBirth).getDate().toString();
        this.myAccountModel.profileInfo.birthMonth = (new Date(res.stringDateOfBirth).getMonth() + 1).toString();
        this.myAccountModel.profileInfo.birthYear = new Date(res.stringDateOfBirth).getFullYear().toString();
        this.selectedDOB.year = this.myAccountModel.profileInfo.birthYear;
        this.selectedDOB.month = this.myAccountModel.profileInfo.birthMonth;
        this.selectedDOB.date = this.myAccountModel.profileInfo.birthDate;
      }
      else {
        this.selectedDOB.year = '';
        this.selectedDOB.month = '';
        this.selectedDOB.date = '';
      }
      this.myAccountModel.userData.emailId = res.emailId;
      this.myAccountModel.userData.password = "********";
      this.myAccountModel.profileInfo.firstName = res.firstName;
      this.myAccountModel.profileInfo.lastName = res.lastName;
      this.myAccountModel.profileInfo.gender = res.gender;
      this.myAccountModel.userId = res.userId;
      this.append_location = res.zipcode;

      if(res.zipcode != null && res.zipcode !='')
      {
        if (res.zipcode.toString().length == 5)
        {
          this.myAccount.getLocation(res.zipcode)
          .subscribe(data => {
            this.loader = false;
            this.fetchGeoCode = data.results[0].formatted_address;
            let addProfileAddress: boolean = false;
            this.profileAddress = new MyAccountAddress ( null,"","",this.fetchGeoCode.split(',')[0],this.fetchGeoCode.split(',')[1].trim().split(" ")[0],res.zipcode,"profileAddress");
          });
        }
      }
      this.getCard();
    });
  }

  addEvent(type: string, event: MatDatepickerInputEvent<Date>) {
    this.invalidDOB = false;
    if (event.value > this.maxDate) {
      this.invalidDOB = true;
      return false
    }
    else if (event.value < this.minDate) {
      this.invalidDOB = true;
      return false
    }
    else {
      this.selectedDOB.year = event.value.getFullYear().toString();
      this.selectedDOB.month = (event.value.getMonth() + 1).toString();
      this.selectedDOB.date = event.value.getDate().toString();
      this.myAccountModel.profileInfo.birthDate = this.selectedDOB.date;
      this.myAccountModel.profileInfo.birthMonth = this.selectedDOB.month.toString();
      this.myAccountModel.profileInfo.birthYear = this.selectedDOB.year;
      this.selectSelected(event);
      this.dateSelected = false;
    }
  }

  getCard() {
    this.loader_Card = true;
    this.myAccount.getCards(this.myAccountModel.userId).subscribe((res) => {
      this.getCardsDetails = [];
      if (res.length > 0) {
        this.customerId = res[0].customerId;
        for (var i = 0; i < res.length; i++) {
          this.getCardsDetails.push(new GetCustomerCards(res[i].userId, res[i].customerId, res[i].last4Digits, res[i].cardType, res[i].funding, res[i].cardId, res[i].cardHoldersName,res[i].defaultCard))
        }
        this.loader_Card = false;
        this.getCardsDetails.sort(function(a, b) {
          return b.defaultCard - a.defaultCard
        })
      }
    });
  }

  cancelPasswordEdit() {
    this.invalidPassword = false;
    this.emptyEmailAddress = false;
    this.emptyConfirmPassword = false;
    this.emptyNewPassword = false;
    this.oldNewPassword = false;
    this.newConfirmPassword = false;
    this.invalidEmailAddress = false;
    let getText = document.getElementsByClassName("cursor");
    for (let i = 0; i < getText.length; i++) {
      getText[i].removeAttribute("disabled");
    }
    this.input_Password = false;
  }

  emailNotify() {
    this.IsEmailNotify = !this.IsEmailNotify;
  }

  alertNotify() {
    this.IsAlertNotify = !this.IsAlertNotify;
  }

  resetAddAddress() {
    this.addShippingAddress = false;
  }

  updateCard(stripeAddCard) {
    this.myAccount.updateCard(stripeAddCard).subscribe((res) => {
      this.loader_addCard = false;
      if(res && res.message != null && res.source == null)
      {
        this.error = res.message;
      }
      else
      {
        this.error = "Card added successfully.";
      }
      setTimeout(() => {
        this.disableEdit('addCard');
        this.getCard();
      }, 5000);

      
      
    });
  }

  confirmDeleteCard(card) {
    this.saveCardDetails = card;
    this.core.openModal(this.deleteCardModal);
  }

  deleteCard() {
    this.loader_Card = true;
    let card = this.saveCardDetails;
    this.myAccount.deleteCard(card.customerId, card.cardId).subscribe((res) => {
      this.getCard();
    })
  }

  confirmDeleteAddress(address) {
    this.addressIdForDelete = address.addID;
    this.core.openModal(this.deleteAddressModal);
  }

  deleteAddress() {
    this.myAccount.deleteAddress(this.addressIdForDelete, this.getUserInfo.userId).subscribe((res) => {
      this.myAccountModel.profileInfo.address = new Array<MyAccountAddress>();
      this.myAccountModel.profileInfo.address = res.sort(function(a, b) {
        return b.defaultAddress - a.defaultAddress;
      })
    }, (err) => {
      console.log(err)
    })
  }

  async onSubmit(form: NgForm) {
    if (this.getUserInfo === undefined) this.error = "Please login to add new card";
    else if(this.addPaymentCard.controls.creditCard.value==""||this.addPaymentCard.controls.expirationDate.value==""||this.addPaymentCard.controls.cvc.value==""||this.addPaymentCard.controls.cardZipcode.value=="")
    {
      this.error = 'Please complete all fields.';
    } else if (!this.addPaymentCard.valid) {
      if (!this.addPaymentCard.touched) this.error = 'Please complete all fields.';
      else {
        if (!this.addPaymentCard.controls.creditCard.valid) this.error = 'Invalid Card Number';
        else if (!this.addPaymentCard.controls.expirationDate.valid) this.error = 'Invalid Expiration Date';
        else if (!this.addPaymentCard.controls.cvc.valid) this.error = 'Invalid CVC';
        else this.error = 'Invalid Zip Code';
      }
      return false;
    }
    else {
      this.loader_addCard = true;
      this.error = null;
      let formData = this.addPaymentCard.controls;
      let card = new PaymentCardModal();
      card.number = formData.creditCard.value.split(" ").join("");
      card.expMonth = parseFloat(formData.expirationDate.value.split("/")[0].trim());
      card.expYear = parseFloat(formData.expirationDate.value.split("/")[1].trim());
      card.cvc = formData.cvc.value;
      this.zone.runOutsideAngular(() => {
        cordova.plugins.stripe.createCardToken(card,
          (res) => this.zone.run(() => {
            this.stripeAddCard.customer.email = this.getUserInfo.emailId;
            this.stripeAddCard.customer.source = res.id;
            this.stripeAddCard.userId = this.getUserInfo.userId;
            this.stripeAddCard.customer.customerId = this.customerId;
            this.stripeAddCard.customer.defaultCard = this.addPaymentCard.controls.defaultPayment.value;
            if (this.getCardsDetails.length > 0) this.updateCard(this.stripeAddCard);
            else {
              this.myAccount.addCard(this.stripeAddCard).subscribe((res) => {
                this.loader_addCard = false;
                if(res && res.message != null && res.source == null)
                {
                  this.error = res.message;
                }
                else
                {
                  this.error = "Card added successfully.";
                }
                setTimeout(() => {
                  this.disableEdit('addCard');
                  this.getCard();
                }, 5000);

                
                
              });
            }
          }),
          (err) => this.zone.run(() => {
            this.loader_addCard = false;
            this.error = 'Failed to add card.'
            console.log("Failed");
          }))
      });
    }
  }

  getCardType(e) {
    if (e.currentTarget.value.length > 3) {
      this.zone.runOutsideAngular(() => {
        cordova.plugins.stripe.getCardType(e.currentTarget.value,
          (brand) => this.zone.run(() => {
            if (brand == 'American Express') brand = 'amex';
            if (brand == 'Diners Club') brand = 'diners';
            brand = brand.toLowerCase();
            const brandIconElement = document.getElementById('brand-icon');
            let pfClass = 'pf-credit-card';
            if (brand in this.cardBrandToPfClass) {
              pfClass = this.cardBrandToPfClass[brand];
            }
            for (let i = brandIconElement.classList.length - 1; i >= 0; i--) {
              brandIconElement.classList.remove(brandIconElement.classList[i]);
            }
            brandIconElement.classList.add('pf');
            brandIconElement.classList.add(pfClass);
          }));
      })
    }
  }

  selectInterest(e, obj) {
    if (this.getInterest == null) this.getInterest = [];
    obj.selectImg = !obj.selectImg;
    this.getInterest.push(new MyAccountConsumerInterest(obj.id, obj.consumerInterestImageName, obj.consumerInterestImagePath));
    this.getInterest = this.getInterest.filter((elem, index, self) => self.findIndex((img) => {
      return (img.id === elem.id && img.consumerInterestImageName === elem.consumerInterestImageName)
    }) === index);

    if (obj.selectImg == false) {
      for (let i = 0; i < this.getInterest.length; i++) {
        if (this.getInterest[i].id == obj.id) this.getInterest.splice(i, 1)
      }
    }
  }

  selectSelected(e) {
    this.model = {
      year: parseFloat(this.myAccountModel.profileInfo.birthYear),
      month: parseFloat(this.myAccountModel.profileInfo.birthMonth),
      day: parseFloat(this.myAccountModel.profileInfo.birthDate)
    };
    this.append_dob = this.model;
  }

  setImage(img) {
    this.loader_profileImage = true;
    /**API to Save New Email**/
    this.ProfileSaveModel.emailId = this.myAccountModel.userData.emailId;
    this.ProfileSaveModel.userId = this.myAccountModel.userId;
    this.ProfileSaveModel.profilePic = img;
    this.myAccount.saveProfileImage(this.ProfileSaveModel).subscribe((res) => {
      this.loader_profileImage = false;
      if (res.consumerImagePath.indexOf('data:') === -1 && res.consumerImagePath.indexOf('https:') === -1 && res.consumerImagePath.indexOf('http:') === -1) {
        res.consumerImagePath = 'https://s3.us-east-2.amazonaws.com/' + res.consumerImagePath;
      }
      window.localStorage['userInfo'] = JSON.stringify(res);
      this.core.hideUserInfo(false);
    }, (err) => {
      this.loader_profileImage = false;
      console.log(err);
    });
  }

  fileChangeEvent(fileInput: any) {
    if (fileInput.target.files && fileInput.target.files[0]) {
      let imgPath;
      /** 1 MB = 1048576 and 5MB = 5242880 */
      if (fileInput.target.files[0].size > 2097152)
      {
        this.core.openModal(this.fileSizeTooBig);
        fileInput.target.value = '';
      } 
      else
      {
      const reader = new FileReader();
     
      reader.onload = function (e: any) {
        imgPath = e.target.result;
      }
      reader.readAsDataURL(fileInput.target.files[0]);
      setTimeout(() => {
        this.mockProfileImage = imgPath;;
      }, 500);
    }
    }
  
  };

  uploadImage() {
    let element = document.getElementsByClassName('uploadImage')[0] as HTMLElement;
    element.click();
  }

  _keuyp(e) {
    // this.input_getLocation = false;
    // this.fetchGeoCode = '';
    // let input = e.currentTarget;
    // if (input.value.toString().length == 5) {
    //   this.loader = true;
    //   this.errorValidationMessage = '';
    //   input.setAttribute('readonly', true);
    //   this.myAccount.getLocation(input.value)
    //     .subscribe(data => {
    //       this.loader = false;
    //       this.input_getLocation = true;
    //       input.removeAttribute('readonly');
    //       this.fetchGeoCode = data.results[0].formatted_address;
    this.input_getLocation = false;
    this.fetchGeoCode = '';
    let input = e.currentTarget;
    if (input.value.toString().length == 5 ) {
      this.errorValidationMessage = '';
      this.loader = true;
      input.setAttribute('readonly', true);
      this.myAccount.getLocation(input.value)
        .subscribe(data => {
          this.loader = false;
          this.input_getLocation = true;
          input.removeAttribute('readonly');
          this.fetchGeoCode = data.results[0].formatted_address;
          let addProfileAddress: boolean = false;
          this.profileAddress = new MyAccountAddress ( null,"","",this.fetchGeoCode.split(',')[0],this.fetchGeoCode.split(',')[1].trim().split(" ")[0],input.value,"profileAddress");
        });
    }
  };
  _checkcardZipcode(e)
  {
    let fetchCardGeoCode = '';
    let input = e.currentTarget;
    if (input.value.toString().length == 5 ) {
      this.errorValidationMessage = '';
      this.loader = true;
      input.setAttribute('readonly', true);
      this.myAccount.getLocation(input.value)
        .subscribe(data => {
          this.loader = false;
          //this.input_getLocation = true;
          input.removeAttribute('readonly');
          this.error = "Invalid Zip Code."
          //fetchCardGeoCode = data.results[0].formatted_address;
         // let addProfileAddress: boolean = false;
         // this.profileAddress = new MyAccountAddress ( null,"","",this.fetchGeoCode.split(',')[0],this.fetchGeoCode.split(',')[1].trim().split(" ")[0],input.value,"profileAddress");
        });
    }
  }
  AppendAddAddressValidation(e)
  {
    let input = e.currentTarget;
    if (input.value.toString().length == 5  == true) {
      this.addEditInvalidZipCode =true;
      input.setAttribute('readonly', true);
      this.myAccount.getLocation(input.value)
        .subscribe(data => {
          input.removeAttribute('readonly');
          if(data.results.length != 0)
          {
            this.fetchGeoCode = data.results[0].formatted_address;
            let postLocales= data.results[0].postcode_localities;
            let validState ='';
            if(this.fetchGeoCode.split(',').length>=2) validState = this.fetchGeoCode.split(',')[this.fetchGeoCode.split(',').length-2].trim().split(" ")[0];
            let validCity ='';
            if(this.fetchGeoCode.split(',').length>=3) validCity = this.fetchGeoCode.split(',')[this.fetchGeoCode.split(',').length-3].trim();
           
            //same pincode can be there for multiple cities
            if(validCity.toLowerCase() != this.addShippingAddressForm.controls.addCity.value.trimLeft(' ').trimRight(' ').toLowerCase() )
            {
              let item = postLocales.find(i=>i.toLowerCase()==this.addShippingAddressForm.controls.addCity.value.trimLeft(' ').trimRight(' ').toLowerCase());
              if(item != undefined)
              {
                validCity = item;
              }
            }

            if(this.addShippingAddressForm.controls.addCity.value.trimLeft(' ').trimRight(' ').toLowerCase() == (validCity.toLowerCase()) && this.addShippingAddressForm.controls.addStates.value.trimLeft(' ').trimRight(' ').toLowerCase()== validState.toLowerCase())
            {
              this.addEditInvalidZipCode =false;
              return;
            }
            else
            {
              this.addEditInvalidZipCode =true;
              this.core.openModal(this.invalidAddressModel);
              return;
            }
          }
          else
          {
            this.addEditInvalidZipCode =true;
            this.core.openModal(this.invalidAddressModel);
            return;
          }
        })
      }
  }
  appendEditAddressValidation(e)
  {
    let input = e.currentTarget;
    if (input.value.toString().length == 5  == true) {
      this.addEditInvalidZipCode = true;
      input.setAttribute('readonly', true);
      this.myAccount.getLocation(input.value)
        .subscribe(data => {
          input.removeAttribute('readonly');
          if(data.results.length != 0)
          {
            this.fetchGeoCode = data.results[0].formatted_address;
            let postLocales= data.results[0].postcode_localities;
            let validState ='';
            if(this.fetchGeoCode.split(',').length>=2) validState = this.fetchGeoCode.split(',')[this.fetchGeoCode.split(',').length-2].trim().split(" ")[0];
            let validCity ='';
            if(this.fetchGeoCode.split(',').length>=3) validCity = this.fetchGeoCode.split(',')[this.fetchGeoCode.split(',').length-3].trim();
           
            //same pincode can be there for multiple cities
            if(validCity.toLowerCase() != this.editShippingAddressForm.controls.editCity.value.trimLeft(' ').trimRight(' ').toLowerCase() )
            {
              let item = postLocales.find(i=>i.toLowerCase()==this.editShippingAddressForm.controls.editCity.value.trimLeft(' ').trimRight(' ').toLowerCase());
              if(item != undefined)
              {
                validCity = item;
              }
            }
            if(( this.editShippingAddressForm.controls.editCity.value.trimLeft(' ').trimRight(' ').toLowerCase() == (validCity.toLowerCase())) && this.editShippingAddressForm.controls.editStates.value.trimLeft(' ').trimRight(' ').toLowerCase() == validState.toLowerCase())
            {
              this.addEditInvalidZipCode = false;
              return;
            }
            else
            {
              this.addEditInvalidZipCode = true;
              this.core.openModal(this.invalidAddressModel);
              return;
            }
          }
          else
          {
            this.addEditInvalidZipCode = true;
            this.core.openModal(this.invalidAddressModel);
            return;
          }
        })
      }
  }
  appendInput(e, element, obj?: any) {
    this.hideAllInputs(obj);
    if (e.currentTarget.innerHTML == 'done') {
      this.removeInput(e, element, obj);
      return false;
    }
    else {
      let getText = document.getElementsByClassName("cursor");
      for (let i = 0; i < getText.length; i++) {
        getText[i].setAttribute("disabled", "disabled");
        this.myAccountModel.profileInfo.consumerInterests != undefined ? this.getAPICP.consumerInterests : {};
      }
      if (element != 'password' && element != 'profileImage') {
        e.currentTarget.innerHTML = 'done';
      }

      e.currentTarget.removeAttribute("disabled");
      if (element == 'profileImage') {
        this.core.openModal(this.camModal);
        this.removeInput(e, element, obj); // To enable edit of other elements
      }
      else if (element == 'email') {
        this.input_Email = true;
        this.append_Email = this.emailElement.nativeElement.innerText;
      }
      else if (element == 'password') {
        this.input_Password = true;
        this.append_Password = this.myAccountModel.userData.password;
      }
      else if (element == 'location') {
        this.input_Location = true;
        this.append_location = this.locationElement.nativeElement.innerText;
      }
      else if (element == 'dob') {
        // this.dobSelected = false;
        this.append_dob = this.model;
        this.dateSelected = false;
        if (document.getElementsByClassName('datePickerInput')[0]) {
          setTimeout(() => {
            let date = document.getElementsByClassName('datePickerInput')[0] as HTMLElement;
            date.focus();
          }, 100)
        }
      }
      else if (element == 'interest') {
        this.myAccount.getInterest().subscribe(res => {
          this.getInterest = this.myAccountModel.profileInfo.consumerInterests;
          this.myAccountModel.profileInfo.consumerInterests = res;
          for (let i = 0; i < this.getInterest.length; i++) {
            let id = this.getInterest[i].id;
            for (let j = 0; j < this.myAccountModel.profileInfo.consumerInterests.length; j++) {
              if (id == this.myAccountModel.profileInfo.consumerInterests[j].id) {
                this.myAccountModel.profileInfo.consumerInterests[j].selectImg = true;
              }
            }
          }
        });
      }
      else if (element == 'shippingAddress') {
        this.getAllStates();
        obj.input_shippingAddress = true;
        obj.append_editAddressLine1 = obj.addressLine1;
        obj.append_editAddressLine2 = obj.addressLine2;
        obj.append_editShippingCity = obj.city;
        obj.append_editShippingState = obj.state;
        obj.append_editShippingZipcode = obj.zipcode;
        obj.append_editdefaultAddress = obj.defaultAddress;
      }
    }
  }

  removeInput(e, element, obj?: any) {
    let getText = document.getElementsByClassName("cursor");
    for (let i = 0; i < getText.length; i++) getText[i].removeAttribute("disabled");
    if (element != 'dob')
      e.currentTarget.innerHTML = '<i class="fa fa-caret-right" aria-hidden="true"></i>';
    if (element == 'email') {
      this.loader_emailImage = true;
      this.input_Email = false;
      /**API to Save Email**/
      this.EmailSaveModel.oldEmailId = this.getUserInfo.emailId;
      this.EmailSaveModel.newEmailId = this.append_Email;
      if (this.getUserInfo.emailId !== this.append_Email) {
        this.myAccount.saveEmail(this.EmailSaveModel).subscribe((res) => {
          this.loader_emailImage = false;
          this.myAccountModel.userData.emailId = this.append_Email;
          window.localStorage['userInfo'] = JSON.stringify(res);
        }, (err) => {
          this.loader_emailImage = false;
          console.log(err)
        });
        /**API to Save Email**/
        setTimeout(() => this.emailElement.nativeElement.innerText = this.append_Email, 100);
      }
    }
    else if (element == 'password') {
      this.input_Password = false;
      this.loader_password = true;
      this.getUserInfo = JSON.parse(window.localStorage['userInfo'])
      /**API to Save Password**/
      this.PasswordSaveModel.emailId = this.getUserInfo.emailId;
      this.PasswordSaveModel.userId = this.getUserInfo.userId;
      this.PasswordSaveModel.password = this.append_ConfirmPassword;
      this.myAccount.savePassword(this.PasswordSaveModel).subscribe((res) => {
        this.loader_password = false;
        localStorage.removeItem('token');
        localStorage.removeItem('userInfo');
        this.route.navigateByUrl('/search-result');
      }, (err) => {
        this.loader_password = false;
        console.log(err);
      });
      /**API to Save Password**/
      setTimeout(() => this.passwordElement.nativeElement.innerText = '......', 50);
    }
    else if (element == 'location') {
      this.input_Location = false;
      this.loader_profileAddress = true;
      this.getUserInfo = JSON.parse(window.localStorage['userInfo'])
      /**API to Save Address**/
      this.AddressSaveModel.emailId = this.getUserInfo.emailId;
      this.AddressSaveModel.userId = this.getUserInfo.userId;

      this.AddressSaveModel.address = this.myAccountModel.profileInfo.address;
      this.myAccount.saveAddress(this.AddressSaveModel).subscribe((res) => {
        this.loader_profileAddress = false;
        window.localStorage['userInfo'] = JSON.stringify(res);
      }, (err) => {
        this.loader_profileAddress = false;
        console.log(err);
      });
      /**API to Save Address**/
    }
    else if (element == 'dob') {
      // this.dobSelected = true
      this.dateSelected = true;
      this.invalidDOB = false;
      this.input_dob = false;
      this.loader_DOB = true;
      this.myAccountModel.profileInfo.birthDate = this.selectedDOB.date.toString();
      this.myAccountModel.profileInfo.birthMonth = this.selectedDOB.month.toString();
      this.myAccountModel.profileInfo.birthYear = this.selectedDOB.year.toString();
      this.getUserInfo = JSON.parse(window.localStorage['userInfo'])
      /**API to Save DOB**/
      this.DOBSaveModel.emailId = this.getUserInfo.emailId;
      this.DOBSaveModel.userId = this.getUserInfo.userId;
      this.DOBSaveModel.dateOfBirth = new Date(this.myAccountModel.profileInfo.birthYear + '-' + this.myAccountModel.profileInfo.birthMonth + '-' + this.myAccountModel.profileInfo.birthDate);

      //this.getUserInfo.emailId !== this.append_Email
      if (new Date(this.getUserInfo.dateOfBirth) == new Date(this.DOBSaveModel.dateOfBirth)) {
        this.myAccount.saveDOB(this.DOBSaveModel).subscribe((res) => {
          this.loader_DOB = false;
          this.model = this.append_dob;
          window.localStorage['userInfo'] = JSON.stringify(res);
          this.myAccountModel.profileInfo.dob = new Date(res.dateOfBirth);
          this.myAccountModel.profileInfo.birthDate = this.append_dob.day.toString();
          this.myAccountModel.profileInfo.birthMonth = this.append_dob.month.toString();
          this.myAccountModel.profileInfo.birthYear = this.append_dob.year.toString();
        }, (err) => {
          this.loader_DOB = false;
          console.log(err);
        });
      }
      /**API to Save DOB**/

      return false;
    }
    else if (element == 'interest') {
      this.loader_Interest = true;
      this.myAccountModel.profileInfo.consumerInterests = this.getInterest;
      this.getAPICP.consumerInterests = this.myAccountModel.profileInfo.consumerInterests
      this.getInterest = [];
      this.getUserInfo = JSON.parse(window.localStorage['userInfo'])
      this.InterestSaveModel.emailId = this.getUserInfo.emailId;
      this.InterestSaveModel.userId = this.getUserInfo.userId;
      this.InterestSaveModel.consumerInterests = this.myAccountModel.profileInfo.consumerInterests;
      this.myAccount.saveInterest(this.InterestSaveModel).subscribe((res) => {
        this.loader_Interest = false;
        window.localStorage['userInfo'] = JSON.stringify(res);
      }, (err) => {
        this.loader_Interest = false;
        console.log(err);
      });
    }
    else if (element == 'shippingAddress') {

                      this.loader_shippingAddress = true;
                      obj.input_shippingAddress = false;
                      obj.addressLine1 = obj.append_editAddressLine1;
                      obj.addressLine2 = obj.append_editAddressLine2;
                      obj.city = obj.append_editShippingCity;
                      obj.state = obj.append_editShippingState;
                      obj.zipcode = obj.append_editShippingZipcode;
                      delete obj.append_editAddressLine1;
                      delete obj.append_editAddressLine2;
                      delete obj.append_editShippingCity;
                      delete obj.append_editShippingState;
                      delete obj.append_editShippingZipcode;
                      delete obj.append_editdefaultAddress;
                      /**API to Save Address**/
                      this.getUserInfo = JSON.parse(window.localStorage['userInfo'])
                      this.AddressSaveModel.emailId = this.getUserInfo.emailId;
                      this.AddressSaveModel.userId = this.getUserInfo.userId;
                      this.AddressSaveModel.address = this.myAccountModel.profileInfo.address;
                      this.myAccount.saveAddress(this.AddressSaveModel).subscribe((res) => {
                        this.loader_shippingAddress = false;
                        window.localStorage['userInfo'] = JSON.stringify(res);
                      }, (err) => {
                        this.loader_shippingAddress = false;
                        console.log(err);
                      });
                      /**API to Save Address**/
                  
                  
    }
    
  }

  getAllStates() {
    if (this.getStates == undefined) {
      this.myAccount.getAllStates().subscribe((res) => {
        this.getStates = res.stateAbbreviation;
      })
    }
  }

  emailValidator() {
    this.emptyEmailAddress = false;
    this.invalidEmailAddress = false;
    if (!this.append_Email) this.emptyEmailAddress = true;
    else if (this.emailRegex.test(this.append_Email) == false) this.invalidEmailAddress = true;
  }

  passwordValidator() {
    this.emptyOldPassword = false;
    this.emptyNewPassword = false;
    this.emptyConfirmPassword = false;
    this.invalidPassword = false;
    this.oldNewPassword = false;
    this.newConfirmPassword = false;
    if (!this.append_NewPassword) this.emptyNewPassword = true;
    else if (this.passwordRegex.test(this.append_NewPassword) == false) this.invalidPassword = true;
    else if (!this.append_ConfirmPassword) this.emptyConfirmPassword = true;
    else if (this.passwordRegex.test(this.append_ConfirmPassword) == false) this.invalidPassword = true;
    else if (this.append_Password == this.append_NewPassword) this.oldNewPassword = true;
    else if (this.append_NewPassword != this.append_ConfirmPassword) this.newConfirmPassword = true;
  }

  terminate(from, obj?: any) {
    let getText = document.getElementsByClassName("cursor");
    for (let i = 0; i < getText.length; i++) getText[i].removeAttribute("disabled");
    if (from == 'addAddress') {
      this.addShippingAddress = false;
      this.append_addAddressLine1 = "";
      this.append_addAddressLine2 = "";
      this.append_addShippingCity = "";
      this.append_addShippingState = "";
      this.append_addShippingZipcode = "";
    }
    else if (from == 'editAddress') {
      obj.input_shippingAddress = false;
      obj.append_editAddressLine1 = obj.addressLine1;
      obj.append_editAddressLine2 = obj.addressLine2;
      obj.append_editShippingCity = obj.city;
      obj.append_editShippingState = obj.state;
      obj.append_editShippingZipcode = obj.zipcode;
    }
  }
  hideAllInputs(obj?: any) {
    this.input_Email = false;
    this.input_Password = false;
    this.input_Location = false;
    this.input_dob = false;
    this.input_getLocation = false;
    this.oldNewPassword = false;
    this.newConfirmPassword = false;
    this.invalidPassword = false;
    this.emptyOldPassword = false;
    this.emptyNewPassword = false;
    this.emptyConfirmPassword = false;
    this.selectImg = false;
    if (obj != undefined) obj.input_shippingAddress = false;
  }
  ShowAllAddress() {
    if (this.addresscount == 1) {
      this.addresscount = this.myAccountModel.profileInfo.address.length;
    }
    else {
      this.addresscount = 1;
    }

  }

  enableEdit(from, data?: any) {
    if (from == 'profileImage') {
      this.editProfileImage = true;
    }
    else if (from == 'password') {
      this.editPassword = true;
    }
    else if (from == 'consumerInterest') {
      this.editConsumerInterest = true;
      this.loader_Interest = true;
      this.myAccount.getInterest().subscribe(res => {
        this.loader_Interest = false;
        this.getInterest = this.myAccountModel.profileInfo.consumerInterests;
        this.myAccountModel.profileInfo.consumerInterests = res;
        if (this.getInterest) {
          for (let i = 0; i < this.getInterest.length; i++) {
            let id = this.getInterest[i].id;
            for (let j = 0; j < this.myAccountModel.profileInfo.consumerInterests.length; j++) {
              if (id == this.myAccountModel.profileInfo.consumerInterests[j].id) {
                this.myAccountModel.profileInfo.consumerInterests[j].selectImg = true;
              }
            }
          }
        }
      });
    }
    else if (from == 'gender') {
      if(this.myAccountModel.profileInfo.gender)
      {
        this.changeGenderForm = this.formBuilder.group({
          gender: [this.myAccountModel.profileInfo.gender, Validators.required]
        });
      }
      this.editGender = true;
    }
    else if (from == 'dob') {
      this.editDateOfBirth = true;
    }
    else if (from == 'location') {
      this.editLocation = true;
      this.append_location ="";
    }
    else if (from == 'addCard') {
      this.editCard = true;
      this.ngAfterViewInit();
    }
    else if (from == 'addShipping') {
      this.ngAfterViewInit();
      this.addShipping = true;
      this.getAllStates();
    }
    else if (from == 'editShipping') {
      this.editShipping = true;
      this.getAllStates();
      this.editShippingId = data.addID;
      this.editShippingAddressForm = this.formBuilder.group({
        editaddressLineOne: [data.addressLine1, [Validators.required]],
        editaddressLineTwo: [data.addressLine2, [Validators.required]],
        editCity: [data.city, [Validators.required]],
        editStates: [data.state, [Validators.required]],
        editZipcode: [data.zipcode, [Validators.required]],
        defaultAddress: [data.defaultAddress],
      });
    }
  }

  disableEdit(from) {
    if (from == 'profileImage') {
      this.editProfileImage = false;
    }
    else if (from == 'password') {
      this.editPassword = false;
    }
    else if (from == 'consumerInterest') {
      this.editConsumerInterest = false;
      this.getInterest = JSON.parse(window.localStorage['savedInterest']);
      this.myAccountModel.profileInfo.consumerInterests = this.getInterest;
    }
    else if (from == 'gender') {
      this.editGender = false;
    }
    else if (from == 'dob') {
      this.editDateOfBirth = false;
    }
    else if (from == 'location') {
      this.editLocation = false;
      this.fetchGeoCode = '';
    }
    else if (from == 'addCard') {
      this.editCard = false;
      this.error = null;
      let getText = document.getElementsByClassName("cursor");
      for (let i = 0; i < getText.length; i++) getText[i].removeAttribute("disabled");
      this.ngAfterViewInit();
    }
    else if (from == 'addShipping') {
      this.addShipping = false;
    }
    else if (from == 'editShipping') {
      this.editShipping = false;
    }
    this.errorValidationMessage = '';
    this.ngAfterViewInit();
  }

  saveChange(from) {
    if (from == 'profileImage') {
      this.loader_profileImage = true;
      this.myAccountModel.profileInfo.consumerImagePath = this.mockProfileImage;
      this.ProfileSaveModel.emailId = this.myAccountModel.userData.emailId;
      this.ProfileSaveModel.userId = this.myAccountModel.userId;
      this.ProfileSaveModel.profilePic = this.myAccountModel.profileInfo.consumerImagePath;
      this.myAccount.saveProfileImage(this.ProfileSaveModel).subscribe((res) => {
        this.loader_profileImage = false;
        if (res.consumerImagePath.indexOf('data:') === -1 && res.consumerImagePath.indexOf('https:') === -1 && res.consumerImagePath.indexOf('http:') === -1) {
          res.consumerImagePath = this.imgS3 + res.consumerImagePath;
        }
        window.localStorage['userInfo'] = JSON.stringify(res);
        this.core.hideUserInfo(false);
        this.editProfileImage = false;
      }, (err) => {
        this.loader_profileImage = false;
        console.log(err);
      });
    }
    else if (from == 'password') {
      if (!this.changePasswordForm.controls.newPassword.value) this.errorValidationMessage = 'Please enter new password';
      else if (!this.changePasswordForm.controls.newPassword.valid) this.errorValidationMessage = 'Password length must be at least 8 characters: 1 Uppercase Character, 1 Lowercase Character, 1 Number and 1 Special Character'
      else if (!this.changePasswordForm.controls.confirmPassword.value) this.errorValidationMessage = 'Please confirm new password'
      else if (!this.changePasswordForm.controls.confirmPassword.valid) this.errorValidationMessage = 'Password length must be at least 8 characters: 1 Uppercase Character, 1 Lowercase Character, 1 Number and 1 Special Character'
      else if (this.changePasswordForm.controls.newPassword.value !== this.changePasswordForm.controls.confirmPassword.value) this.errorValidationMessage = 'Passwords do not match';
      else {
        this.errorValidationMessage = '';
        this.loader_password = true;
        this.getUserInfo = JSON.parse(window.localStorage['userInfo'])
        this.PasswordSaveModel.emailId = this.getUserInfo.emailId;
        this.PasswordSaveModel.userId = this.getUserInfo.userId;

        this.PasswordSaveModel.password = this.changePasswordForm.controls.confirmPassword.value;
        this.myAccount.savePassword(this.PasswordSaveModel).subscribe((res) => {
          this.loader_password = false;
          localStorage.removeItem('token');
          localStorage.removeItem('userInfo');
          this.route.navigateByUrl('/search-result');
        }, (err) => {
          this.loader_password = false;
          console.log(err);
        });
      }
    }
    else if (from == 'gender') {
      if (!this.changeGenderForm.controls.gender.value) this.errorValidationMessage = 'Please select a gender';
      else {
        this.loader_gender = true;
        this.errorValidationMessage = '';
        this.myAccount.saveGender(this.getUserInfo.userId, this.changeGenderForm.controls.gender.value).subscribe((res) => {
          this.loader_gender = false;
          this.myAccountModel.profileInfo.gender = res.gender;
          window.localStorage['userInfo'] = JSON.stringify(res);
          this.editGender = false;
          this.ngAfterViewInit();
        }, (err) => {
          this.loader_gender = false;
          console.log(err);
        });
      }
    }
    else if (from == 'dob') {
      this.loader_DOB = true;
      this.myAccountModel.profileInfo.birthDate = this.selectedDOB.date.toString();
      this.myAccountModel.profileInfo.birthMonth = this.selectedDOB.month.toString();
      this.myAccountModel.profileInfo.birthYear = this.selectedDOB.year.toString();
      this.getUserInfo = JSON.parse(window.localStorage['userInfo'])
      this.DOBSaveModel.emailId = this.getUserInfo.emailId;
      this.DOBSaveModel.userId = this.getUserInfo.userId;
      let newDOB = new Date(this.myAccountModel.profileInfo.birthYear + '/' + this.myAccountModel.profileInfo.birthMonth + '/' + this.myAccountModel.profileInfo.birthDate);
      //this.DOBSaveModel.dateOfBirth = new Date(newDOB.getFullYear() + '/' + (newDOB.getMonth() + 1) + '/' + newDOB.getDate() + ' ' + new Date().getHours() + ':' + new Date().getMinutes() + ':' + new Date().getSeconds());
      this.DOBSaveModel.dateOfBirth = newDOB;
      this.DOBSaveModel.stringDateOfBirth = this.myAccountModel.profileInfo.birthYear + '/' + this.myAccountModel.profileInfo.birthMonth + '/' + this.myAccountModel.profileInfo.birthDate;
      this.myAccount.saveDOB(this.DOBSaveModel).subscribe((res) => {
        this.loader_DOB = false;
        window.localStorage['userInfo'] = JSON.stringify(res);
        this.myAccountModel.profileInfo.dob = new Date(res.stringDateOfBirth);
        this.editDateOfBirth = false;
      }, (err) => {
        this.loader_DOB = false;
        console.log(err);
      });
    }
    else if (from == 'location') {
      if (!this.changeLocationForm.controls.location.value) this.errorValidationMessage = 'Please enter a Zip Code';
      else {
        let addProfileAddress: boolean = false;
        // for (let i = 0; i < this.myAccountModel.profileInfo.address.length; i++) {
        //   let address = this.myAccountModel.profileInfo.address[i]
        //   if (address.addressType == 'profileAddress') {
        //     address.city =this.fetchGeoCode!=''? this.fetchGeoCode.split(',')[0]:'';
        //     address.state =this.fetchGeoCode!=''? this.fetchGeoCode.split(',')[1].trim().split(" ")[0]:'';
        //     address.zipcode = this.changeLocationForm.controls.location.value;
        //     addProfileAddress = true;
        //     break;
        //   }
        //   else addProfileAddress = false;
        // }
        // if (addProfileAddress == false) {
        //   this.myAccountModel.profileInfo.address.push({
        //     addID: null,
        //     addressLine1: "",
        //     addressLine2: "",
        //     addressType: "profileAddress",
        //     city:this.fetchGeoCode!=''? this.fetchGeoCode.split(',')[0]:'',
        //     state:this.fetchGeoCode !=''? this.fetchGeoCode.split(',')[1].trim().split(" ")[0]:'',
        //     zipcode: this.changeLocationForm.controls.location.value
        //   })
        // }
        this.errorValidationMessage = '';
        this.input_Location = false;
        this.loader_profileAddress = true;
        this.getUserInfo = JSON.parse(window.localStorage['userInfo'])
        this.AddressSaveModel.emailId = this.getUserInfo.emailId;
        this.AddressSaveModel.userId = this.getUserInfo.userId;
        this.AddressSaveModel.address = this.myAccountModel.profileInfo.address;
        this.AddressSaveModel.zipcode = this.append_location;
        this.myAccount.saveLocation(this.AddressSaveModel).subscribe((res) => {
          this.fetchGeoCode = '';
          this.loader_profileAddress = false;
          window.localStorage['userInfo'] = JSON.stringify(res);
          this.editLocation = false;
          this.ngAfterViewInit();
        }, (err) => {
          this.loader_profileAddress = false;
          console.log(err);
        });
      }
    }
    else if (from == 'addShipping') {
      if (!this.addShippingAddressForm.controls.addressLineOne.value) this.errorValidationMessage = 'Please enter Address Line 1';
      else if (!this.addShippingAddressForm.controls.addCity.value) this.errorValidationMessage = 'Please enter City';
      else if (!this.addShippingAddressForm.controls.addStates.value) this.errorValidationMessage = 'Please select a State';
      else if (!this.addShippingAddressForm.controls.addZipcode.value) this.errorValidationMessage = 'Please enter a Zip Code';
      else {

        this.myAccount.validateAddress(new MyAccountAddress(null,  this.addShippingAddressForm.controls.addressLineOne.value, this.addShippingAddressForm.controls.addressLineTwo.value, this.addShippingAddressForm.controls.addCity.value, this.addShippingAddressForm.controls.addStates.value, this.addShippingAddressForm.controls.addZipcode.value.toString(), 'shippingAddress')).subscribe((resp) => {
          console.log(resp);
          if(resp.messages ==undefined)
          {
                 
  
  this.myAccount.getLocation(this.addShippingAddressForm.controls.addZipcode.value)
            .subscribe(data => {
              if(data.results.length != 0)
              {
              this.fetchValidGeoCode = data.results[0].formatted_address;
              let postLocales = data.results[0].postcode_localities;
                    let validState ='';
                    if(this.fetchValidGeoCode.split(',').length>=2) validState = this.fetchValidGeoCode.split(',')[this.fetchValidGeoCode.split(',').length-2].trim().split(" ")[0].toLowerCase();
                    let validCity ='';
                    if(this.fetchValidGeoCode.split(',').length>=3) validCity = this.fetchValidGeoCode.split(',')[this.fetchValidGeoCode.split(',').length-3].trim().toLowerCase();
                  
                    if(postLocales !=undefined && validCity !=this.addShippingAddressForm.controls.addCity.value.trimLeft().trimRight().toLowerCase() )
                    {
                      let item = postLocales.find(i=>i.toLowerCase()==this.addShippingAddressForm.controls.addCity.value.trimLeft().trimRight().toLowerCase());
                      if(item != undefined)
                      {
                        validCity = item;
                      }
                    }
                    let cityExists = false;
                  if(validCity !=this.addShippingAddressForm.controls.addCity.value.trimRight().trimLeft().toLowerCase())
                  {
                    let cityArr =validCity!=undefined? validCity.split(' '):[];
                    let objCityArr = this.addShippingAddressForm.controls.addCity.value.trimLeft().trimRight().split(' ');
                    if(cityArr.length>1)
                    {
                      if(objCityArr.length>1)
                      {
                            if(cityArr[1].toLowerCase() == objCityArr[1].toLowerCase())
                            {
                              cityExists = true;
                            }
                          
                      }
                    }
                  }
                    if((this.addShippingAddressForm.controls.addCity.value.trimLeft().trimRight().toLowerCase() == validCity|| cityExists) && validCity!='' && validState !='' && validState == this.addShippingAddressForm.controls.addStates.value.trimLeft(' ').trimRight(' ').toLowerCase())
                    {
                      this.errorValidationMessage = '';
                      this.loader_shippingAddress = true;
                      if(this.editShippingAddressForm.controls.appendAdddefaultShipping)
                      {
                        for (let i = 0; i < this.myAccountModel.profileInfo.address.length; i++) {
                          let address = this.myAccountModel.profileInfo.address[i];
                          if (address.addressType == 'shippingAddress' ) {
                            address.defaultAddress = false;
                          }
                        }
                      }
                      this.myAccountModel.profileInfo.address.push(new MyAccountAddress(null, this.addShippingAddressForm.controls.addressLineOne.value, this.addShippingAddressForm.controls.addressLineTwo.value, this.addShippingAddressForm.controls.addCity.value, this.addShippingAddressForm.controls.addStates.value, this.addShippingAddressForm.controls.addZipcode.value.toString(), 'shippingAddress', this.addShippingAddressForm.controls.appendAdddefaultShipping.value));
                      this.AddressSaveModel.emailId = this.getUserInfo.emailId;
                      this.AddressSaveModel.userId = this.getUserInfo.userId;
                      this.AddressSaveModel.address = this.myAccountModel.profileInfo.address;
                      this.myAccount.saveAddress(this.AddressSaveModel).subscribe((res) => {
                        this.loader_shippingAddress = false;
                        this.myAccountModel.profileInfo.address = res.address.sort(function(a, b) {
                          return b.defaultAddress - a.defaultAddress;
                        });
                        window.localStorage['userInfo'] = JSON.stringify(res);
                        this.addShipping = false;
                        this.ngAfterViewInit();
                      }, (err) => {
                        this.addShipping = true;
                        console.log(err);
                      });
                    }
                    else
                    {
                      this.addEditInvalidZipCode =true;
                      this.core.openModal(this.invalidAddressModel);
                      return;
                    }
                  }
                  else
                  {
                    this.addEditInvalidZipCode =true;
                    this.core.openModal(this.invalidAddressModel);
                    return;
                  }
                });
      }
      else
      {
        this.addEditInvalidZipCode =true;
        this.core.openModal(this.invalidAddressModel);
        return;
      }
    });
    }
  }
    else if (from == 'editShipping') {
      if (!this.editShippingAddressForm.controls.editaddressLineOne.value) this.errorValidationMessage = 'Please enter Address Line 1';
      else if (!this.editShippingAddressForm.controls.editCity.value) this.errorValidationMessage = 'Please enter City';
      else if (!this.editShippingAddressForm.controls.editStates.value) this.errorValidationMessage = 'Please select a State';
      else if (!this.editShippingAddressForm.controls.editZipcode.value) this.errorValidationMessage = 'Please enter a Zip Code';
      else {



        this.myAccount.validateAddress(new MyAccountAddress(null,  this.editShippingAddressForm.controls.editaddressLineOne.value, this.editShippingAddressForm.controls.editaddressLineTwo.value, this.editShippingAddressForm.controls.editCity.value, this.editShippingAddressForm.controls.editStates.value, this.editShippingAddressForm.controls.editZipcode.value.toString(), 'shippingAddress')).subscribe((resp) => {
          console.log(resp);
          if(resp.messages ==undefined)
          {
                 
  
  this.myAccount.getLocation(this.editShippingAddressForm.controls.editZipcode.value)
            .subscribe(data => {
              if(data.results.length != 0)
              {
              this.fetchValidGeoCode = data.results[0].formatted_address;
              let postLocales = data.results[0].postcode_localities;
                    let validState ='';
                    if(this.fetchValidGeoCode.split(',').length>=2) validState = this.fetchValidGeoCode.split(',')[this.fetchValidGeoCode.split(',').length-2].trim().split(" ")[0].toLowerCase();
                    let validCity ='';
                    if(this.fetchValidGeoCode.split(',').length>=3) validCity = this.fetchValidGeoCode.split(',')[this.fetchValidGeoCode.split(',').length-3].trim().toLowerCase();
                  
                    if(postLocales !=undefined && validCity !=this.editShippingAddressForm.controls.editCity.value.trimLeft().trimRight().toLowerCase() )
                    {
                      let item = postLocales.find(i=>i.toLowerCase()==this.editShippingAddressForm.controls.editCity.value.trimLeft().trimRight().toLowerCase());
                      if(item != undefined)
                      {
                        validCity = item;
                      }
                    }
                    let cityExists = false;
                  if(validCity !=this.editShippingAddressForm.controls.editCity.value.trimRight().trimLeft().toLowerCase())
                  {
                    let cityArr =validCity!=undefined? validCity.split(' '):[];
                    let objCityArr = this.editShippingAddressForm.controls.editCity.value.trimLeft().trimRight().split(' ');
                    if(cityArr.length>1)
                    {
                      if(objCityArr.length>1)
                      {
                            if(cityArr[1].toLowerCase() == objCityArr[1].toLowerCase())
                            {
                              cityExists = true;
                            }
                          
                      }
                    }
                  }
                    if((this.editShippingAddressForm.controls.editCity.value.trimLeft().trimRight().toLowerCase() == validCity || cityExists) && validCity!='' && validState !='' && validState == this.editShippingAddressForm.controls.editStates.value.trimLeft(' ').trimRight(' ').toLowerCase())
                    {
                      if(this.editShippingAddressForm.controls.defaultAddress)
                      {
                        for (let i = 0; i < this.myAccountModel.profileInfo.address.length; i++) {
                          let address = this.myAccountModel.profileInfo.address[i];
                          if (address.addressType == 'shippingAddress' ) {
                            address.defaultAddress = false;
                          }
                        }
                      }
                     
                      this.errorValidationMessage = '';
                      this.loader_shippingAddress = true;
                      this.myAccountModel.profileInfo.address = this.myAccountModel.profileInfo.address.filter((item) => item.addID != this.editShippingId);
                      this.myAccountModel.profileInfo.address.push(new MyAccountAddress(this.editShippingId, this.editShippingAddressForm.controls.editaddressLineOne.value, this.editShippingAddressForm.controls.editaddressLineTwo.value, this.editShippingAddressForm.controls.editCity.value, this.editShippingAddressForm.controls.editStates.value, this.editShippingAddressForm.controls.editZipcode.value.toString(), 'shippingAddress', this.editShippingAddressForm.controls.defaultAddress.value));
                      this.AddressSaveModel.emailId = this.getUserInfo.emailId;
                      this.AddressSaveModel.userId = this.getUserInfo.userId;
                      this.AddressSaveModel.address = this.myAccountModel.profileInfo.address;
                      this.myAccount.saveAddress(this.AddressSaveModel).subscribe((res) => {
                        this.loader_shippingAddress = false;
                        this.myAccountModel.profileInfo.address = res.address.sort(function(a, b) {
                          return b.defaultAddress - a.defaultAddress;
                        });;
                        window.localStorage['userInfo'] = JSON.stringify(res);
                        this.editShipping = false;
                        this.ngAfterViewInit();
                      }, (err) => {
                        this.editShipping = true;
                        console.log(err);
                      });
                    }
                    else
                    {
                      this.addEditInvalidZipCode =true;
                      this.core.openModal(this.invalidAddressModel);
                      return;
                    }
                  }
                  else
                  {
                    this.addEditInvalidZipCode =true;
                    this.core.openModal(this.invalidAddressModel);
                    return;
                  }
                });
      }
      else
      {
        this.addEditInvalidZipCode =true;
        this.core.openModal(this.invalidAddressModel);
        return;
      }
    });
  }
    }
    else if (from == 'consumerInterest') {
      this.loader_Interest = true;
      this.myAccountModel.profileInfo.consumerInterests = this.getInterest;
      this.getAPICP.consumerInterests = this.myAccountModel.profileInfo.consumerInterests
      this.getInterest = [];
      this.getUserInfo = JSON.parse(window.localStorage['userInfo'])
      this.InterestSaveModel.emailId = this.getUserInfo.emailId;
      this.InterestSaveModel.userId = this.getUserInfo.userId;
      this.InterestSaveModel.consumerInterests = this.myAccountModel.profileInfo.consumerInterests;
      this.myAccount.saveInterest(this.InterestSaveModel).subscribe((res) => {
        this.loader_Interest = false;
        window.localStorage['savedInterest'] = JSON.stringify(res.consumerInterests);
        window.localStorage['userInfo'] = JSON.stringify(res);
        this.editConsumerInterest = false;
      }, (err) => {
        this.loader_Interest = false;
        console.log(err);
      });
    }
  }
}
