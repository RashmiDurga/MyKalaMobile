import { Component, OnInit, ChangeDetectorRef, Output, EventEmitter, ViewChild, ElementRef, DoCheck, OnDestroy, IterableDiffers, NgZone } from '@angular/core';
import { Router, RouterOutlet, ActivatedRoute } from '@angular/router';
import { Conversation, MsgDirection, QuestionPopUp } from '../../models/conversation';
import { UserProfile, User } from '../../models/user';
import { AuthService } from '../../services/auth.service';
import { LocalStorageService } from '../../services/LocalStorage.service';
import { CoreService } from '../../services/core.service';
import { ConsumerProfileInfo } from '../../models/consumer-profile-info';
import { ProfileInfoService } from '../../services/profile-info.service';
import { JoinKalaService } from '../../services/join-kala.service';
import { userMessages, inputValidation } from './join.message';
import { NgbDateStruct, NgbCalendar, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CheckoutService } from '../../services/checkout.service';
import { CheckoutShippingAddress } from '../../models/checkoutShippingAddress';
import { AvalaraTaxModel, shippingAddress, ItemsTaxModel, ItemsTaxList } from '../../models/tax';
import { StripeAddCardModel } from '../../models/StripeAddCard';
import { StripeCheckoutModal } from '../../models/StripeCheckout';
import { MyAccountGetModel, MyAccountConsumerInterest, MyaccountProfileInfo, MyAccountUserData, MyAccountAddress } from '../../models/myAccountGet';
import { MyAccountAddressModel } from '../../models/myAccountPost';
import { FormBuilder, FormGroup, Validators, NgForm } from '@angular/forms';
import { regexPatterns } from '../../common/regexPatterns';
import { OrderListing, Orders, OrderCheckout, ProduDimention } from '../../models/orderListing';
import { GetCustomerCards } from '../../models/getCards';
import { Ng4LoadingSpinnerModule, Ng4LoadingSpinnerService, Ng4LoadingSpinnerComponent } from 'ng4-loading-spinner';
import { HomeService } from '../../services/home.service';
import { SearchDataModal } from '../../models/searchData.modal';
import { GetOfferService } from '../../services/getOffer.service';
import { OfferInfo1 } from '../../models/steps.modal';
import { GetOfferModal } from '../../models/getOffer.modal';
import { OfferInfo3 } from '../../models/steps.modal';
import { OfferInfo4 } from '../../models/steps.modal';
import { ForgotPasswordService } from '../../services/forgotPassword.service';
import { ForgotPasswordModal } from '../../models/forgotPassword.modal';
import { ConsumerInterestService } from '../../services/consumer-interest.service';
import { ConsumerInterest, PostInterest } from '../../models/consumer-interest';
import { ConsumerSupportModal } from '../../models/support';
import { MyOrdersService } from '../../services/myorder.service';
import { ProductCheckout, Address, OrderItems } from '../../models/productCheckout';
import { MyCartService } from '../../services/mycart.service';
import { BrowseProductsModal } from '../../models/browse-products';
import { environment } from '../../../environments/environment';
import { CreditCardValidator } from 'angular-cc-library';
import { PaymentCardModal } from '../../models/paymentCard';
import { ConsumerAddress } from '../../models/consumer-address';
import { MyAccountService } from '../../services/myAccount.service';

declare let navigator: any;
const after = (one: NgbDateStruct, two: NgbDateStruct) =>
    !one || !two ? false : one.year === two.year ? one.month === two.month ? one.day === two.day
        ? false : one.day > two.day : one.month > two.month : one.year > two.year;
@Component({
    selector: 'app-search-result',
    templateUrl: './search-result.component.html',
    styleUrls: ['./search-result.component.css']
})

export class SearchResultComponent implements OnInit, DoCheck, OnDestroy {
    @Output() dateSelect = new EventEmitter<NgbDateStruct>();
    @ViewChild('picker') picker;
    @ViewChild('terminateSinupProcessModal') terminateSinupProcessModal: ElementRef;
    signUp4NextTime:boolean= false;
    confirmValidationMsg = { label: '', message: '' };
    interestImages: any;
    getInterest = [];
    postInterest = new PostInterest;
    showInterestPreference: boolean = false;
    addCard: boolean = false;
    itemsInCart: any;
    productTaxIIC: number;
    avalaraTaxModel = new AvalaraTaxModel();
    totalAmountFromCart: number;
    editShippingAddressForm: FormGroup;
    addShippingAddressForm: FormGroup;
    card: any;
    cardHandler = this.onChange.bind(this);
    cardNumber: any;
    cardExpiry: any;
    cardCvc: any;
    cardZip: any;
    @ViewChild('invalidAddressModel') invalidAddressModel: ElementRef;
    @ViewChild('cardInfo') cardInfo: ElementRef;
    @ViewChild('cardNumber') cardNumberInfo: ElementRef;
    @ViewChild('cardExpiry') cardExpiryInfo: ElementRef;
    @ViewChild('cardCvc') cardCvcInfo: ElementRef;
    @ViewChild('cardZip') cardZipInfo: ElementRef;
    @ViewChild('checkoutConfirmModal') checkoutConfirmModal: ElementRef;
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
    conversations: Array<Conversation>;
    conversation: Conversation;
    noAuthentication: boolean = false;
    userInactive: boolean = false;
    unAuthorized: boolean = false;
    showaddressQuestPopup: boolean = false;
    userInfo: any;
    suggestUserInfo: any;
    userCredential: any;
    UserInput: any;
    usr: UserProfile;
    questionPopUps: Array<QuestionPopUp>;
    camFlag: boolean = false;
    profileInformation = new ConsumerProfileInfo();
    getUserInfo: any;
    ifNoDeliveryMethod: boolean = false;
    readStripe: boolean = false;
    loader_Address: boolean = false;

    profileInfoResponse = {
        status: false,
        response: "",
        message: ""
    };
    signUpResponse = {
        status: false,
        message: ""
    };
    joinUserMsg = userMessages;
    minDate;
    maxDate;
    public today: Date = new Date();
    input_dob: boolean = false;
    append_dob = new Date();
    fromDate: NgbDateStruct;
    toDate: NgbDateStruct;
    invalidInput: boolean = false;
    invalidInputText: any;
    //checkout code 
    filteredCartItems = [];
    showShippingMethod: boolean = false;
    loader_shippingMethod: boolean = false;
    selectedCardDetails: any;
    selectedAddressDetails: any;
    selectedMethodDetails: any;
    paymentSuccessfullMsg: any;
    shippingMethod: any;
    loader_productTax: boolean = false;
    shippingAddressCheckout = Array<CheckoutShippingAddress>();
    totalProductTax: number = 0;
    error: string;
    AddressSaveModel = new MyAccountAddressModel();
    addEditInvalidZipCode:boolean = false;
    invalidAddress:any ='The shipping address you selected is not valid.';
    loggedIn: boolean = false;
    loader: boolean = false;
    loader_chargeAmount: boolean = false;
    stripeAddCard = new StripeAddCardModel();
    stripeCheckout = new StripeCheckoutModal();
    ProductCheckoutModal = new ProductCheckout();
    avalaraId : string;
    closeResult: string;
    userId: string;
    getCardsDetails: any;
    loader_getCards: boolean = false;
    retailerReturnPolicy: string;
    sowShippingMethod: boolean = false;
    customerId: string;
    editShippingAddressFormWrapper: boolean = false;
    addShippingAddressFormWrapper: boolean = false;
    addressFormData: any;
    retiailerShipIds = [];
    finalShippingAmount: number = 0;
    shippingLabels: string;
    shippingLabelsArr: Array<any>;
    lastLabel: number;
    getStates: any;
    showMoreLessStr = "Show More";
    showAddressBool: boolean = false;
    selectedOrder: any;
    trackingOrder: any;
    template: string = `<img src="./assets/images/kalaLoader.svg" class="custom-spinner-template" alt="Kala Loader">`;
    imgSrc: String = "./assets/images/avatar.png";
    gSCM = { productType: "", placeName: "", categoryName: "", placeId: "", categoryId: "", subCategoryId: "" };
    levelSelection: any;
    userResponse = { place: [], type: [], category: [], subcategory: [] };
    getCategoryId: string;
    getObjectFromOrder = { key: "", data: "", selection: {} };
    getObjectFromOrder2: any = [];
    showAvailableTypes: boolean = false;
    showAvailableFeature: boolean = false;
    showMultipleTypes: boolean = false;
    showMultipleFeatures: boolean = false;
    showAvailablePlaces: boolean = false;
    showAvailableCategory: boolean = false;
    showAvailablesubcat: boolean = false;
    noTypesAvailable: boolean = false;
    validationMsg: string;
    Step1Modal = new GetOfferModal();
    gSCMRequestModal = { productType: "", placeId: "", placeName: "", categoryId: "", subCategoryId: "", categoryName: "", attributes: {} };
    Step1SelectedValues = { place: "", type: [], category: "", subcategory: "", placeId: "", categoryId: "", subCategoryId: "" };
    fromAPI: boolean = false;
    lastValueForAPI: string;
    noFilterValue: string;
    Step2SelectedValues = [];
    getSubcategoryId: string;
    attributeKey: string;
    selectedType: string;
    trackFeatureObj: any = [];
    featureSelectedValues: any = [];
    GetOfferStep_2: any = {};
    GetOfferStep_2Summary: any = {};
    existingLocation = [];
    showExistingLocation: boolean = false;
    Step3Modal = new GetOfferModal();
    Step3SelectedValues = { price: { minPrice: "", maxPrice: "" }, location: [], delivery: "", instruction: "" };
    minPrice;
    maxPrice;
    selectedMinPrice: any;
    selectedMaxPrice: any;
    showMinMaxPrice: boolean = false;
    getOffer_orderInfo: FormGroup;
    label: any;
    tooltip: any;
    tooltipEnabled: any;
    getCSC = [];
    Step4Summary: any;
    Step1Data;
    Step2Data;
    Step3Data;
    showGetOfferSummary: boolean = false;
    step2DataArr = [];
    Step4Modal = new OfferInfo4(); // Contains Step 4 Request Modal
    fetchGeoCode: string;
    fetchValidGeoCode : string;
    showMyOffer: boolean = false;
    NoPreferencechkunchk = [];
    loginEmailId: any;
    fpModal = new ForgotPasswordModal();
    isActive: boolean = false;
    emailRegex = regexPatterns.emailRegex;
    passwordRegex = regexPatterns.password;
    IsSubcatAPI: boolean = false;
    loginFromGetOffers: boolean = false;
    getoffersingleFeatureTracker: boolean = false;
    consumerSupport: any;
    refreshCardPopup : boolean = false;
    generatesumm :boolean = false;
    nodelCount=0;
    itemscntt=0;
    showUnAvailableItems = [];
    appendAdddefaultShipping : boolean = false;
    defaultPayment:boolean= false;
    supportData = {
        "options": [
            {
                "name": "General Question",
                "options": ["Product", "Order", "Account", "Shipping", "Using Kala", "Other"]
            }, {
                "name": "Order Issue",
                "options": ["Product Not Received", "Product Damaged", "Payment Issue", "Wrong Product Received", "Didn't Receive Order Confirmation", "Didn't Receive Shipping Confirmation", "Other"]
            }, {
                "name": "Return",
                "options": ["Product Defect", "Wrong Size", "Wrong Color", "Wrong Style", "Don't Like the Product", "Personal Reasons", "Other"]
            }, {
                "name": "Exchange",
                "options": ["Product Defect", "Wrong Size", "Wrong Color", "Wrong Style", "Don't Like the Product", "Personal Reasons", "Other"]
            }, {
                "name": "Other",
                "options": ["Other"]
            }
        ]
    };
    selection = { parent: '', child: '' }
    showBack: boolean = false;
    questionCounter: number = 0;
    OtherOption: boolean = false;
    showSupportOptions: boolean = true;
    supportOptions = { level: 0, name: '', data: [] };
    commentBox: string;
    dobskipper: boolean = false;
    noPreferenceType: any;
    otherOptionFeatureObj: any;
    otherOptionHasBeenSelected: any;
    otherOptionValue: any;
    user_base64_img: any = '';
    iterableDiffer: any;
    RemoveNoPreferenceFeature: boolean;
    RemoveNoPreferenceType: boolean;
    productMatchesMsg: string;
    browseProductProcess: boolean = false;
    browseESProcess: boolean = false;
    addPaymentCard: FormGroup;
    loader_addCard: boolean = false;
    sendLatestAddedCard: boolean = false;
    getProductIfSearchWithSuggestion: Array<any>;
    orderCheckout:OrderCheckout;
    produDimention:ProduDimention;
    checkallitemDelMethsAreselected :boolean = false;
    showPartNumberSection:boolean=false;
    hidePartNumberData : boolean = false;
    partNumberArray = [];
    partNumValue:any;
    partNumberInvalid : boolean = false;
    errorMsg:any;
    userData: any;
    user: User = new User('', '', '');
    validationHeader:any='';
    invalidValidation:any='';
    billngAddressForm:FormGroup;
    addBillingAddressFormWrapper : boolean = false;
    billingAddressFromAddressPage:any;
    sameAsShipAddress:boolean = false;
    billingAddressSaveModel = new MyAccountAddressModel();
    elements: any;
    hideForGuest: boolean = false;
    @ViewChild('validationModel') validationModel: ElementRef;
    @ViewChild('invalidBillingAddressModel') invalidBillingAddressModel: ElementRef;
    @ViewChild('checkoutModal') checkoutModal: ElementRef;
    //questionPopUp: QuestionPopUp = new QuestionPopUp('what’s trending?');
    constructor(private router: Router, private routerOutlet: RouterOutlet,
        private joinKalaService: JoinKalaService, private checkout: CheckoutService,
        private auth: AuthService, private localStorageService: LocalStorageService,
        public core: CoreService, private changedetRef: ChangeDetectorRef,
        private profileInfoServ: ProfileInfoService, private calendar: NgbCalendar,
        private cd: ChangeDetectorRef,
        private modalService: NgbModal,
        private formBuilder: FormBuilder,
        private route: Router, private ng4LoadingSpinnerService: Ng4LoadingSpinnerService, private homeService: HomeService, private getoffers: GetOfferService,
        private fpService: ForgotPasswordService,
        private interest: ConsumerInterestService,
        private activeRoute: ActivatedRoute,
        private myOrder: MyOrdersService,
        private mycart: MyCartService,
        private myAccount : MyAccountService,
        private _iterableDiffers: IterableDiffers,
        private zone: NgZone
    ) {
        this.iterableDiffer = this._iterableDiffers.find([]).create(null);
        this.minDate = { year: 1940, month: 1, day: 1 };
        this.maxDate = { year: this.today.getFullYear(), month: this.today.getMonth(), day: this.today.getDate() };
        this.fromDate = calendar.getToday();
        this.toDate = calendar.getNext(calendar.getToday(), 'd', 10);
        this.getUserInfo = window.localStorage['userInfo'] != undefined ? JSON.parse(window.localStorage['userInfo']) : {};
        //this.GetOfferStep_2.attributes = {};

        this.label = {
            visible: true,
            format: (value) => {
                return this.format(value);
            },
            position: "top"
        };
        this.tooltip = {
            enabled: true,
            format: (value) => {
                return this.format(value);
            },
            showMode: "always",
            position: "bottom"
        };
        this.tooltipEnabled = {
            enabled: true
        };
    }
    format(value) {
        return value + "%";
    }
     ngOnInit() {
        this.ng4LoadingSpinnerService.show();
        this.core.footerSwap();
        this.core.LoungeShowHide();
        this.usr = new UserProfile();
        this.core.resetAllInputFlag();

        if(window.localStorage['userInfo'] == undefined){
            if (window.localStorage['existingItemsInGuestCart'] != undefined) this.itemsInCart = JSON.parse(window.localStorage['existingItemsInGuestCart']);
            if (window.localStorage['TotalAmount'] != undefined) this.totalAmountFromCart = parseFloat(window.localStorage['TotalAmount']);
            if (window.localStorage['userInfo'] != undefined) {
            this.userData = JSON.parse(window.localStorage['userInfo']);
            this.userId = this.userData.userId;
            }
            // if(window.localStorage['Guest-ShippingInfo'] != undefined && window.localStorage['Guest-UserInfo'] != undefined)
            // {
            //   this.user = JSON.parse(window.localStorage['Guest-UserInfo']);
            //   this.selectGuestShippingAddress({},JSON.parse(window.localStorage['Guest-ShippingInfo']));
            // }
        }

       

    this.billngAddressForm = this.formBuilder.group({
        fullname:['',Validators.required],
        addAddressLineOne: ['', Validators.required],
        addAddressLineTwo: [''],
        addCity: ['', Validators.required],
        addState: ['', Validators.required],
        addZipcode: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(5), Validators.pattern(regexPatterns.zipcodeRegex)]],
      });

       
        if (window.localStorage['userInfo'] != undefined) {
            this.usr = JSON.parse(window.localStorage['userInfo']);
            this.userId = this.usr.userId;
            this.getCards();
            
            if (window.localStorage['userInfo'] != undefined && window.localStorage['token'] != undefined) this.userData = JSON.parse(window.localStorage['userInfo'])
            if (window.localStorage['existingItemsInCart'] != undefined) this.itemsInCart = JSON.parse(window.localStorage['existingItemsInCart']);
            if (window.localStorage['TotalAmount'] != undefined) this.totalAmountFromCart = parseFloat(window.localStorage['TotalAmount']);
            if (window.localStorage['suggestUserInfo'] != undefined) {
                this.suggestUserInfo = JSON.parse(window.localStorage['suggestUserInfo']);
            }
        }
        if (window.localStorage['productForTracking'] != undefined) {
            this.selectedOrder = JSON.parse(window.localStorage['productForTracking']).order;
            this.trackingOrder = JSON.parse(window.localStorage['productForTracking']).goShippoRes;

        }
        //this.loadShippingAddress();
        this.itemsInCart != undefined ? this.getRetailerIds() : {};
        this.filteritemsInCart();
        this.filterShipiProfileId();

        this.conversations = new Array<Conversation>();
        this.questionPopUps = new Array<QuestionPopUp>();
        var token = localStorage.getItem('token');
        this.showAddressBool = false;
        if (token == null && this.core.IsElasticSearch != true && this.core.IsGetoffers != true && this.core.IsBrowseProduct != true && this.core.getbackToMakeAnOffer != true && this.core.getbackToGetOffer != true && this.core.getbackToBuyProduct != true && this.core.isGuestCheckout != true)  /* When user not logged in */ {
            this.questionPopUps.push(new QuestionPopUp('log in'));
            this.questionPopUps.push(new QuestionPopUp('sign up'));
            this.conversation = new Conversation(MsgDirection.In, 'Login or create an account?');
            this.conversations.push(this.conversation);
            this.noAuthentication = false;
            this.ng4LoadingSpinnerService.hide();
        }
        else {
            this.noAuthentication = true;
            if (window.localStorage['userInfo'] && this.core.IsContactKala != true && this.core.IsCheckout != true && this.core.IsTrackOrder != true && this.core.IsElasticSearch != true && this.core.signOutToCUI != true && this.core.IsGetoffers != true && this.core.IsBrowseProduct != true) {
                this.usr = new UserProfile(JSON.parse(window.localStorage['userInfo']));
                this.conversation = new Conversation(MsgDirection.In, 'Hi ' + this.usr.firstName);
                this.conversations.push(this.conversation);
                this.conversations.push(new Conversation(MsgDirection.In, 'What do you want today?'));
                this.core.footerSwapCUI(true, false);
                this.ng4LoadingSpinnerService.hide();
            }
            else if (this.core.IsElasticSearch)/* Navigation from home to search for products */ {
                this.browseESCUI();
            }
            
            else if (this.core.IsTrackOrder) /* Navigation from track order */ {
                this.questionPopUps = [];
                this.selectedOrder = JSON.parse(window.localStorage['productForTracking']).order;
                this.trackingOrder = JSON.parse(window.localStorage['productForTracking']).goShippoRes;
                this.questionPopUps.push(new QuestionPopUp("contact kala"));
                this.questionPopUps.push(new QuestionPopUp("ok"));
                this.questionPopUps.push(new QuestionPopUp("leave review"));
                this.questionPopUps.push(new QuestionPopUp("view details"));
                this.changedetRef.detectChanges();
                this.conversations.push(new Conversation(MsgDirection.In, 'Message me with any questions!'));
                this.ng4LoadingSpinnerService.hide();
            }
            else if(this.core.signInFromLonge)
            {
                this.questionPopUps = [];
                this.conversations.push(new Conversation(MsgDirection.Out, "Sign in"));
                this.questionPopUps.push(new QuestionPopUp('log in'));
                this.questionPopUps.push(new QuestionPopUp('sign up'));
                this.ng4LoadingSpinnerService.hide();
                this.core.signInToCUI = false;
                this.core.signInFromLonge = false;
            }
            else if (this.core.signOutToCUI) {
                this.questionPopUps = [];
                this.conversations.push(new Conversation(MsgDirection.Out, "Sign out"));
                this.questionPopUps.push(new QuestionPopUp('log in'));
                this.questionPopUps.push(new QuestionPopUp('sign up'));
                this.ng4LoadingSpinnerService.hide();
                this.core.signOutToCUI = false;
            }
            else if (this.core.signInToCUI) {
                // this.questionPopUps = [];
                // this.conversations.push(new Conversation(MsgDirection.Out, "Sign in"));
                // this.questionPopUps.push(new QuestionPopUp('log in'));
                // this.questionPopUps.push(new QuestionPopUp('sign up'));
                // this.ng4LoadingSpinnerService.hide();
                // this.core.signInToCUI = false;


                let btnFlag = "log in";
                btnFlag != "" ? this.conversations.push(new Conversation(MsgDirection.Out, btnFlag)) : "";
                this.conversations.push(new Conversation(MsgDirection.In, 'Can I have your email address?'));
                this.core.onlyEmailId = true;
                this.core.footerSwapCUI(false, true);
                this.questionPopUps = [];
                localStorage.removeItem("token");
                this.scrollTo();
                this.core.deactivateRouteFlagVal = false;
                if (window.localStorage['suggestUserInfo'] != undefined) {
                    this.suggestUserInfo = JSON.parse(window.localStorage['suggestUserInfo']);
                    this.questionPopUps.push(new QuestionPopUp(this.suggestUserInfo.emailId, 'suggestEmail'));
                }
            }
            else if(this.core.signUpToCUI)
            {
                let btnFlag = "sign up";
                btnFlag != "" ? this.conversations.push(new Conversation(MsgDirection.Out, btnFlag)) : "";
                this.conversations.push(new Conversation(MsgDirection.In, 'Great! Welcome to the Kala community'));
                setTimeout(() => {
                    this.conversations.push(new Conversation(MsgDirection.In, 'Can I have your first name?'));
                    this.questionPopUps = [];
                    this.core.footerSwapCUI(false, true);
                }, 1000);
                this.core.deactivateRouteFlag(true)
            }
            else if (this.core.IsContactKala) {
                let modal = JSON.parse(this.activeRoute.snapshot.params.modal);
                let order = JSON.parse(this.activeRoute.snapshot.params.order);
                let orderDetails = {
                    productImage: order.productImage,
                    productName: order.productName,
                    productPrice: order.productPrice,
                    retailerName: order.retailerName,
                    quantity: order.productQuantity
                }
                this.conversation = new Conversation(MsgDirection.In, orderDetails, 'contactKalaOrder');
                this.conversations.push(this.conversation);
                this.contactKala();
            }
            else if (this.core.IsBrowseProduct) {
                this.browseProductProcess = true;
                let level = JSON.parse(window.localStorage['levelSelections']);
                let data = `${level.place.name} - ${level.category.name}`;
                this.conversation = new Conversation(MsgDirection.Out, data);
                this.conversations.push(this.conversation);
                this.browseProductCUI(level);
            }
            else if(this.core.isGuestCheckout) {
                    this.conversations.push(new Conversation(MsgDirection.In, 'Can I have your email address?'));
                    this.core.footerSwapCUI(false, true);
                    this.core.onlyEmailId = true;
                    this.questionPopUps = [];
                    localStorage.removeItem("token");
                    this.scrollTo();
                    this.core.deactivateRouteFlagVal = false;
                    // if (window.localStorage['suggestUserInfo'] != undefined) {  
                    //     this.suggestUserInfo = JSON.parse(window.localStorage['suggestUserInfo']);
                    //     this.questionPopUps.push(new QuestionPopUp(this.suggestUserInfo.emailId, 'suggestEmail'));
                    // }
                    // this.loadShippingAddress();
                    // this.hideForGuest = true;
                    // this.showAddressBool = true;
                    this.ng4LoadingSpinnerService.hide();
            }
            else if (this.core.IsGetoffers) {
                this.getOffersReq("get offers");
                this.ng4LoadingSpinnerService.hide();
            }
            else  /* Navigation from checkout */ {
                this.conversation = new Conversation(MsgDirection.In, 'Please select your address or type in a new one.');
                this.conversations.push(this.conversation);
                this.loadShippingAddress();
                this.showAddressBool = true;
                this.ng4LoadingSpinnerService.hide();
            }
        }
        this.core.deactivateRouteFlag(false)
        this.readStripe = true;
    }

    

    ngDoCheck() {
        let changes = this.iterableDiffer.diff(this.conversations);
        if (changes) {
            if (this.core.IsBrowseProduct || this.core.IsElasticSearch) { }
            else this.core.scrollIntoConvoView();
        }
    }

    showInput() {
        // let eventTarget = document.querySelector('.getofferSlider');
        let y = window.scrollY;
        window.scrollTo(0,y);
    }

    browseProductCUI(level) {
        let productMatchedModal = new BrowseProductsModal();
        let productMatched = [];
        this.homeService.getProductList(level.place.name, level.category.name, 0, 30, level.subcategory.name).subscribe(res => {
            for (var i = 0; i < res.content.length; i++) {
                let content = res.content[i];
                productMatchedModal = new BrowseProductsModal(content);
                if (productMatchedModal.product.productStatus != false) productMatched.push(productMatchedModal);
            }
            for (var i = 0; i < productMatched.length; i++) {
                if (productMatched[i].product.productImages) {
                    for (var j = 0; j < productMatched[i].product.productImages.length; j++) {
                        let product = productMatched[i].product.productImages[j];
                        if (product.location.indexOf('data:') === -1 && product.location.indexOf('https:') === -1 && product.location.indexOf('http:') === -1 ) {
                            productMatched[i].product.productImages[j].location = environment.s3 + product.location;
                        }
                        if (product.location.indexOf('maxHeight') > -1) {
                            productMatched[i].product.productImages[j].location = product.location.split(";")[0];
                        }
                    }
                }
            }
            for (var i = 0; i < productMatched.length; i++) {
                if (productMatched[i].product.productImages) {
                    for (var j = 0; j < productMatched[i].product.productImages.length; j++) {
                        let product = productMatched[i].product.productImages[j]
                        if (product.mainImage == true) productMatched[i].product.mainImageSrc = product.location;
                    }
                }
            }
            if (productMatched.length > 0) {
                if (productMatched.length == 1) this.productMatchesMsg = 'Nice! We matched' + ' ' + productMatched.length + ' product for you.';
                else this.productMatchesMsg = 'Nice! We matched' + ' ' + productMatched.length + ' products for you.';
            }
            else this.productMatchesMsg = 'Sorry, but we don\'t have product matches for you.';
            this.conversations.push(new Conversation(MsgDirection.In, productMatched, 'bpCUI'));
            this.questionPopUps = [];
            this.questionPopUps.push(new QuestionPopUp('get offers'));
            this.questionPopUps.push(new QuestionPopUp('show more'));
            this.ng4LoadingSpinnerService.hide();
            setTimeout(() => {
                this.core.IsBrowseProduct = false;
            }, 1000);
        });
    }

    async browseESCUI() {
        let regexCheck = /[ !@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/;
        this.ng4LoadingSpinnerService.hide();
        this.browseESProcess = true;
        let level = JSON.parse(window.localStorage['esKeyword']);
        if (regexCheck.test(level.text)) level.text = level.text.replace(/%20/g, " ").replace(/%26/g, " & ")
        if (regexCheck.test(level.parentName)) level.parentName = level.parentName.replace(/%20/g, " ").replace(/%26/g, " & ")
        let data = `${level.text} ${level.parentName ? ' - ' + level.parentName : ''}`;
        this.conversation = new Conversation(MsgDirection.Out, data);
        this.conversations.push(this.conversation);
        this.ng4LoadingSpinnerService.show();
        let productMatched = [];
        let text = JSON.parse(window.localStorage['esKeyword']).text;
        let parentName = JSON.parse(window.localStorage['esKeyword']).parentName;
        let parentId = JSON.parse(window.localStorage['esKeyword']).parentId;
        let levelId = JSON.parse(window.localStorage['esKeyword']).levelId;
        var response = await this.core.searchProduct(text, parentName,parentId,levelId, 30, 0);
        if (response.products.length > 0) {
            this.ng4LoadingSpinnerService.hide();
            if (response.content) response = response.content.map((item) => new BrowseProductsModal(item));
            if (response.products) response = response.products.map((item) => new BrowseProductsModal(item));
            productMatched = [...response];
            if (!this.core.isSearchWithoutSuggestion) this.getProductIfSearchWithSuggestion = productMatched;
            else this.getProductIfSearchWithSuggestion = [];
            for (var i = 0; i < productMatched.length; i++) {
                if (productMatched[i].product.productImages) {
                    for (var j = 0; j < productMatched[i].product.productImages.length; j++) {
                        let product = productMatched[i].product.productImages[j];
                        if (product.location.indexOf('data:') === -1 && product.location.indexOf('https:') === -1 && product.location.indexOf('http:') === -1) {
                            productMatched[i].product.productImages[j].location = environment.s3 + product.location;
                        }
                        if (product.location.indexOf('maxHeight') > -1) {
                            productMatched[i].product.productImages[j].location = product.location.split(";")[0];
                        }
                    }
                }
            }
            for (var i = 0; i < productMatched.length; i++) {
                if (productMatched[i].product.productImages) {
                    for (var j = 0; j < productMatched[i].product.productImages.length; j++) {
                        let product = productMatched[i].product.productImages[j]
                        if (product.mainImage == true) productMatched[i].product.mainImageSrc = product.location;
                    }
                }
            }
            if (productMatched.length > 0) {
                if (productMatched.length == 1) this.productMatchesMsg = 'Nice! We matched' + ' ' + productMatched.length + ' product for you.';
                else this.productMatchesMsg = 'Nice! We matched' + ' ' + productMatched.length + ' products for you.';
            }
            else this.productMatchesMsg = 'Sorry, but we don\'t have product matches for you.';
            this.conversations.push(new Conversation(MsgDirection.In, productMatched, 'esCUI'));
            this.questionPopUps = [];
            this.questionPopUps.push(new QuestionPopUp('get offers'));
            this.questionPopUps.push(new QuestionPopUp('show more'));
            this.ng4LoadingSpinnerService.hide();
            setTimeout(() => this.core.IsElasticSearch = false, 1000);
        }
    }

    viewDetails(tile) {
        let subCategory = [], updateStorage = new Object();
        if (window.localStorage['levelSelections'] == undefined) {
            let place = [], category = [], subcategory = [];
            place = new Array<SearchDataModal>();
            category = new Array<SearchDataModal>();
            place.push(new SearchDataModal(tile.product.productHierarchyWithIds[0].levelId, tile.product.productHierarchyWithIds[0].levelName, tile.product.productHierarchyWithIds[0].levelName, tile.product.productHierarchyWithIds[0].levelCount));
            category.push(new SearchDataModal(tile.product.productHierarchyWithIds[1].levelId, tile.product.productHierarchyWithIds[1].levelName, tile.product.productHierarchyWithIds[1].levelName, tile.product.productHierarchyWithIds[1].levelCount));
            subcategory.push(new SearchDataModal(tile.product.productHierarchyWithIds[2].levelId, tile.product.productHierarchyWithIds[2].levelName, tile.product.productHierarchyWithIds[2].levelName, tile.product.productHierarchyWithIds[2].levelCount));
            updateStorage['place'] = place[0];
            updateStorage['category'] = category[0];
            updateStorage['subcategory'] = subcategory[0];
            updateStorage['subType'] = {};
            updateStorage['type'] = [];
        }
        else {
            updateStorage = JSON.parse(window.localStorage['levelSelections']);
            updateStorage['subType'].id = tile.product.kalaUniqueId;
            updateStorage['subType'].name = tile.product.productName;
            updateStorage['subType'].text = tile.product.productName;
            updateStorage['subType'].level = "5";
            updateStorage['subType'].imgUrl = tile.product.mainImageSrc;
        }
        if (tile.product.phGetOffers) {
            let subcat = tile.product.phGetOffers.find(element => element.levelName == tile.product.productSubCategoryName);
            subCategory.push(new SearchDataModal(subcat.levelId, subcat.levelName, subcat.levelName, "3"));
            subCategory = subCategory.reduce((a, b) => Object.assign(a, b), {});
            updateStorage['subcategory'] = subCategory;
            subCategory = [];
        }
        window.localStorage['levelSelections'] = JSON.stringify(updateStorage);
        window.localStorage['selectedProduct'] = JSON.stringify(tile);
        this.core.offersDetailFlag = false;
        this.route.navigateByUrl("/view-product?productId="+tile.product.kalaUniqueId);
    }

    spliceItems(item, data) {
        if (item > 2) data.splice(item, data.length - 3)
    }

    contactKala() {
        let modal, order;
        if (this.activeRoute.snapshot.params.modal != undefined) modal = JSON.parse(this.activeRoute.snapshot.params.modal);
        else modal = JSON.parse(window.localStorage['productForTracking']).modal
        if (this.activeRoute.snapshot.params.order != undefined) order = JSON.parse(this.activeRoute.snapshot.params.order);
        else order = JSON.parse(window.localStorage['productForTracking']).order;
        this.usr = new UserProfile(JSON.parse(window.localStorage['userInfo']));
        this.questionPopUps = [];
        this.consumerSupport = new ConsumerSupportModal();
        this.consumerSupport.customerEmail = this.usr.emailId;
        this.consumerSupport.customerId = this.usr.userId;
        this.consumerSupport.customerName = modal.customerName;
        this.consumerSupport.orderId = modal.orderId;
        this.consumerSupport.orderDate = new Date(modal.purchasedDate);
        this.consumerSupport.productName = order.productName;
        this.consumerSupport.productCost = order.totalProductPrice;
        this.showBack = false;
        this.conversations.push(new Conversation(MsgDirection.In, 'Hi ' + this.usr.firstName + ', what can i help you with today ?'));
        for (var i = 0; i < this.supportData.options.length; i++) {
            this.questionPopUps.push(new QuestionPopUp(this.supportData.options[i].name, 'ck'));
            this.supportOptions.data.push(this.supportData.options[i].name);
        }
        this.supportOptions.level = 1;
        this.ng4LoadingSpinnerService.hide();
        this.core.IsContactKala = false;
    }
    loadOptions(option, name) {
        let order;
        this.core.footerSwapCUI(true, false);
        option = this.supportOptions;
        if (this.activeRoute.snapshot.params.order != undefined) order = JSON.parse(this.activeRoute.snapshot.params.order);
        else order = JSON.parse(window.localStorage['productForTracking']).order;
        this.selection.child = name;
        if (name != 'Other') {
            this.showBack = false;
            this.questionCounter++;
            if (this.supportOptions.level < 2) {
                for (var i = 0; i < this.supportData.options.length; i++) {
                    if (this.supportData.options[i].name == name) {
                        this.questionPopUps = [];
                        this.supportOptions.level = this.supportOptions.level + 1;
                        this.supportOptions.name = name;
                        this.selection.parent = this.supportOptions.name;
                        this.supportOptions.data = this.supportData.options[i].options;
                        setTimeout(() => {
                            this.showBack = true;
                            for (var j = 0; j < this.supportOptions.data.length; j++) {
                                this.questionPopUps.push(new QuestionPopUp(this.supportOptions.data[j], 'ck'));
                            }
                        }, 1000)
                    }
                }
            }
            else if (this.supportOptions.level > 2 && name == 'Yes') {
                this.showBack = true;
                this.OtherOption = true;
                this.showSupportOptions = false;
                this.core.footerSwapCUI(false, true);
                this.questionPopUps = [];
            }
            else if (this.supportOptions.level > 2 && name == 'No') {
                setTimeout(() => {
                    this.conversations.push(new Conversation(MsgDirection.In, 'Thanks for the info. We will contact you shortly via email with more details.'));
                    this.saveAndClose(order, "1");
                }, 1000);
                this.questionPopUps = [];
                this.supportOptions.data = [];
                this.consumerSupport.description = "";
                this.showBack = false;
            }
            else {
                this.questionPopUps = [];
                this.supportOptions.level = this.supportOptions.level + 1;
                if (this.questionCounter == 3) this.questionCounter--;
                this.supportOptions.name = name;
                this.supportOptions.data = ["Yes", "No"];
                setTimeout(() => {
                    this.showBack = true;
                    this.questionPopUps.push(new QuestionPopUp('Yes', 'ck'));
                    this.questionPopUps.push(new QuestionPopUp('No', 'ck'));
                }, 1000)
            }

            if (name != 'Yes') this.conversations.push(new Conversation(MsgDirection.Out, name));

            //Auto Generated Data from Kala System
            if (this.questionCounter == 1) {
                this.consumerSupport.inquiryType = name;
                setTimeout(() => {
                    this.conversations.push(new Conversation(MsgDirection.In, 'Can you give me a little more info so i can better help you ?'));
                }, 1000)
            }
            else if (this.questionCounter == 2) {
                this.consumerSupport.inquiryCategory = name;
                setTimeout(() => {
                    this.conversations.push(new Conversation(MsgDirection.In, 'I\'ll look into this for you right away, Is there any other information that you want me to know ?'));
                }, 1000)
            }
            //Auto Generated Data from Kala System
        }
        else {
            this.consumerSupport.inquiryType = name;
            this.consumerSupport.inquiryCategory = "";
            this.OtherOption = true;
            this.showSupportOptions = false;
            this.core.footerSwapCUI(false, true);
        }
    }

    submitComment(order, commentBox) {
        if (this.activeRoute.snapshot.params.order != undefined) order = JSON.parse(this.activeRoute.snapshot.params.order);
        else order = JSON.parse(window.localStorage['productForTracking']).order;
        this.consumerSupport.description = commentBox;
        this.conversations.push(new Conversation(MsgDirection.Out, commentBox))
        this.commentBox = '';
        this.OtherOption = false;
        setTimeout(() => {
            this.conversations.push(new Conversation(MsgDirection.In, 'Thanks for the info. We will contact you shortly via email with more details.'));
            this.saveAndClose(order, "1");
        }, 1000);
        this.questionPopUps = [];
        this.supportOptions.data = [];
        this.showBack = false;
    }

    saveAndClose(order, from) {
        if (from != "0") {
            this.consumerSupport.inquiryDate = new Date();
            this.myOrder.support(this.consumerSupport).subscribe((res) => {
                setTimeout(() => {
                    this.conversations.push(new Conversation(MsgDirection.In, 'Thank you for contacting Kala'));
                    setTimeout(() => { this.route.navigateByUrl('/myorders') }, 2000)
                }, 1000)
                this.resetAll(order);
            }, (err) => {
                console.log('Something went wrong')
            })
        }
        else this.resetAll(order)
    }

    goBack(order) {
        this.questionPopUps = [];
        if (this.activeRoute.snapshot.params.order != undefined) order = JSON.parse(this.activeRoute.snapshot.params.order);
        else order = JSON.parse(window.localStorage['productForTracking']).order;
        if (this.supportOptions.level > 2) {
            this.questionCounter--;
            this.supportOptions.data = []
            for (var i = 0; i < this.supportData.options.length; i++) {
                if (this.supportData.options[i].name == this.selection.parent) {
                    this.supportOptions.level = this.supportOptions.level - 1;
                    this.supportOptions.name = this.selection.parent;
                    this.supportOptions.data = this.supportData.options[i].options;
                }
            }
        }
        else {
            this.questionCounter--;
            this.supportOptions.data = [];
            for (var i = 0; i < this.supportData.options.length; i++) {
                this.supportOptions.level = 1;
                this.supportOptions.data.push(this.supportData.options[i].name);
            }
            this.showBack = false;
        }
        for (var i = 0; i < this.supportOptions.data.length; i++) {
            this.questionPopUps.push(new QuestionPopUp(this.supportOptions.data[i], 'ck'));
        }
    }

    resetAll(order) {
        this.supportOptions = { level: 0, name: '', data: [] };
        this.showBack = false;
        this.questionCounter = 0;
        this.OtherOption = false;
        this.commentBox = '';
        this.showBack = false;
        this.showSupportOptions = true;
        order.showCustomerSupport = false;
    }

    getCards() {
        this.loader_getCards = true;
        this.checkout.getCards(this.userId).subscribe((res) => {
            this.getCardsDetails = [];
            this.loader_getCards = false;
            if (res.length > 0) {
                this.customerId = res[0].customerId;
                for (var i = 0; i < res.length; i++) {
                    this.getCardsDetails.push(new GetCustomerCards(res[i].userId, res[i].customerId, res[i].last4Digits, res[i].cardType, res[i].funding, res[i].cardId, res[i].cardHoldersName, res[i].defaultCard))
                }
                if (this.sendLatestAddedCard) {
                    this.selectPayCard(this.getCardsDetails[this.getCardsDetails.length - 1]);
                    this.sendLatestAddedCard = false;
                }
                if(this.refreshCardPopup)
                {
                    this.questionPopUps =[];
                    this.questionPopUps.push(new QuestionPopUp(this.getCardsDetails, 'cards'));
                }
            }
            this.getCardsDetails.sort(function(a, b) {
                return b.defaultCard - a.defaultCard
              })
        });
    }

    
    

    async selectPayCard(card) {
        this.selectedCardDetails = card;
        this.conversations.push(new Conversation(MsgDirection.Out, `${card.cardType + ' ' + card.last4Digit}`))
        window.localStorage['filteredCartItemsTemp'] = JSON.stringify(this.filteredCartItems);
        let itCount =0;
        await this.checkfornodelallitems();
        // for (var i = 0; i < this.filteredCartItems.length; i++) {
        //     for (var j = 0; j < this.filteredCartItems[i].orderItems.length; j++) {
        //         itCount++;
        //     }
        // }
        if(this.filteredCartItems.length==0 ||  this.nodelCount == this.itemscntt)
        {
            this.questionPopUps = [];
            this.conversations.push(new Conversation(MsgDirection.In, "We’re sorry, but the product(s) you selected are not eligible to be delivered to your selected address. Please update your cart."));
            setTimeout(() => {
                this.route.navigateByUrl('/mycart');
            }, 8000);
                        
        }
        else{
            this.filteredCartItems = JSON.parse(window.localStorage['filteredCartItemsTemp']);
            if(window.localStorage['userInfo'] == undefined) {
                for (var i = 0; i < this.filteredCartItems.length; i++) {
                    if (!this.filteredCartItems[i].isSMSelected) {
                        itCount ++;
                        if (this.filteredCartItems[i].differentShippingMethod) {
                            for (var j = 0; j < this.filteredCartItems[i].orderItems.length; j++) {
                                this.filteredCartItems[i].orderItems[j].isSMSelected = false;
                            }
                        }
                    }
                }
                this.askForSMSelection();
            }
            else{
                this.askForSMSelection();
            }
           

        }
    }

    
    
    async askForSMSelection() {
        this.questionPopUps = [];
        let orderItems = [];
        let isNoFlatTax: boolean = true;
        let itCount =0;
       
        for (var i = 0; i < this.filteredCartItems.length; i++) {
            if (!this.filteredCartItems[i].isSMSelected) {
                itCount ++;
                if (this.filteredCartItems[i].differentShippingMethod) {
                    for (var j = 0; j < this.filteredCartItems[i].orderItems.length; j++) {
                        if (!this.filteredCartItems[i].orderItems[j].isSMSelected) {
                            orderItems.push(this.filteredCartItems[i].orderItems[j]);
                            console.log(orderItems)
                            this.conversations.push(new Conversation(MsgDirection.In, orderItems, 'selectShippingMethod'));
                            this.filteredCartItems[i].orderItems[j].isSMSelected = true;

                            /*If Flat Shipping*/
                            if (this.filteredCartItems[i].orderItems[j].noDeliveryMessage != undefined) {
                                this.questionPopUps = [];
                                this.conversations.push(new Conversation(MsgDirection.In, this.filteredCartItems[i].orderItems[j], 'selectShippingMethod'));
                                isNoFlatTax = false;
                                this.conversations.push(new Conversation(MsgDirection.In, "Would you like to remove these items from your cart and proceed with checkout?"));
                                this.questionPopUps = [];
                                this.questionPopUps.push(new QuestionPopUp('Yes', 'noDeliveryProceed'));
                                this.questionPopUps.push(new QuestionPopUp('No', 'noDeliveryProceed'));
                                break;
                            }
                            /*If Flat Shipping*/

                            /*Else Default*/
                            else {
                                this.questionPopUps.push(new QuestionPopUp(this.filteredCartItems[i].orderItems[j], 'selectShippingMethod'))
                                break;
                            }
                            /*Else Default*/
                        }
                    }
                    if (isNoFlatTax) this.conversations.push(new Conversation(MsgDirection.In, 'How fast?', 'selectShippingMethod'));
                    for (var j = 0; j < this.filteredCartItems[i].orderItems.length; j++) {
                        if (this.filteredCartItems[i].orderItems[j].isSMSelected) this.filteredCartItems[i].isSMSelected = true;
                        else this.filteredCartItems[i].isSMSelected = false;
                    }
                    break;
                }
                else {
                    this.questionPopUps.push(new QuestionPopUp(this.filteredCartItems[i], 'selectShippingMethod'));
                    this.conversations.push(new Conversation(MsgDirection.In, this.filteredCartItems[i].orderItems, 'selectShippingMethod'))
                    if(!this.filteredCartItems[i].noDeliveryMethod)
                    { 
                        this.conversations.push(new Conversation(MsgDirection.In, 'How fast?', 'selectShippingMethod'));
                    }
                    else
                    {
                         this.questionPopUps = [];
                         this.conversations.push(new Conversation(MsgDirection.In, this.filteredCartItems[i], 'selectShippingMethod'));
                         isNoFlatTax = false;
                         this.conversations.push(new Conversation(MsgDirection.In, "Would you like to remove these items from your cart and proceed with checkout?"));
                         this.questionPopUps.push(new QuestionPopUp('Yes', 'noDeliveryProceed'));
                         this.questionPopUps.push(new QuestionPopUp('No', 'noDeliveryProceed'));
                    }
                    this.filteredCartItems[i].isSMSelected = true;
                    break;
                }
            }
        
    }
        if(itCount == 0)
        {
            this.generatesumm = true;
        }
    }

    selectShippingMethod(item, deliveryFee, deliveryMethod) {
        let sameSellerCount = 0;
        let getShippingCost = [];
        let generateSummary: boolean = false;
        //check all items ship method is selcted but to show summary we need to call this method manually, So using this variable checkallitemDelMethsAreselected.
        this.checkallitemDelMethsAreselected?{}:this.conversations.push(new Conversation(MsgDirection.Out, `${'$' + parseFloat(deliveryFee).toFixed(2) + ' - ' +this.getShiName(deliveryMethod)}`));
        if (item.orderItems != undefined) {
            for (var i = 0; i < item.orderItems.length; i++) {
                for (var j = 0; j < this.itemsInCart.length; j++) {
                    if (item.orderItems[i].productId == this.itemsInCart[j].productId) {
                        this.itemsInCart[j].deliveryMethod = deliveryMethod;
                        this.itemsInCart[j].shippingCost = deliveryFee;
                        this.itemsInCart[j].sameSeller = true;
                        sameSellerCount++;
                    }
                }
            }
        }
        else {
            for (var i = 0; i < this.itemsInCart.length; i++) {
                if (item.productId == this.itemsInCart[i].productId) {
                    this.itemsInCart[i].deliveryMethod = deliveryMethod;
                    this.itemsInCart[i].shippingCost = deliveryFee;;
                }
            }
        }
        for (var i = 0; i < this.itemsInCart.length; i++) {
            if (this.itemsInCart[i].sameSeller) {
                this.itemsInCart[i].shippingCost = eval(`${this.itemsInCart[i].shippingCost / sameSellerCount}`);
                delete this.itemsInCart[i].sameSeller;
            }
        }
        for (var i = 0; i < this.itemsInCart.length; i++) {
            let item = this.itemsInCart[i]
            if (item.shippingCost == undefined) {
                getShippingCost.push(0);
                generateSummary = false;
            }
            else {
                getShippingCost.push(item.shippingCost);
                generateSummary = true;
            }
        }
        this.finalShippingAmount = eval(getShippingCost.join("+"));
        this.askForSMSelection();

        if(this.generatesumm)
        {
            generateSummary = true;
        }
        /*Generate Order Summary*/
        if (generateSummary) {
            this.questionPopUps = [];
            this.questionPopUps.push(new QuestionPopUp("edit"));
            this.questionPopUps.push(new QuestionPopUp("confirm"));
            // for(var k=0;k<this.itemsInCart.length;k++)
            // {
            //     if(this.itemsInCart[k].deliveryMethod==undefined)
            //     {
            //         this.itemsInCart.splice(this.itemsInCart[k], 1);

            //     }
            // } 
            this.itemsInCart = this.itemsInCart.filter(item => item.deliveryMethod != undefined);        
            if (this.itemsInCart.length > 1) this.itemsInCart.map((item) => item.isExpanded = false);
            this.conversations.push(new Conversation(MsgDirection.In, this.itemsInCart, 'Order Summary'));
        }
    }

    showOrderDetails(item) {
        return item.isExpanded = !item.isExpanded;
    }

    getPerItemTotal(price, quantity) {
        return eval(`${price * quantity}`);
    }

    getTotalProductCost(ship, tax, productPrice) {
        return eval(`${ship + tax + productPrice}`);
    }

    getOrderTotal() {
        let price = [];
        for (let i = 0; i < this.itemsInCart.length; i++) {
            price.push(eval(`${this.itemsInCart[i].shippingCost + this.itemsInCart[i].productTaxCost + this.itemsInCart[i].price * this.itemsInCart[i].quantity}`));
        }
        return eval(price.join('+'));
    }

    async chargeAmount() {
        let productAvailable: boolean = true;
        this.loader_chargeAmount = true;
        this.ProductCheckoutModal.orderItems = [];
        this.ProductCheckoutModal.customerId = this.selectedCardDetails.customerId;
        this.ProductCheckoutModal.userId = this.getUserInfo.userId;
        this.ProductCheckoutModal.consumerEmail = this.getUserInfo.emailId;
        this.ProductCheckoutModal.customerName = this.getUserInfo.firstName + ' ' + this.getUserInfo.lastName;
        this.ProductCheckoutModal.address = new Address();
        this.ProductCheckoutModal.address = this.selectedAddressDetails;
        this.ProductCheckoutModal.purchasedDate = new Date();
        this.ProductCheckoutModal.source = 'card';
        this.ProductCheckoutModal.paymentFunding = this.selectedCardDetails.funding;
        this.ProductCheckoutModal.paymentSource = this.selectedCardDetails.cardType;
        this.ProductCheckoutModal.last4Digits = this.selectedCardDetails.last4Digit;
        this.ProductCheckoutModal.cardId = this.selectedCardDetails.cardId;
        this.ProductCheckoutModal.totalShipCost = this.finalShippingAmount;
        this.ProductCheckoutModal.totalTaxCost = this.totalProductTax;
        this.ProductCheckoutModal.purchasedPrice = eval(`${this.totalProductTax + this.totalAmountFromCart + this.finalShippingAmount}`);
        this.ProductCheckoutModal.firstName = this.getUserInfo.firstName;
        this.ProductCheckoutModal.lastName = this.getUserInfo.lastName;
        this.avalaraId!=undefined?this.ProductCheckoutModal.avalaraTaxId = this.avalaraId:this.ProductCheckoutModal.avalaraTaxId = null;
        for (var i = 0; i < this.itemsInCart.length; i++) {
            let item = this.itemsInCart[i];
            let ordItems = new OrderItems();
            ordItems.productId = item.productId;
            ordItems.productName = item.productName;
            ordItems.retailerName = item.retailerName;
            ordItems.retailerId = item.retailerId;
            ordItems.productDescription = item.productDescription;
            ordItems.productImage = item.productImage;
            ordItems.productQuantity = item.quantity; 
            ordItems.productPrice = item.price; 
            ordItems.productTaxCost = item.productTaxCost; 
            ordItems.shippingCost = item.shippingCost; 
            ordItems.totalProductPrice = eval(`${item.price * item.quantity}`); 
            ordItems.deliveryMethod = item.deliveryMethod; 
            ordItems.productUPCCode = item.productUPCCode; 
            ordItems.productSKUCode = item.productSKUCode; 
            ordItems.orderFrom = item.orderFrom; 
            ordItems.productHierarchy = item.productHierarchy; 
            ordItems.productAttributes = item.productAttributes;
            ordItems.channelAdviosorProductSku = item.channelAdviosorProductSku;
            ordItems.channelAdviosorRetailerSku = item.channelAdviosorRetailerSku;
            ordItems.leadTimeToShip = parseInt(item.leadTimeToShip);
            //new OrderItems(item.productId, item.productName, item.retailerName, item.retailerId, item.productDescription, item.productImage, item.quantity, item.price, item.productTaxCost, item.shippingCost, eval(`${item.price * item.quantity}`), item.deliveryMethod, item.productUPCCode, item.productSKUCode, item.orderFrom, item.productHierarchy, item.productAttributes)
            this.ProductCheckoutModal.orderItems.push(ordItems);
        };
        console.log(this.ProductCheckoutModal);
        for (var i = 0; i < this.itemsInCart.length; i++) {
            let item = this.itemsInCart[i];
            let getProductQuantity = await this.checkout.productAvailability(item.productId);
            if (getProductQuantity.quantity == 0) {
                productAvailable = false;
                this.conversations.push(new Conversation(MsgDirection.In, `${'We\'re sorry, but ' + getProductQuantity.productName + ' is currently out of stock. Please update your cart.'}`));
                return false;
            }
        }
        /*Proceed to checkout if quantity available*/
        if (productAvailable) {
            this.conversations.push(new Conversation(MsgDirection.In, "Please wait while we place your order..."));
            let orderConfirm = await this.checkout.chargeAmount(this.ProductCheckoutModal);
            if (orderConfirm.includes("Glad you found what you want")) {
                this.conversations.push(new Conversation(MsgDirection.In, orderConfirm));
                let deleteAllCartItems = await this.mycart.deleteAllCartItem(this.userId);
                if (deleteAllCartItems == 'Successfully Deleted') {
                    localStorage.removeItem('existingItemsInCart');
                    setTimeout(() => {
                        this.route.navigateByUrl('/myorders');
                    },3000);
                }
            }
            else
            {
                this.conversations.push(new Conversation(MsgDirection.In, orderConfirm) );
                this.questionPopUps.push(new QuestionPopUp('Update Payment Info' , 'checkout'))
            }
        }
    }

    loadShippingAddress() {
        if(window.localStorage['userInfo'] != undefined)
        {
        this.checkout.getShippingAddress(JSON.parse(window.localStorage['userInfo']).userId).subscribe((res) => {
            // this.conversation = new Conversation(MsgDirection.In, 'Please select your address or type in a new one.');
            // this.conversations.push(this.conversation);
            this.shippingAddressCheckout = [];
            if (res.address.length > 0) {
                for (var i = 0; i < res.address.length; i++) {
                    let address = res.address[i];
                    if (address.addressType === 'shippingAddress') {
                        this.shippingAddressCheckout.push(new CheckoutShippingAddress(address.addID, address.addressLine1, address.addressLine2, address.city, address.state, address.zipcode, address.addressType))
                        
                    }
                }
            }
            this.shippingAddressCheckout = res.address.sort(function(a, b) {
                return b.defaultAddress - a.defaultAddress
            })
            //this.questionPopUps.push(new QuestionPopUp("Add new address"))
            this.changedetRef.detectChanges();
        })
    }
    }

    getRetailerIds() {
        this.itemsInCart.sort(function (a, b) {
            var nameA = a.retailerName.toLowerCase(), nameB = b.retailerName.toLowerCase()
            if (nameA < nameB) //sort string ascending
                return -1
            if (nameA > nameB)
                return 1
            return 0 //default return value (no sorting)
        });
        let hashTable = {};
        let deduped = this.itemsInCart.filter(function (el) {
            var key = JSON.stringify(el);
            var match = Boolean(hashTable[key]);
            return (match ? false : hashTable[key] = true);
        });
        this.itemsInCart = deduped;
        for (var i = 0; i < this.itemsInCart.length; i++) {
            this.retiailerShipIds.push({
                retailerName: this.itemsInCart[i].retailerName,
                retailerId: this.itemsInCart[i].retailerId,
                shipProfileId: this.itemsInCart[i].shipProfileId
            });
        }
    }

    

    filteritemsInCart() {
        let filterItems = new OrderListing();
        let pushIt = false;
        for (var i = 0; i < this.retiailerShipIds.length; i++) {
            let retId = this.retiailerShipIds[i].retailerId;
            for (var j = 0; j < this.itemsInCart.length; j++) {
                let item = this.itemsInCart[j];
                if (retId == item.retailerId) {
                    filterItems.differentShippingMethod = true;
                    filterItems.retailerId = item.retailerId;
                    filterItems.retailerName = item.retailerName;
                    filterItems.orderItems.push(new Orders(item.inStock, item.price, item.productDescription, item.productId, item.productImage, item.productName, item.quantity, item.shipProfileId, 0, item.taxCode, item.retailerIntegrationMethod))
                    filterItems.isSMSelected = false;
                    pushIt = true;
                }
                else {
                    if (pushIt == true) {
                        this.filteredCartItems.push(filterItems);
                        pushIt = false;
                    }
                    filterItems = new OrderListing();
                }
            }
        }
        if (pushIt == true) {
            this.filteredCartItems.push(filterItems);
            pushIt = false;
        }
        //Remove Duplicates from Main Array
        let hashTable = {};
        let deduped = this.filteredCartItems.filter(function (el) {
            var key = JSON.stringify(el);
            var match = Boolean(hashTable[key]);
            return (match ? false : hashTable[key] = true);
        });

        //Remove Duplicates from Child Array
        for (var i = 0; i < deduped.length; i++) {
            deduped[i].orderItems = deduped[i].orderItems.filter((thing, index, self) =>
                index === self.findIndex((t) => (
                    t.productId === thing.productId && t.productName === thing.productName
                ))
            )
        }


        let filtordItems = Array<OrderListing>();
        for (var i = 0; i < deduped.length; i++) {
          var countList = deduped[i].orderItems.reduce(function (objectsByKeyValue, obj) {
            objectsByKeyValue[obj.shipProfileId] = (objectsByKeyValue[obj.shipProfileId] || []).concat(obj);
            return objectsByKeyValue;
          }, {});
         
          // countList.forEach(list => {
          //   filterFinal.orderItems =  countList[list.shipProfileId] ;
          //   //use key and value here
          //   filtordItems.push(filterFinal);
          //   filterFinal.orderItems=[];
          // });
          Object.entries(countList
            ).forEach(list => {
              console.log(list)
              let filterFinal = new OrderListing();
              filterFinal.differentShippingMethod = true;
              filterFinal.retailerId = deduped[i].retailerId;
              filterFinal.retailerName = deduped[i].retailerName;
              filterFinal.orderItems= list[1];
              filtordItems.push(filterFinal);
              //filterFinal.orderItems=[];
              //use key and value here
            });
        }
       
     
     
        //Remove Duplicates from Child Array
        this.filteredCartItems = filtordItems;
    }

    filterShipiProfileId() {
        let filteredItems = this.filteredCartItems;
        for (var i = 0; i < filteredItems.length; i++) {
          var countList = filteredItems[i].orderItems.reduce(function (p, c) {
            p[c.shipProfileId] = (p[c.shipProfileId] || 0) + 1;
            return p;
          }, {});
    
          var result = filteredItems[i].orderItems.filter(function (obj) {
            if (countList[obj.shipProfileId] > 1) return filteredItems[i].differentShippingMethod = false;
            else return filteredItems[i].differentShippingMethod = true;
          });
        }
        this.filteredCartItems = filteredItems;
        }
    async getOffersReq(btnFlag) {
        if (window.localStorage['token'] == undefined) {
            this.conversations.push(new Conversation(MsgDirection.In, 'You must be logged in as a member to receive custom offers. Do you want to log in now or create an account?'));
            this.loginFromGetOffers = true;
            this.questionPopUps = [];
            this.questionPopUps.push(new QuestionPopUp("log in"));
            this.questionPopUps.push(new QuestionPopUp("sign up"));
            this.core.footerSwapCUI(true, false);
        }
        else {
            if (this.browseProductProcess || this.browseESProcess) btnFlag = "";
            btnFlag != "" ? this.conversations.push(new Conversation(MsgDirection.Out, btnFlag)) : "";
            let searchProducts = window.localStorage['searchProducts'] != undefined ? JSON.parse(window.localStorage['searchProducts']) : undefined; // need to uncomment once elastic search is done
            if (searchProducts != undefined) {
                this.gSCM.placeName = searchProducts[0].product.productPlaceName;
                this.gSCM.categoryName = searchProducts[0].product.productCategoryName;
                this.gSCM.productType = searchProducts[0].product.productSubCategoryName;
                this.gSCM.placeId = searchProducts[0].product.productPlaceId;
                this.gSCM.categoryId = searchProducts[0].product.productCategoryId;
                this.gSCM.subCategoryId = searchProducts[0].product.productSubCategoryId;
                this.getCategoryId = searchProducts[0].product.kalaUniqueId;
                this.Step1SelectedValues.place = searchProducts[0].product.productPlaceName;
                this.Step1SelectedValues.category = searchProducts[0].product.productCategoryName;
                this.Step1SelectedValues.subcategory = searchProducts[0].product.productSubCategoryName;
                this.Step1SelectedValues.placeId = searchProducts[0].product.productPlaceId;
                this.Step1SelectedValues.categoryId = searchProducts[0].product.productCategoryId;
                this.Step1SelectedValues.subCategoryId = searchProducts[0].product.productSubCategoryId;
                this.getSubCategory();
                //else this.getofferSubCategory(searchProducts[0].product.productSubCategoryName);
            }
            else {
                if (this.core.isSearchWithoutSuggestion) this.getPlaces();
                else if(window.localStorage['levelSelections'] == undefined) {
                    this.getPlaces();
                }
                else {
                    if (this.getProductIfSearchWithSuggestion && this.getProductIfSearchWithSuggestion.length > 0 && !this.core.isSearchWithoutSuggestion) {
                        let place = [], category = [], levelSelection;
                        if (window.localStorage['levelSelections']) levelSelection = JSON.parse(window.localStorage['levelSelections']);
                        else levelSelection = new Object();
                        place = new Array<SearchDataModal>();
                        category = new Array<SearchDataModal>();
                        place.push(new SearchDataModal(this.getProductIfSearchWithSuggestion[0].product.productHierarchyWithIds[0].levelId, this.getProductIfSearchWithSuggestion[0].product.productHierarchyWithIds[0].levelName, this.getProductIfSearchWithSuggestion[0].product.productHierarchyWithIds[0].levelName, this.getProductIfSearchWithSuggestion[0].product.productHierarchyWithIds[0].levelCount));
                        category.push(new SearchDataModal(this.getProductIfSearchWithSuggestion[0].product.productHierarchyWithIds[1].levelId, this.getProductIfSearchWithSuggestion[0].product.productHierarchyWithIds[1].levelName, this.getProductIfSearchWithSuggestion[0].product.productHierarchyWithIds[1].levelName, this.getProductIfSearchWithSuggestion[0].product.productHierarchyWithIds[1].levelCount));
                        levelSelection.place = place[0];
                        levelSelection.category = category[0];
                        levelSelection.subcategory = {};
                        levelSelection.subType = {};
                        levelSelection.type = [];
                        window.localStorage['levelSelections'] = JSON.stringify(levelSelection);
                    }
                    if (window.localStorage['levelSelections']) this.levelSelection = JSON.parse(window.localStorage['levelSelections']);
                    this.gSCM.placeName = this.levelSelection.place.name;
                    this.gSCM.categoryName = this.levelSelection.category.name;
                    this.gSCM.placeId = this.levelSelection.place.id;
                    this.gSCM.categoryId = this.levelSelection.category.id;
                    this.gSCM.productType = this.levelSelection.subcategory.hasOwnProperty('id') ? this.levelSelection.subcategory.name : {};
                    this.gSCM.subCategoryId = this.levelSelection.subcategory.hasOwnProperty('id') ? this.levelSelection.subcategory.id : {};
                    this.getCategoryId = this.levelSelection.category.id;
                    this.Step1SelectedValues.place = this.levelSelection.place;
                    this.Step1SelectedValues.category = this.levelSelection.category;
                    this.Step1SelectedValues.subcategory = this.levelSelection.subcategory.hasOwnProperty('id') ? this.levelSelection.subcategory : "";
                    this.Step1SelectedValues.placeId = this.levelSelection.place.id;
                    this.Step1SelectedValues.categoryId = this.levelSelection.category.id;
                    this.Step1SelectedValues.subCategoryId = this.levelSelection.subcategory.hasOwnProperty('id') ? this.levelSelection.subcategory.id : "";
                    
                    // this.getSubCategory();
                    
                    if(this.Step1SelectedValues.category == null || this.Step1SelectedValues.category == "") {
                        this.getOffersCategory(this.levelSelection.place);
                    }
                    else if (this.Step1SelectedValues.subcategory == null || this.Step1SelectedValues.subcategory == "") {
                        this.getSubCategory();
                        this.getUpdateTypes();
                        this.questionPopUps = [];
                        this.conversations.push(new Conversation(MsgDirection.In, "select a product sub category"));
                        this.showAvailablesubcat = true;
                    }
                    else {
                        var gTResponse = await this.getoffers.getofferSubCategory(this.gSCM);
                        if (gTResponse.attributes != null && gTResponse.products && gTResponse.products.length > 0) {
                            this.questionPopUps = [];
                            this.showAvailablesubcat = false;
                            this.showAvailableTypes = true;
                            if (!gTResponse.noType) this.conversations.push(new Conversation(MsgDirection.In, gTResponse.attributes_orders.attributes_metadata.Type["Mobile Label"]));
                            this.getObjectFromOrderNoLevel1(gTResponse);
                        }
                        else {
                            this.conversations.push(new Conversation(MsgDirection.In, 'Sorry, but we don’t have any offer matches for you. Please check back soon, as we’re always adding new products.'));
                        }
                    }
                }
            }
        }
    }
    SelectEmail(emailId:any)
    {
        this.addChatInput({userInput:emailId});
    }
    async ShowLogin(btnFlag: any,from?:any) {
        this.invalidInput = false;
       // window.localStorage['CustomShipValue'] = btnFlag;
        //this.noAuthentication = true;
        // if(btnFlag.indexOf('Custom')> -1)
        // {
        //     btnFlag=btnFlag.split(':')[0];
        // }
        this.core.onlyPassword = false;
        switch (btnFlag) {
            case 'log in':
                {
                    btnFlag != "" ? this.conversations.push(new Conversation(MsgDirection.Out, btnFlag)) : "";
                    this.conversations.push(new Conversation(MsgDirection.In, 'Can I have your email address?'));
                    this.core.onlyEmailId = true;
                    this.core.footerSwapCUI(false, true);
                    this.questionPopUps = [];
                    localStorage.removeItem("token");
                    this.scrollTo();
                    this.core.deactivateRouteFlagVal = false;
                    if (window.localStorage['suggestUserInfo'] != undefined) {
                        this.suggestUserInfo = JSON.parse(window.localStorage['suggestUserInfo']);
                        this.questionPopUps.push(new QuestionPopUp(this.suggestUserInfo.emailId, 'suggestEmail'));
                    }
                    break;
                }
            case 'sign up':
                {
                    btnFlag != "" ? this.conversations.push(new Conversation(MsgDirection.Out, btnFlag)) : "";
                    this.conversations.push(new Conversation(MsgDirection.In, 'Great! Welcome to the Kala community'));
                    setTimeout(() => {
                        this.conversations.push(new Conversation(MsgDirection.In, 'Can I have your first name?'));
                        this.questionPopUps = [];
                        this.core.footerSwapCUI(false, true);
                    }, 1000);
                    this.core.deactivateRouteFlag(true)
                    break;
                }
            case 'Get Activation Link':
                {
                    btnFlag != "" ? this.conversations.push(new Conversation(MsgDirection.Out, btnFlag)) : "";
                    this.sendAccountReverificationLink();
                    this.core.footerSwapCUI(true, false);
                    break;
                }

            case 'create account':
                {
                    btnFlag != "" ? this.conversations.push(new Conversation(MsgDirection.Out, btnFlag)) : "";
                    this.questionPopUps = [];
                    this.conversations.push(new Conversation(MsgDirection.In, 'Can I have your first name?'));
                    // this.conversations.push(new Conversation(MsgDirection.In, 'Can I have your mail id?'));
                    this.core.footerSwapCUI(false, true);
                    break;
                }
            case 'Re-enter Password': {
                btnFlag != "" ? this.conversations.push(new Conversation(MsgDirection.Out, btnFlag)) : "";
                this.questionPopUps = [];
                this.core.onlyPassword = true;
                setTimeout(() => {
                    this.core.footerSwapCUI(false, true);
                }, 1000);
                break;
            }
            case 'Forgot my Password':
                {
                    btnFlag != "" ? this.conversations.push(new Conversation(MsgDirection.Out, btnFlag)) : "";
                    this.conversations.push(new Conversation(MsgDirection.In, "No problem. We just sent you an email to reset your password."));
                    setTimeout(() => {
                        this.conversations.push(new Conversation(MsgDirection.In, "Please click on the email link to reset, and then enter your new password below to login."));
                    }, 1000);
                    this.core.onlyPassword = true;
                    this.questionPopUps = [];
                    //this.ForgotPassword();
                    var fPResponse = await this.fpService.getUserByEmailId(this.loginEmailId.toLowerCase());
                    fPResponse = this.filterEmailRes(fPResponse, 'forgotPassword');
                    this.questionPopUps.push(new QuestionPopUp("Resend Email"));
                    this.core.footerSwapCUI(false, true);
                    break;
                }
            case 'Resend Email':
                {
                    btnFlag != "" ? this.conversations.push(new Conversation(MsgDirection.Out, btnFlag)) : "";
                    this.conversations.push(new Conversation(MsgDirection.In, "No problem, we’re resending your password reset email now."));
                    this.core.onlyPassword = true;
                    this.questionPopUps = [];
                    var fPResponse = await this.fpService.getUserByEmailId(this.loginEmailId.toLowerCase());
                    fPResponse = this.filterEmailRes(fPResponse, 'forgotPassword');
                    this.questionPopUps.push(new QuestionPopUp("Resend Email"));
                    this.core.footerSwapCUI(false, true);
                    break;
                }
            case 'Okay':
                {
                    // we dont need this case anymore 
                    break;
                }
            case 'Skip it':
                {
                    btnFlag != "" ? this.conversations.push(new Conversation(MsgDirection.Out, btnFlag)) : "";
                    this.questionPopUps = [];
                    this.router.navigateByUrl('/home');
                    break;
                }
            case 'no thanks':
                {
                    btnFlag != "" ? this.conversations.push(new Conversation(MsgDirection.Out, btnFlag)) : "";
                    this.conversations.push(new Conversation(MsgDirection.In, "Okay, let's get you shopping"));
                    this.questionPopUps = [];
                    this.core.deactivateRouteFlag(false);
                    setTimeout(() => { this.router.navigateByUrl('/home') }, 2000)
                    break;
                }
            case 'Try Different Email':
                {
                    btnFlag != "" ? this.conversations.push(new Conversation(MsgDirection.Out, btnFlag)) : "";
                    this.conversations.push(new Conversation(MsgDirection.In, 'Can I have your email address?'));
                    this.core.onlyEmailId = true;
                    this.core.footerSwapCUI(false, true);
                    this.questionPopUps = [];
                    break;
                }
            case 'sure, go ahead':
                {
                    btnFlag != "" ? this.conversations.push(new Conversation(MsgDirection.Out, btnFlag)) : "";
                    this.questionPopUps = [];
                    this.conversations.push(new Conversation(MsgDirection.In, 'Thanks! This won\'t take too long'));
                    this.conversations.push(new Conversation(MsgDirection.In, 'Do you want to upload a profile picture?'));
                    this.questionPopUps.push(new QuestionPopUp("Skip"));
                    this.questionPopUps.push(new QuestionPopUp("Camera"));
                    this.core.footerSwapCUI(true, false);
                    this.scrollTo();
                    break;
                }
            case 'Skip':
                {
                    btnFlag != "" ? this.conversations.push(new Conversation(MsgDirection.Out, btnFlag)) : "";
                    this.questionPopUps = [];
                    if (this.showInterestPreference) {
                        this.conversations.push(new Conversation(MsgDirection.In, "You're all done! Let's get shopping!"));
                        this.core.deactivateRouteFlag(false);
                        setTimeout(() => { this.router.navigateByUrl('/home') }, 2000);
                        this.scrollTo();
                        this.showInterestPreference = false;
                    }
                    else {
                        this.conversations.push(new Conversation(MsgDirection.In, 'And you are a...'));
                        this.questionPopUps.push(new QuestionPopUp("Male"));
                        this.questionPopUps.push(new QuestionPopUp("Female"));
                        this.core.footerSwapCUI(true, false);
                        this.changedetRef.detectChanges();
                        //let spanPopup = document.getElementsByClassName("questionPopup")[0];
                        //spanPopup.children[0].classList.add("icon-male");
                    }
                    break;
                }
            case 'Done':
                {
                    btnFlag != "" ? this.conversations.push(new Conversation(MsgDirection.Out, btnFlag)) : "";
                    this.questionPopUps = [];
                    this.saveInterest();
                    break;
                }
            case 'Male':
                {
                    btnFlag != "" ? this.conversations.push(new Conversation(MsgDirection.Out, btnFlag)) : "";
                    this.profileInformation.gender = 'Male';
                    this.questionPopUps = [];
                    this.conversations.push(new Conversation(MsgDirection.In, 'What is your birth date?'));
                    this.input_dob = true;

                    this.questionPopUps.push(new QuestionPopUp(""));
                    this.dobskipper = true;

                    var base64 = this.getBase64Image(document.getElementById("pro_pic_usr"));
                    this.setImage(base64);

                    this.scrollTo();
                    //this.questionPopUps.push(new QuestionPopUp("No"));
                    break;
                }
            case 'Female':
                {
                    btnFlag != "" ? this.conversations.push(new Conversation(MsgDirection.Out, btnFlag)) : "";
                    this.profileInformation.gender = 'Female';
                    this.questionPopUps = [];
                    this.input_dob = true;

                    this.questionPopUps.push(new QuestionPopUp(""));
                    this.dobskipper = true;
                    this.core.footerSwapCUI(true, false); this.conversations.push(new Conversation(MsgDirection.In, 'What is your birth date?'));

                    var base64 = this.getBase64Image(document.getElementById("pro_pic_usr"));
                    this.setImage(base64);

                    this.scrollTo();
                    //this.questionPopUps.push(new QuestionPopUp("No"));
                    break;
                }
            case 'Camera':
                {
                    btnFlag != "" ? this.conversations.push(new Conversation(MsgDirection.Out, btnFlag)) : "";
                    this.questionPopUps = [];
                    this.conversations.push(new Conversation(MsgDirection.In, 'Do you want to use a photo from your gallery or take a new one?'));
                    this.questionPopUps.push(new QuestionPopUp("Take Photo"));
                    this.questionPopUps.push(new QuestionPopUp("Select from Gallery"));

                    break;
                }
            case 'Take Photo':
                {
                    btnFlag != "" ? this.conversations.push(new Conversation(MsgDirection.Out, btnFlag)) : "";
                    this.zone.runOutsideAngular(() => {
                        if (navigator != undefined) {
                            navigator.camera.getPicture(
                                (imageUri) => this.zone.run(() => {
                                    this.imgSrc = imageUri;
                                    this.questionPopUps = [];
                                    this.conversations.push(new Conversation(MsgDirection.Out, this.imgSrc, 'cameraImg'));
                                    this.conversations.push(new Conversation(MsgDirection.In, 'Nice photo, by the way.'));
                                    this.conversations.push(new Conversation(MsgDirection.In, 'And you are a...'));
                                    this.questionPopUps.push(new QuestionPopUp("Male"));
                                    this.questionPopUps.push(new QuestionPopUp("Female"));
                                    this.core.footerSwapCUI(true, false);
                                }),
                                (error) => this.zone.run(() => {
                                    console.log("Unable to obtain picture: " + error);
                                }), {
                                    destinationType: navigator.camera.DestinationType.FILE_URI,
                                    sourceType: navigator.camera.DestinationType.CAMERA,
                                    quality: 50,
                                    allowEdit: true,
                                    correctOrientation: true,
                                }
                            );
                        }
                    })
                    break;
                }
            case 'Select from Gallery':
                {
                    btnFlag != "" ? this.conversations.push(new Conversation(MsgDirection.Out, btnFlag)) : "";
                    this.zone.runOutsideAngular(() => {
                        if (navigator != undefined) {
                            navigator.camera.getPicture(
                                (imageUri) => this.zone.run(() => {
                                    this.imgSrc = imageUri;
                                    this.questionPopUps = [];
                                    this.conversations.push(new Conversation(MsgDirection.Out, this.imgSrc, 'cameraImg'));
                                    this.conversations.push(new Conversation(MsgDirection.In, 'Nice photo, by the way.'));
                                    this.conversations.push(new Conversation(MsgDirection.In, 'And you are a...'));
                                    this.questionPopUps.push(new QuestionPopUp("Male"));
                                    this.questionPopUps.push(new QuestionPopUp("Female"));
                                    this.core.footerSwapCUI(true, false);
                                }),
                                (error) => this.zone.run(() => {
                                    console.log("Unable to obtain picture: " + error);
                                }), {
                                    destinationType: navigator.camera.DestinationType.FILE_URI,
                                    sourceType: 0,
                                    quality: 50,
                                    allowEdit: true,
                                    correctOrientation: true
                                }
                            );
                        }
                    })
                    break;
                }
            // case 'Yes':
            //     {
            //         btnFlag != "" ? this.conversations.push(new Conversation(MsgDirection.Out, btnFlag)) : "";
            //         this.questionPopUps = [];
            //         this.questionPopUps.push(new QuestionPopUp("15-24"));
            //         this.questionPopUps.push(new QuestionPopUp("25-34"));
            //         this.questionPopUps.push(new QuestionPopUp("35-44"));
            //         this.questionPopUps.push(new QuestionPopUp("45-54"));
            //         this.questionPopUps.push(new QuestionPopUp("55-64"));
            //         this.questionPopUps.push(new QuestionPopUp("65-74"));
            //         this.questionPopUps.push(new QuestionPopUp("75 above"));
            //         break;
            //     }
            case 'No':
                {
                    btnFlag != "" ? this.conversations.push(new Conversation(MsgDirection.Out, btnFlag)) : "";
                    this.onSubmit(this.profileInformation);
                    break;
                }
            case 'Add new address':
                {
                    // btnFlag != "" ? this.conversations.push(new Conversation(MsgDirection.Out, btnFlag)) : "";
                    this.showaddressQuestPopup = true;
                    this.questionPopUps = [];
                    document.getElementsByClassName("mobile_chat")[0].children[1].classList.remove("height75");
                    document.getElementsByClassName("mobile_chat")[0].children[1].classList.add("d-none");
                    document.getElementsByClassName("quepopupmoreless")[0].classList.add("d-none");
                    document.getElementsByClassName("CUIpopup")[0].classList.add("pop_overlay");
                    this.addAddress();
                    break;
                }
            case 'Add guest address':
                {
                    // btnFlag != "" ? this.conversations.push(new Conversation(MsgDirection.Out, btnFlag)) : "";
                    this.showaddressQuestPopup = true;
                    this.questionPopUps = [];
                    document.getElementsByClassName("mobile_chat")[0].children[1].classList.remove("height75");
                    document.getElementsByClassName("mobile_chat")[0].children[1].classList.add("d-none");
                    document.getElementsByClassName("quepopupmoreless")[0].classList.add("d-none");
                    document.getElementsByClassName("CUIpopup")[0].classList.add("pop_overlay");
                    this.addAddress();
                    break;
                }
                
            case 'get offers':
                {
                    btnFlag != "" ? this.conversations.push(new Conversation(MsgDirection.Out, btnFlag)) : "";
                    this.getOffersReq(btnFlag);
                    break;
                }
            case 'select sub category':
                {
                    btnFlag != "" ? this.conversations.push(new Conversation(MsgDirection.In, btnFlag)) : "";
                    this.showAvailablesubcat = true;
                    // document.getElementsByClassName("CUIpopup")[0].classList.add("pop_overlay");
                    //this.conversations.push(new Conversation(MsgDirection.In, 'select sub category'));
                    this.questionPopUps = [];
                    break;
                }
            case 'delivery':
                {
                    btnFlag != "" ? this.conversations.push(new Conversation(MsgDirection.Out, btnFlag)) : "";
                    this.core.inputNewLocation = true;
                    this.core.footerSwapCUI(false, true);
                    this.conversations.push(new Conversation(MsgDirection.In, 'What’s your zipcode?'));
                    this.getExistingLocations();
                    this.questionPopUps = [];
                    break;
                }
            case 'ya':
                {
                    btnFlag != "" ? this.conversations.push(new Conversation(MsgDirection.Out, btnFlag)) : "";
                    break;
                }
            case 'show more':
                {
                    btnFlag != "" ? this.conversations.push(new Conversation(MsgDirection.Out, btnFlag)) : "";
                    if (this.browseProductProcess) this.route.navigateByUrl('/browse-product');
                    if (this.browseESProcess) this.route.navigateByUrl('/elastic-product');
                    break;

                }
            case 'Next day: 1 business day shipping':
                {
                    btnFlag != "" ? this.conversations.push(new Conversation(MsgDirection.Out, btnFlag)) : "";
                    this.Step3SelectedValues.delivery = btnFlag;
                    this.questionPopUps = [];
                    this.conversations.push(new Conversation(MsgDirection.In, 'Almost done. Any special instructions to the retailer?'));
                    this.questionPopUps.push(new QuestionPopUp("No, thanks"));
                    this.core.footerSwapCUI(false, true);
                    break;
                }
            case '2 day: 2 business day shipping':
                {
                    btnFlag != "" ? this.conversations.push(new Conversation(MsgDirection.Out, btnFlag)) : "";
                    this.Step3SelectedValues.delivery = btnFlag;
                    this.questionPopUps = [];
                    this.conversations.push(new Conversation(MsgDirection.In, 'Almost done. Any special instructions to the retailer?'));
                    this.questionPopUps.push(new QuestionPopUp("No, thanks"));
                    this.core.footerSwapCUI(false, true);
                    break;
                }
            case 'Express: 3 to 5 business days':
                {
                    btnFlag != "" ? this.conversations.push(new Conversation(MsgDirection.Out, btnFlag)) : "";
                    this.Step3SelectedValues.delivery = btnFlag;
                    this.questionPopUps = [];
                    this.conversations.push(new Conversation(MsgDirection.In, 'Almost done. Any special instructions to the retailer?'));
                    this.questionPopUps.push(new QuestionPopUp("No, thanks"));
                    this.core.footerSwapCUI(false, true);
                    break;
                }
            case 'Standard: 5 to 8 business days':
                {
                    btnFlag != "" ? this.conversations.push(new Conversation(MsgDirection.Out, btnFlag)) : "";
                    this.Step3SelectedValues.delivery = btnFlag;
                    this.questionPopUps = [];
                    this.conversations.push(new Conversation(MsgDirection.In, 'Almost done. Any special instructions to the retailer?'));
                    this.questionPopUps.push(new QuestionPopUp("No, thanks"));
                    this.core.footerSwapCUI(false, true);
                    break;
                }
            case btnFlag.indexOf('Custom') > -1 :
            {
                    btnFlag != "" ? this.conversations.push(new Conversation(MsgDirection.Out, btnFlag) ): "";
                    this.Step3SelectedValues.delivery = btnFlag;
                    this.questionPopUps = [];
                    this.conversations.push(new Conversation(MsgDirection.In, 'Almost done. Any special instructions to the retailer?'));
                    this.questionPopUps.push(new QuestionPopUp("No, thanks"));
                    this.core.footerSwapCUI(false, true);
                    break;
            }
            case 'No Preference':
                {
                    btnFlag != "" ? this.conversations.push(new Conversation(MsgDirection.Out, btnFlag)) : "";
                    this.Step3SelectedValues.delivery = btnFlag;
                    this.questionPopUps = [];
                    this.conversations.push(new Conversation(MsgDirection.In, 'Almost done. Any special instructions to the retailer?'));
                    this.questionPopUps.push(new QuestionPopUp("No, thanks"));
                    this.core.footerSwapCUI(false, true);
                    break;
                }
            case 'No, thanks':
                {
                    btnFlag != "" ? this.conversations.push(new Conversation(MsgDirection.Out, btnFlag)) : "";
                    this.questionPopUps = [];
                    this.questionPopUps.push(new QuestionPopUp("I want to start over"));
                    this.questionPopUps.push(new QuestionPopUp("That’s it. Get me offers!"));
                    this.core.footerSwapCUI(true, false);
                    this.Step3SelectedValues.instruction = "";
                    if (this.GetOfferStep_2 != undefined) {
                        this.Step2Data = this.GetOfferStep_2Summary;
                        this.step2DataArr = [];
                        for (var keys in this.Step2Data.attributes) {
                            this.step2DataArr.push({
                                key: keys,
                                values: this.Step2Data.attributes[keys]
                            })
                        }
                    }
                    this.Step3Modal.getoffer_3 = new Array<OfferInfo3>();
                    this.Step3Modal.getoffer_3.push(new OfferInfo3(this.Step3SelectedValues.price, this.Step3SelectedValues.delivery, this.Step3SelectedValues.instruction, this.Step3SelectedValues.location))
                    if (this.GetOfferStep_2 == "") {
                        this.GetOfferStep_2 = "";
                        this.Step4Summary = { ...this.Step1Modal.getoffer_1[0] };
                    }
                    if (this.Step3Modal.getoffer_3.length == 0) {
                        this.Step3Data = "";
                        this.Step4Summary = { ...this.Step1Modal.getoffer_1[0], ...this.GetOfferStep_2Summary, ...this.Step3Modal.getoffer_3 };
                    }
                    else if (this.Step3Modal.getoffer_3 != undefined) {

                        this.Step4Summary = { ...this.Step1Modal.getoffer_1[0], ...this.GetOfferStep_2Summary, ...this.Step3Modal.getoffer_3[0] };
                    }
                    //get the get offer summary
                    this.showGetOfferSummary = true;
                    this.changedetRef.detectChanges();

                    break;
                }
            case 'That’s it. Get me offers!':
                {
                    btnFlag != "" ? this.conversations.push(new Conversation(MsgDirection.Out, btnFlag)) : "";
                    // this.questionPopUps = [];
                    document.getElementsByClassName("CUIpopup")[0].classList.remove("pop_overlay");
                    this.GetOffersFromSummary();
                    break;
                }
            case 'I want to start over':
                {
                    this.browseProductProcess = false;
                    this.browseESProcess = false;
                    this.core.IsGetoffers = true;
                    this.conversations = new Array<Conversation>();
                    this.showMoreLessStr = "Show More";
                    this.Step2SelectedValues = [];
                    this.existingLocation = [];
                    this.getOffersReq("get offers");
                    break;
                }
            case 'what’s trending?':
                {
                    btnFlag != "" ? this.conversations.push(new Conversation(MsgDirection.Out, btnFlag)) : "";
                    break;
                }
            case 'ok':
                {
                    this.core.showMyorderDetail = false;
                    this.core.whereIsItFromCUI = false;
                    this.router.navigateByUrl('/myorders');
                    break;
                }
            case 'contact kala':
                {
                    this.core.showMyorderDetail = false;
                    this.contactKala();
                    break;
                }
            case 'view details':
                {
                    this.core.showMyorderDetail = true;
                    this.core.whereIsItFromCUI = true;
                    this.router.navigateByUrl('/myorders');
                    break;
                }
            case 'leave review':
                {
                    this.core.showMyorderDetail = false;
                    if (window.localStorage['forReview'] == undefined) {
                        let modal = JSON.parse(window.localStorage['productForTracking']).modal;
                        let order = JSON.parse(window.localStorage['productForTracking']).order;
                        window.localStorage['forReview'] = JSON.stringify({ modal: modal, order: order });
                    }
                    this.router.navigateByUrl('/app-leave-review');
                    break;
                }
            case 'edit': {
                this.checkallitemDelMethsAreselected = false;
                btnFlag != "" ? this.conversations.push(new Conversation(MsgDirection.Out, btnFlag)) : "";
                this.filteredCartItems = [];
                this.retiailerShipIds = [];
                this.core.IsCheckout = true;
                if(window.localStorage['userInfo'] == undefined) {
                    this.itemsInCart = JSON.parse(window.localStorage['existingItemsInGuestCart']);
                    this.conversation = new Conversation(MsgDirection.In, 'Please add your shipping address.');
                    localStorage.removeItem('Guest-ShippingInfo');
                    localStorage.removeItem('Guest-BillingInfo');
                    localStorage.removeItem('Guest-CardInfo');
                    this.shippingAddressCheckout = [];
                    
                    
                }
                else {
                    this.itemsInCart = JSON.parse(window.localStorage['existingItemsInCart']);
                    this.conversation = new Conversation(MsgDirection.In, 'Please select your address or type in a new one.');
                }
                this.getRetailerIds();
                this.filteritemsInCart();
                this.filterShipiProfileId();
                this.conversations = new Array<Conversation>();
                this.questionPopUps = new Array<QuestionPopUp>();
                this.questionPopUps = [];
               
                this.conversations.push(this.conversation);
                this.showAddressBool = true;
                document.getElementsByClassName("mobile_chat")[0].children[1].classList.remove("d-none");
                document.getElementsByClassName("mobile_chat")[0].children[1].classList.add("height75");
                document.getElementsByClassName("quepopupmoreless")[0].classList.remove("d-none");
                this.readStripe = false;
                break;
            }
            case 'confirm': {
                this.checkallitemDelMethsAreselected = false;
                btnFlag != "" ? this.conversations.push(new Conversation(MsgDirection.Out, btnFlag)) : "";
                this.questionPopUps = [];
                if(window.localStorage['userInfo'] == undefined) {
                    this.chargeGuestAmount();
                }
                else{
                    this.chargeAmount();
                }
                
                break;
            }
            case 'Update Payment Info':{
                this.questionPopUps = [];
                this.router.navigateByUrl('/myaccount');
                break;
            }
           
            
        }
    }
    async proceedWithNoDeliveryOrNot(question,from)
    {
        switch(question)
        {
            case 'Yes':{
               
                let itCount =0;
                    this.conversations.push(new Conversation(MsgDirection.Out, 'Yes'));
                    let countSMSlected =0;
                    let iteminfilterCount =0;
                    await this.removeNodeliveryItems();
                    for (var i = 0; i < this.filteredCartItems.length; i++) {
                        for (var j = 0; j < this.filteredCartItems[i].orderItems.length; j++) {
                            itCount++;
                        }
                    }
                    if(this.filteredCartItems.length==0|| itCount ==0)
                    {
                        this.questionPopUps = [];
                        this.conversations.push(new Conversation(MsgDirection.In, "We’re sorry, but the product(s) you selected are not eligible to be delivered to your selected address. Please update your cart."));
                        setTimeout(() => {
                            this.route.navigateByUrl('/mycart');
                        }, 8000);
                                    
                    }
                    else
                {

                    this.askForSMSelection();
                    for (var i = 0; i < this.filteredCartItems.length; i++) {
                        for (var j = 0; j < this.filteredCartItems[i].orderItems.length; j++) {
                            if (this.filteredCartItems[i].orderItems[j].isSMSelected) {
                                countSMSlected++;
                            }
                            iteminfilterCount ++;
                        }
                      
                    }
                    if(countSMSlected == iteminfilterCount)
                    {
                        let itemToSend = this.filteredCartItems[this.filteredCartItems.length-1].orderItems[this.filteredCartItems[this.filteredCartItems.length-1].orderItems.length-1];
                        let itemFeeToSend = this.itemsInCart[this.itemsInCart.findIndex(x => x.productId == itemToSend.productId)].shippingCost;
                        let itemDelMethodToSend =this.itemsInCart[ this.itemsInCart.findIndex(x => x.productId == itemToSend.productId)].deliveryMethod;
                        this.checkallitemDelMethsAreselected = true;
                        this.selectShippingMethod(itemToSend, itemFeeToSend, itemDelMethodToSend);
                    }
                }
                
            }
            break;
            case 'No':
            {
                this.conversations.push(new Conversation(MsgDirection.Out, 'No'));

                this.route.navigateByUrl('/mycart');
            }
            break;
            default:
            {

            }
            break;
        }
    }
    
    checkfornodelallitems()
    {
        for (var i = 0; i < this.filteredCartItems.length; i++) {
            let item = this.filteredCartItems[i];
            let ordItemsCount= this.filteredCartItems[i].orderItems.length;
            for (var j = 0; j < ordItemsCount; j++) {
                let order = this.filteredCartItems[i].orderItems[j];
                if (this.filteredCartItems[i].noDeliveryMethod) {
                   //for(var k=0;k<this.filteredCartItems[i].orderItems.length;k++)
                   //{
                    //this.itemsInCart.splice(this.itemsInCart.findIndex(x => x.productId == this.filteredCartItems[i].orderItems[k].productId), 1);
                   //} 
                  this.nodelCount++;
                }
                else if(this.filteredCartItems[i].orderItems[j].noDeliveryMethod)
                {
                   // this.itemsInCart.splice(this.itemsInCart.findIndex(x => x.productId == this.filteredCartItems[i].orderItems[j].productId), 1);
                   if(order.isSMSelected) 
                   this.filteredCartItems[i].orderItems.splice(j,1);
                  this.nodelCount++;
                    
                }
                this.itemscntt++;
            }
        }
       
       
    }
    removeNodeliveryItems()
    {
        for (var i = 0; i < this.filteredCartItems.length; i++) {
            let item = this.filteredCartItems[i];
            let ordItemsCount= this.filteredCartItems[i].orderItems.length;
            for (var j = 0; j < ordItemsCount; j++) {
                let order = this.filteredCartItems[i].orderItems[j];
                if (this.filteredCartItems[i].noDeliveryMethod) {
                   //for(var k=0;k<this.filteredCartItems[i].orderItems.length;k++)
                   //{
                    //this.itemsInCart.splice(this.itemsInCart.findIndex(x => x.productId == this.filteredCartItems[i].orderItems[k].productId), 1);
                   //} 
                   if(order != undefined && order.isSMSelected)
                        this.filteredCartItems[i].orderItems =[];
                    else if(this.filteredCartItems[i].isSMSelected)
                        this.filteredCartItems[i].orderItems =[];

                }
                else if(this.filteredCartItems[i].orderItems[j].noDeliveryMethod)
                {
                   // this.itemsInCart.splice(this.itemsInCart.findIndex(x => x.productId == this.filteredCartItems[i].orderItems[j].productId), 1);
                   if(order.isSMSelected) 
                   this.filteredCartItems[i].orderItems.splice(j,1);
                    
                }
            }
        }
        for (var i = 0; i < this.filteredCartItems.length; i++) {
            this.filteredCartItems[i].orderItems.length ==0 ? this.filteredCartItems.splice(i,1):{};

        }
       
       
    }
    getBase64Image(img) {
        var canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        var ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);
        var dataURL = canvas.toDataURL("image/png");
        this.user_base64_img = dataURL.replace(/^data:image\/(png|jpg);base64,/, "");
    }

    setImage(img) {
        this.user_base64_img = img;
    }

    filterEmailRes(res, from?: any) {
        if (from == 'signup') {
            if (res.userId != null || res.userId != undefined) {
                this.questionPopUps = [];
                window.localStorage['suggestUserInfo'] = JSON.stringify(res);
                this.conversations.push(new Conversation(MsgDirection.In, "That email already is registered. Do you want to login or try a different email?"));
                this.questionPopUps.push(new QuestionPopUp("log in"));
                this.questionPopUps.push(new QuestionPopUp("Try Different Email"));
                this.core.footerSwapCUI(true, false);
                return false;
            }
            else {
                this.questionPopUps = [];
                this.conversations.push(new Conversation(MsgDirection.In, "Password too!"));
                //this.questionPopUps.push(new QuestionPopUp("Forgot my Password"));
                this.core.onlyPassword = true;
                this.core.footerSwapCUI(false, true);
                this.scrollTo();
                return false;
            }
        }
        else if (from == 'forgotPassword') {
            if (res.userId != null || res.userId != undefined) {
                if (res.userCreateStatus) {
                    let userId = res.userId;
                    this.fpModal.email = this.loginEmailId.charAt(0).toLowerCase() + this.loginEmailId.slice(1).toLowerCase(); //cant be append at service level 
                    this.fpModal.resetLink = environment.kalaUIURL+ `/reset-password?id=${userId}`;
                    this.fpService.forgotPassword(this.fpModal).subscribe(res => {
                        this.loader = false;
                        // window.localStorage['userInfo'] = JSON.stringify(res);
                    }, err => {
                    })
                }
                else {
                    this.loader = false;
                }
            }
            else {
                this.loader = false;
            }
        }
        else {
            if (res.userId != null || res.userId != undefined) {
                return true;
            }
            else {
                this.questionPopUps = [];
                this.conversations.push(new Conversation(MsgDirection.In, "Sorry, we couldn't find your account. Would you like to sign up or try a different username?"));
                this.questionPopUps.push(new QuestionPopUp("log in"));
                this.questionPopUps.push(new QuestionPopUp("sign up"));
                this.core.footerSwapCUI(true, false);
                return false;
            }
        }
    }

   

    async addChatInput(userInputChat: any) {

        this.invalidInput = false;

        if (userInputChat.userInput == "" || typeof (userInputChat.userInput) == "undefined") {
            return;
        }
        console.log(userInputChat.userInput);
        this.UserInput = "";
        if (this.conversations[this.conversations.length - 2] != undefined && this.conversations[this.conversations.length - 4] != undefined && (this.conversations[this.conversations.length - 2].data == "log in" || (this.conversations[this.conversations.length - 4].data == "log in" && this.conversations[this.conversations.length - 1].data == "Password too!"))) {
            if (this.conversations[this.conversations.length - 1].data == 'Can I have your email address?') {
                this.usr.emailId = userInputChat.userInput;
                this.loginEmailId = userInputChat.userInput;
                var emailOut = this.emailValidator();
                if (!emailOut) {
                    this.invalidInput = true;
                    this.invalidInputText = 'Please enter a valid email address';
                    return;
                }

                var emailOutApi = await this.fpService.getUserByEmailId(this.loginEmailId.toLowerCase());
                emailOutApi = this.filterEmailRes(emailOutApi, 'default');
                if (!emailOutApi) {

                    return;
                }
                this.conversations.push(new Conversation(MsgDirection.Out, userInputChat.userInput));
                this.core.onlyPassword = true;
                this.questionPopUps = [];
                this.conversations.push(new Conversation(MsgDirection.In, "Password too!"));
                this.questionPopUps.push(new QuestionPopUp("Forgot my Password"));
            }
            else if (this.conversations[this.conversations.length - 1].data == "Password too!" || this.conversations[this.conversations.length - 2].data == "Okay") {
                this.usr.password = userInputChat.userInput;
                this.conversations.push(new Conversation(MsgDirection.Out, "********"));
                this.OnLogin(this.usr.emailId, this.usr.password);
                this.scrollTo();
            }
            else { }
        }
        else if (this.conversations[this.conversations.length - 1] != undefined
            && (this.conversations[this.conversations.length - 1].data.indexOf('what can i help you with today ?') > -1)
            || this.conversations[this.conversations.length - 1].data == 'Can you give me a little more info so i can better help you ?'
            || this.conversations[this.conversations.length - 1].data == 'I\'ll look into this for you right away, Is there any other information that you want me to know ?'
            || this.conversations[this.conversations.length - 1].data == 'Yes' && this.OtherOption) {
            this.core.footerSwapCUI(true, false);
            this.submitComment('', userInputChat.userInput);
        }
        else if(this.core.isGuestCheckout) {
            this.loginEmailId = userInputChat.userInput;
            var emailOut = this.emailValidator();
            if (!emailOut) {
                this.invalidInput = true;
                this.invalidInputText = 'Please enter a valid email address';
                return;
            }
            else {
                this.core.footerSwapCUI(true, false);
            }
            this.conversations.push(new Conversation(MsgDirection.Out, userInputChat.userInput));
            if(window.localStorage['Guest-UserInfo'] != undefined) {
                this.user.email = userInputChat.userInput;
            }
            this.conversations.push(new Conversation(MsgDirection.In, 'What address do you want this shipped to?'));
                    // this.loadShippingAddress();
                    this.hideForGuest = true;
                    this.showAddressBool = true;
                    this.ng4LoadingSpinnerService.hide();
        }
        else {
            if (this.conversations[this.conversations.length - 1] != undefined) {
                if (this.conversations[this.conversations.length - 1].data == 'Can I have your first name?') {
                    this.usr.firstName = userInputChat.userInput;
                    this.conversations.push(new Conversation(MsgDirection.Out, userInputChat.userInput));
                    this.conversations.push(new Conversation(MsgDirection.In, "Last name please"));
                    this.profileInformation.firstName = userInputChat.userInput;
                    this.scrollTo();
                }
                else if (this.conversations[this.conversations.length - 1].data == "Last name please") {
                    this.usr.lastName = userInputChat.userInput;
                    this.conversations.push(new Conversation(MsgDirection.Out, userInputChat.userInput));
                    this.conversations.push(new Conversation(MsgDirection.In, "Can I have your email address?"));
                    this.core.onlyEmailId = true;
                    this.profileInformation.lastName = userInputChat.userInput;
                    this.scrollTo();
                }
                else if (this.conversations[this.conversations.length - 1].data == 'Can I have your email address?') {
                    let ifSignUp: boolean = false;
                    this.usr.emailId = userInputChat.userInput;
                    this.loginEmailId = userInputChat.userInput;
                    var emailOut = this.emailValidator();
                    if (!emailOut) {
                        this.core.onlyEmailId = true;
                        this.invalidInput = true;
                        this.invalidInputText = 'Please enter a valid email address';
                        this.scrollTo();
                        return;
                    }
                    if (this.conversations[this.conversations.length - 2].data == 'log in') {
                        var emailOutApi = await this.fpService.getUserByEmailId(this.loginEmailId.toLowerCase());
                        emailOutApi = this.filterEmailRes(emailOutApi, 'default');
                        if (!emailOutApi) {

                            this.scrollTo();
                            return;
                        }

                    }
                    else {
                        this.conversations.push(new Conversation(MsgDirection.Out, userInputChat.userInput));
                        var emailOutApi = await this.fpService.getUserByEmailId(this.loginEmailId.toLowerCase());
                        emailOutApi = this.filterEmailRes(emailOutApi, 'signup');
                        ifSignUp = true;
                    }
                    if (!ifSignUp) {
                        this.core.onlyPassword = true;
                        this.usr.emailId = userInputChat.userInput;
                        this.conversations.push(new Conversation(MsgDirection.Out, userInputChat.userInput));
                        this.conversations.push(new Conversation(MsgDirection.In, "Password too!"));
                        this.profileInformation.emailId = userInputChat.userInput;
                        this.questionPopUps =[];
                        if (this.conversations[this.conversations.length - 5] != undefined && this.conversations[this.conversations.length - 5].data != 'Last name please') // To not to show during sign up
                            this.questionPopUps.push(new QuestionPopUp("Forgot my Password"));
                        else if(this.conversations.length >0 && (this.conversations[0].data == "log in" || this.conversations[0].data == "sign in") || (this.conversations[1] != undefined && this.conversations[1].data == "log in"))
                        {
                            this.questionPopUps.push(new QuestionPopUp("Forgot my Password"));
                        }
                        this.scrollTo();
                    }
                }
                else if (this.conversations[this.conversations.length - 1].data == "Password too!" ||
                    this.conversations[this.conversations.length - 1].data == "Make sure your password is 8 characters or longer, with at least 1 uppercase, 1 lowercase, 1 number, and 1 special character.") {
                    let validaPassword: boolean = false;
                    var passwordOut = this.passwordValidator(userInputChat.userInput);
                    if (passwordOut) {
                        this.core.onlyPassword = true;
                        validaPassword = true;
                        this.scrollTo();
                    }
                    if (validaPassword) {
                        this.usr.password = userInputChat.userInput;
                        this.conversations.push(new Conversation(MsgDirection.Out, "********"));
                        this.questionPopUps = [];
                        this.signUp();
                    }
                    else {
                        this.conversations.push(new Conversation(MsgDirection.In, "Make sure your password is 8 characters or longer, with at least 1 uppercase, 1 lowercase, 1 number, and 1 special character."))
                    }
                }
                else if (this.conversations[this.conversations.length - 1].data == "Almost done. Any special instructions to the retailer?") {
                    this.Step3SelectedValues.instruction = userInputChat.userInput;
                    this.conversations.push(new Conversation(MsgDirection.Out, userInputChat.userInput));
                    this.questionPopUps = [];
                    this.questionPopUps.push(new QuestionPopUp("I want to start over"));
                    this.questionPopUps.push(new QuestionPopUp("That’s it. Get me offers!"));
                    this.core.footerSwapCUI(true, false);

                    if (this.GetOfferStep_2 != undefined) {
                        this.Step2Data = this.GetOfferStep_2Summary;
                        this.step2DataArr = [];
                        for (var keys in this.Step2Data.attributes) {
                            this.step2DataArr.push({
                                key: keys,
                                values: this.Step2Data.attributes[keys]
                            })
                        }
                    }


                    this.Step3Modal.getoffer_3 = new Array<OfferInfo3>();
                    this.Step3Modal.getoffer_3.push(new OfferInfo3(this.Step3SelectedValues.price, this.Step3SelectedValues.delivery, this.Step3SelectedValues.instruction, this.Step3SelectedValues.location))

                    if (this.GetOfferStep_2 == "") {
                        this.GetOfferStep_2 = "";
                        this.Step4Summary = { ...this.Step1Modal.getoffer_1[0] };
                        this.showGetOfferSummary = true;
                    }
                    if (this.Step3Modal.getoffer_3.length == 0) {
                        this.Step3Data = "";
                        this.Step4Summary = { ...this.Step1Modal.getoffer_1[0], ...this.GetOfferStep_2Summary, ...this.Step3Modal.getoffer_3 };
                        this.showGetOfferSummary = true;
                    }
                    else if (this.Step3Modal.getoffer_3 != undefined) {

                        this.Step4Summary = { ...this.Step1Modal.getoffer_1[0], ...this.GetOfferStep_2Summary, ...this.Step3Modal.getoffer_3[0] };
                        this.showGetOfferSummary = true;
                    }
                    //get the get offer summary

                }
                else if (this.conversations[this.conversations.length - 1].data == "Re-enter Password") {
                    this.usr.password = userInputChat.userInput;
                    this.conversations.push(new Conversation(MsgDirection.Out, "********"));
                    this.OnLogin(this.usr.emailId, this.usr.password);
                    this.questionPopUps = [];
                    this.core.footerSwapCUI(true, false);
                    this.scrollTo();
                }
                else if (this.conversations[this.conversations.length - 1].data == "What’s your zipcode?") {
                    this.addNewAddress(userInputChat.userInput);
                    this.core.inputNewLocation = false;
                    this.scrollTo();
                }
                else if (this.otherOptionHasBeenSelected == "Other") {
                    if (this.otherOptionValue != undefined && this.otherOptionValue != '') {
                        this.Step2SelectedValues.splice(this.Step2SelectedValues.findIndex(obj => obj.values === this.otherOptionValue), 1); //if other options already selected

                    }
                    if (this.GetOfferStep_2Summary.attributes[this.lastValueForAPI].findIndex(i => i == "Other") != -1) {
                        let indxx = this.GetOfferStep_2Summary.attributes[this.lastValueForAPI].findIndex(i => i == "Other");
                        this.GetOfferStep_2Summary.attributes[this.lastValueForAPI].splice(indxx, 1);
                    }
                    else if (this.otherOptionValue != undefined && this.otherOptionValue != '') {
                        this.GetOfferStep_2Summary.attributes[this.lastValueForAPI].splice(this.GetOfferStep_2Summary.attributes[this.lastValueForAPI].findIndex(i => i == this.otherOptionValue), 1);
                    }
                    else {

                    }
                    this.otherOptionsInput(userInputChat.userInput)
                    this.otherOptionValue = userInputChat.userInput;
                }

                else if (this.conversations[this.conversations.length - 3].data == "Forgot my Password" || this.conversations[this.conversations.length - 2].data == "Resend Email") {
                    this.usr.password = userInputChat.userInput;
                    this.conversations.push(new Conversation(MsgDirection.Out, "********"));
                    this.OnLogin(this.usr.emailId, this.usr.password);
                    this.questionPopUps = [];
                    this.core.footerSwapCUI(true, false);
                    this.scrollTo();
                }
                else {
                    this.invalidInput = true;
                    this.invalidInputText = "Invalid Input, Please Select from options!";
                    this.scrollTo();
                }
            }
        }
    }
    onSubmit(profileInfo) {
        this.usr.userCreateStatus = false;
        this.usr.phone = "";
        this.usr.roleName = [];
        this.usr.roleName.push("consumer");
        this.usr.emailId = this.usr.emailId.toLowerCase();
        this.joinKalaService.joinKalaStepOne(this.usr).subscribe(res => {
            console.log(res);
            this.userInfo = res;
            if (this.userInfo.user_status === "success") {
                window.localStorage['userInfo'] = JSON.stringify(this.userInfo);
                window.localStorage['suggestUserInfo'] = JSON.stringify(this.userInfo);
                this.signUpResponse.status = true;
                this.signUpResponse.message = this.joinUserMsg.success;
                setTimeout(() => {
                    if (this.routerOutlet.isActivated) this.routerOutlet.deactivate();
                    this.router.navigateByUrl('/profile-info');
                }, 3000);
            }
            else if (this.userInfo.user_status === "alreadyExists") {
                if (this.userInfo.userCreateStatus == false) {
                    this.userInfo.user_status = "inactive";
                    this.signUpResponse.status = true;
                    this.signUpResponse.message = this.joinUserMsg.inactiveUser;
                    
                }
                else {
                    this.signUpResponse.status = true;
                    this.signUpResponse.message = this.joinUserMsg.emailExists;
                }
                localStorage.removeItem('suggestUserInfo');
            }
        }, err => {
            this.signUpResponse.status = true;
            this.signUpResponse.message = this.joinUserMsg.fail;
            this.core.footerSwapCUI(true, false);
        });

    }
    onDateSelection(date: any) {
        this.questionPopUps = [];
        document.getElementsByClassName("cdk-overlay-container")[0].classList.add("signupdob");
        this.profileInformation.dateOfBirth = date.value.getFullYear() + "-" + (date.value.getMonth() + 1) + "-" + date.value.getDate();
        this.profileInformation.stringDateOfBirth = date.value.getFullYear() + "/" + (date.value.getMonth() + 1) + "/" + date.value.getDate();
        this.conversations.push(new Conversation(MsgDirection.Out, this.profileInformation.dateOfBirth));
        if (date != "" || date != undefined) {
            this.CompleteProfile();
        }
        this.scrollTo();
        this.dobskipper = false;
    }

    toDataURL(url, callback) {
        var xhr = new XMLHttpRequest();
        xhr.onload = function () {
            var reader = new FileReader();
            reader.onloadend = function () {
                callback(reader.result);
            }
            reader.readAsDataURL(xhr.response);
        };
        xhr.open('GET', url);
        xhr.responseType = 'blob';
        xhr.send();
    }


    CompleteProfile() {
        this.toDataURL(this.imgSrc, dataUrl => this.imgSrc = dataUrl);
        setTimeout(() => {
            this.getUserInfo = JSON.parse(this.getUserInfo);
            this.profileInformation.userId = this.getUserInfo.userId;
            this.profileInformation.firstName = this.getUserInfo.firstName;
            this.profileInformation.lastName = this.getUserInfo.lastName;
            this.profileInformation.fullName = this.getUserInfo.firstName + ' ' + this.getUserInfo.lastName;
            this.profileInformation.emailId = this.getUserInfo.emailId;
            this.profileInformation.consumerImagePath = this.imgSrc.toString();
            this.profileInformation.address = new Array<ConsumerAddress>();
            this.profileInfoServ.completeProfile(this.profileInformation).subscribe(res => {
                if (this.profileInfoResponse.response !== null) {
                    // window.localStorage['userInfo'] = res;
                    this.getUserInfo = JSON.stringify(res);
                    this.questionPopUps = [];
                    this.conversations.push(new Conversation(MsgDirection.In, "Almost done! Select any of the below categories that interest you"));
                    this.interest.getInterest().subscribe(res => {
                        this.input_dob = false;
                        this.interestImages = { data: res, label: 'interest' };
                        this.conversations.push(new Conversation(MsgDirection.In, this.interestImages));
                        this.questionPopUps.push(new QuestionPopUp("Skip"));
                        this.questionPopUps.push(new QuestionPopUp("Done"));
                        this.showInterestPreference = true;
                    });
                }
            });
        }, 500);
    }

    selectInterest(e, obj) {
        obj.selectImg = !obj.selectImg;
        this.getInterest.push(new ConsumerInterest(e.currentTarget.id, e.currentTarget.title, e.currentTarget.src));
        this.getInterest = this.getInterest.filter((elem, index, self) => self.findIndex((img) => {
            return (img.id === elem.id && img.consumerInterestImageName === elem.consumerInterestImageName)
        }) === index);

        if (obj.selectImg == false) {
            for (var i = 0; i < this.getInterest.length; i++) {
                if (this.getInterest[i].id == obj.id) this.getInterest.splice(i, 1)
            }
        }
    }

    saveInterest() {
        this.getUserInfo = JSON.parse(JSON.parse(this.getUserInfo));
        this.postInterest.consumerInterests = this.getInterest;
        this.postInterest.address = this.getUserInfo.address;
        this.postInterest.consumerImagePath = this.getUserInfo.consumerImagePath;
        this.postInterest.customerId = this.getUserInfo.customerId;
        this.postInterest.dateOfBirth = this.getUserInfo.dateOfBirth;
        this.postInterest.emailId = this.getUserInfo.emailId;
        this.postInterest.firstName = this.getUserInfo.firstName;
        this.postInterest.gender = this.getUserInfo.gender;
        this.postInterest.lastName = this.getUserInfo.lastName;
        this.postInterest.phone = this.getUserInfo.phone;
        this.postInterest.userId = this.getUserInfo.userId;
        this.postInterest.fullName = this.getUserInfo.firstName + ' ' + this.getUserInfo.lastName;
        this.postInterest.stringDateOfBirth = this.getUserInfo.stringDateOfBirth;
        console.log(this.postInterest);
        this.interest.postInterest(this.postInterest).subscribe(res => {
            console.log(res);
            this.core.deactivateRouteFlag(false);
            this.conversations.push(new Conversation(MsgDirection.In, "You're all done! Let's get shopping!"));
            setTimeout(() => {
                if (this.routerOutlet.isActivated) this.routerOutlet.deactivate();
                this.router.navigateByUrl('/home');
            }, 2000);
        });
    }

    OnLogin(username: any, password: any) {
        username = username.charAt(0).toLowerCase() + username.slice(1).toLowerCase() // cant handel at service level
        this.userCredential = new User(username, username, password)
        this.auth.login(this.userCredential).then((res) => {
            const resJson = res.json();
            this.localStorageService.setItem('token', resJson.access_token, resJson.expires_in);
            this.core.setRefereshToken(resJson.refresh_token);
            this.auth.getUserInfo(resJson.access_token).subscribe(res => {
                if (res.userCreateStatus == false) {
                    localStorage.removeItem("token");
                    this.questionPopUps = [];
                    this.questionPopUps.push(new QuestionPopUp('log in'));
                    this.questionPopUps.push(new QuestionPopUp('sign up'));
                    this.questionPopUps.push(new QuestionPopUp('Get Activation Link'));
                    window.localStorage['suggestUserInfo'] = JSON.stringify(res);
                    this.conversations.push(new Conversation(MsgDirection.In, "Your account is not yet verfied with Kala. Please verifiy your account at the earliest."));
                    this.core.footerSwapCUI(true, false);
                }
                else {
                    if (res.roleName[0] != "consumer") {
                        this.conversations.push(new Conversation(MsgDirection.In, "We couldn't verify that you are authorized to access the portal."));
                    }
                    else {
                        this.core.startTokenValidation();
                        window.localStorage['userInfo'] = JSON.stringify(res);
                        this.usr = new UserProfile(JSON.parse(window.localStorage['userInfo']));
                        this.conversation = new Conversation(MsgDirection.In, 'Welcome back ' + this.usr.firstName);
                        this.conversations.push(this.conversation);
                        this.questionPopUps = [];
                        this.timeoutAfterLogin();
                        this.core.deactivateRouteFlagVal = false;
                        localStorage.removeItem('suggestUserInfo');

                    }
                }
            }, err => {
                console.log(err);
            })
        }).catch((err) => {
            console.log(err);
            this.questionPopUps = [];
            this.conversations.push(new Conversation(MsgDirection.In, "Oops, that wasn't the right password. Would you like to re-enter or reset your password?"));
            this.core.footerSwapCUI(true, false);
            this.questionPopUps.push(new QuestionPopUp("Re-enter Password"));
            this.questionPopUps.push(new QuestionPopUp("Forgot my Password"));
            this.questionPopUps.push(new QuestionPopUp("sign up"));
            return false;
        });
    }
    sendAccountReverificationLink() {
        this.auth.verifyAccount(this.loginEmailId).subscribe((res) => {
            this.questionPopUps = [];
            this.questionPopUps.push(new QuestionPopUp('log in'));
            this.questionPopUps.push(new QuestionPopUp('sign up'));
            this.questionPopUps.push(new QuestionPopUp('Get Activation Link'));
            this.conversations.push(new Conversation(MsgDirection.In, "No problem. We just sent you an email to verify your account."));
            setTimeout(() => {
                this.conversations.push(new Conversation(MsgDirection.In, "Please click on the email link to verify, and then login to continue."));
            }, 1000);
            console.log("Email Sent Sucessfully");
        }, (err) => {
            console.log("Error in API")
        })
    }
    timeoutAfterLogin() {
        setTimeout(() => {
            this.core.onlyPassword = false;
            if (window.localStorage['token'] == undefined) { }
            else {
                this.questionPopUps = [];
                if (this.loginFromGetOffers) {
                    // this.GetOffersFromSummary();
                    this.core.footerSwapCUI(true, false);
                    this.getOffersReq("get offers");
                }
                else if(this.core.getbackToGetOffer)
                {
                    this.core.footerSwapCUI(true, false);
                    this.getOffersReq("get offers");
                }
                else {
                    if (window.localStorage['tbnAfterLogin'] != undefined) this.route.navigateByUrl(window.localStorage['tbnAfterLogin'])
                    else this.route.navigateByUrl('/home');
                    localStorage.removeItem("tbnAfterLogin");
                }
            }
        }, 2000);
    }
    signUp() {
        this.core.footerSwapCUI(true, false);
        this.usr.fullName = this.usr.firstName + ' ' + this.usr.lastName;
        this.usr.userCreateStatus = false;
        this.usr.phone = "";
        this.usr.roleName = [];
        this.usr.roleName.push("consumer");
        this.usr.emailId = this.usr.emailId.toLowerCase();
        this.joinKalaService.joinKalaStepOne(this.usr).subscribe(res => {
            console.log(res);
            localStorage.removeItem("userInfo");
            this.userInfo = res;
            if (this.userInfo.user_status === "success") {
                // window.localStorage['userInfo'] = JSON.stringify(this.userInfo);
                this.getUserInfo = JSON.stringify(this.userInfo);
                window.localStorage['suggestUserInfo'] = JSON.stringify(this.userInfo);
                this.signUpResponse.status = true;
                this.conversations.push(new Conversation(MsgDirection.In, "Nice! Now you have a Kala account"));
                this.conversations.push(new Conversation(MsgDirection.In, "A verfication link has been sent to the email address you have provided. Please verifiy your account at the earliest."));
                this.conversations.push(new Conversation(MsgDirection.In, "Can I ask you a few questions?"));
                this.questionPopUps.push(new QuestionPopUp("no thanks"));
                this.questionPopUps.push(new QuestionPopUp("sure, go ahead"));
                this.changedetRef.detectChanges();

            }
            else if (this.userInfo.user_status === "alreadyExists") {
                if (this.userInfo.userCreateStatus == false) {
                    this.userInfo.user_status = "inactive";
                    this.signUpResponse.status = true;
                    this.signUpResponse.message = this.joinUserMsg.inactiveUser;
                }
                else {
                    this.signUpResponse.status = true;
                    this.signUpResponse.message = this.joinUserMsg.emailExists;
                }
                localStorage.removeItem('suggestUserInfo');
            }
        }, err => {
            this.signUpResponse.status = true;
            this.signUpResponse.message = this.joinUserMsg.fail;
            this.conversations.push(new Conversation(MsgDirection.In, JSON.parse(err._body).error));
            this.questionPopUps.push(new QuestionPopUp("sign up"));
            this.questionPopUps.push(new QuestionPopUp("log in"));
        });


    }

    // async selectShippingAddress(e?, address?) {
    //     this.loader_shippingMethod = true;
    //     this.showShippingMethod = false;
    //     this.finalShippingAmount =0;
    //     for (var i = 0; i < this.itemsInCart.length; i++) {
    //       if(this.itemsInCart[i].deliveryMethod != undefined)
    //       {
    //         this.itemsInCart[i].deliveryMethod = undefined;
    //       }
    //     }
    //     // let allAddress = document.getElementsByClassName("customerShippingAddress");
    //     // for (var i = 0; i < allAddress.length; i++) {
    //     //   if (allAddress[i].classList.contains("categ_outline_red")) {
    //     //     allAddress[i].classList.remove("categ_outline_red");
    //     //     allAddress[i].classList.add("categ_outline_gray");
    //     //   }
    //     // }
    //     // let element = e.currentTarget;
    //     // element.classList.remove("categ_outline_gray");
    //     // element.classList.add("categ_outline_red");
    
    //     this.selectedAddressDetails = address;
    //     let resShippingResponse = [];
    
       
    //     for (var i = 0; i < this.filteredCartItems.length; i++) {
    //       this.orderCheckout = new OrderCheckout();
    //       let  pproduDimention =  Array<ProduDimention>();
    //       for (var j = 0; j < this.filteredCartItems[i].orderItems.length; j++) {
    //         let prodId = this.filteredCartItems[i].orderItems[j].productId;
    //         let item = this.itemsInCart.find(function(element){
    //           return element.productId ==prodId
    //         })
    //         this.orderCheckout.locationName = address.state;
    //         this.orderCheckout.shippingProfileId = item.shipProfileId;
    //         this.produDimention = new ProduDimention();
    //         this.produDimention.productHeight = item.shippingHeight;
    //         this.produDimention.productWeight = item.shippingWeight;
    //         this.produDimention.productLength = item.shippingLength;
    //         this.produDimention.productQuantity =item.quantity;
    //         this.produDimention.productPrice = item.price;
    //         this.produDimention.productWidth = item.shippingWidth;
    
    //         pproduDimention.push(this.produDimention);
     
    //       }
    //       this.orderCheckout.productDimention = pproduDimention;
    //       this.checkout.getGuestShippingMethodsOnAddress(this.orderCheckout).subscribe((res) => {
    //         resShippingResponse.push({
    //           shippingProfileId: res.shippingProfileId,
    //           shippingOriginAddress: res.shippingOriginAddress
    //         });
    //         let locationFee = res.locationFee;
    //         this.shippingMethod = res.deliveryMethods;
    //         this.selectedAddressDetails = address;
    //         this.loader_shippingMethod = false;
    //         this.showShippingMethod = true;
    //         this.loader_productTax = true;
    //         for (var i = 0; i < this.filteredCartItems.length; i++) {
    //           for (var j = 0; j < this.filteredCartItems[i].orderItems.length; j++) {
    //             let order = this.filteredCartItems[i].orderItems[j];
    //             if (order.shipProfileId == res.shippingProfileId) {
    //               if (res.noDeliveryMethod) {
    //                 this.ifNoDeliveryMethod = true;
    //                 if (this.filteredCartItems[i].differentShippingMethod) {
    //                   this.filteredCartItems[i].orderItems[j].noDeliveryMessage = res.noDeliveryMessage;
    //                   this.filteredCartItems[i].orderItems[j].noDeliveryMethod = true;
    //                 }
    //                 else {
    //                   this.filteredCartItems[i].noDeliveryMessage = res.noDeliveryMessage;
    //                   this.filteredCartItems[i].noDeliveryMethod = true;
    //                 }
    //               }
    //               else {
    //                 this.ifNoDeliveryMethod = false;
    //                 if (this.filteredCartItems[i].differentShippingMethod) {
    //                   this.filteredCartItems[i].orderItems[j].deliveryTiers = res.deliveryMethods;
    //                   this.filteredCartItems[i].orderItems[j].locationFee = locationFee;
    //                   this.filteredCartItems[i].orderItems[j].noDeliveryMessage = res.noDeliveryMessage;
    //                   this.filteredCartItems[i].orderItems[j].noDeliveryMethod =  res.noDeliveryMethod;
    //                 }
    //                 else {
    
    //                   this.filteredCartItems[i].deliveryTiers = res.deliveryMethods;
    //                   this.filteredCartItems[i].locationFee = locationFee;
    //                   this.filteredCartItems[i].noDeliveryMessage = res.noDeliveryMessage;
    //                   this.filteredCartItems[i].noDeliveryMethod =  res.noDeliveryMethod;
    //                 }
    //               }
    //             }
    //           }
    //         }
    //         if (this.filteredCartItems.length == resShippingResponse.length) {
    //           this.getTax(address, resShippingResponse);
    //         }
    //       }, (err) => {
    //         console.log(err)
    //       });
    //       this.produDimention = new ProduDimention();
    //    }
    
    
    
    
    
    
    
    
    //     // for (var i = 0; i < this.itemsInCart.length; i++) {
    //     //   this.checkout.getShippingMethods(address.state, this.itemsInCart[i].shipProfileId, this.itemsInCart[i].quantity, this.itemsInCart[i].shippingWeight, this.itemsInCart[i].price, this.itemsInCart[i].shippingLength, this.itemsInCart[i].shippingHeight, this.itemsInCart[i].shippingWidth).subscribe((res) => {
    //     //     resShippingResponse.push({
    //     //       shippingProfileId: res.shippingProfileId,
    //     //       shippingOriginAddress: res.shippingOriginAddress
    //     //     });
    //     //     let locationFee = res.locationFee;
    //     //     this.shippingMethod = res.deliveryMethods;
    //     //     this.loader_shippingMethod = false;
    //     //     this.showShippingMethod = true;
    //     //     this.loader_productTax = true;
    //     //     for (var i = 0; i < this.filteredCartItems.length; i++) {
    //     //       for (var j = 0; j < this.filteredCartItems[i].orderItems.length; j++) {
    //     //         let order = this.filteredCartItems[i].orderItems[j];
    //     //         if (order.shipProfileId == res.shippingProfileId) {
    //     //           if (res.noDeliveryMethod) {
    //     //             this.ifNoDeliveryMethod = true;
    //     //             if (this.filteredCartItems[i].differentShippingMethod) {
    //     //               this.filteredCartItems[i].orderItems[j].noDeliveryMessage = res.noDeliveryMessage;
    //     //               this.filteredCartItems[i].orderItems[j].noDeliveryMethod = true;
    //     //             }
    //     //             else {
    //     //               this.filteredCartItems[i].noDeliveryMessage = res.noDeliveryMessage;
    //     //               this.filteredCartItems[i].noDeliveryMethod = true;
    //     //             }
    //     //           }
    //     //           else {
    //     //             if (this.filteredCartItems[i].differentShippingMethod) {
    //     //               this.filteredCartItems[i].orderItems[j].deliveryTiers = res.deliveryMethods;
    //     //               this.filteredCartItems[i].orderItems[j].locationFee = locationFee;
    //     //             }
    //     //             else {
    //     //               this.filteredCartItems[i].deliveryTiers = res.deliveryMethods;
    //     //               this.filteredCartItems[i].locationFee = locationFee;
    //     //             }
    //     //           }
    //     //         }
    //     //       }
    //     //     }
    //     //     if (this.itemsInCart.length == resShippingResponse.length) {
    //     //       this.getTax(address, resShippingResponse);
    //     //     }
    //     //   }, (err) => {
    //     //     console.log(err)
    //     //   });
    //     // }
    //     // setTimeout(() => {
    //     //   this.getTax(address, resShippingResponse);
    //     // }, 3000)
    //   }

    async selectShippingAddress(e, address) {
        this.loader_shippingMethod = true;
        this.showShippingMethod = false;
        for (var i = 0; i < this.itemsInCart.length; i++) {
            if(this.itemsInCart[i].deliveryMethod != undefined)
            {
              this.itemsInCart[i].deliveryMethod = undefined;
            }
          }

        let allAddress = document.getElementsByClassName("customerShippingAddress");
        for (var i = 0; i < allAddress.length; i++) {
            if (allAddress[i].classList.contains("categ_outline_red")) {
                allAddress[i].classList.remove("categ_outline_red");
                allAddress[i].classList.add("categ_outline_gray");
            }
        }
        let element = e.currentTarget;
        // element.classList.remove("categ_outline_gray");
        this.selectedAddressDetails = address;
        let resShippingResponse = [];
        for (var l = 0; l < this.filteredCartItems.length; l++) {
            this.orderCheckout = new OrderCheckout();
            let  pproduDimention =  Array<ProduDimention>();
            for (var j = 0; j < this.filteredCartItems[l].orderItems.length; j++) {
              let prodId = this.filteredCartItems[l].orderItems[j].productId;
              let item = this.itemsInCart.find(function(element){
                return element.productId ==prodId
              })
              this.orderCheckout.locationName = address.state;
              this.orderCheckout.shippingProfileId = item.shipProfileId;
              this.produDimention = new ProduDimention();
              this.produDimention.productHeight = item.shippingHeight;
              this.produDimention.productWeight = item.shippingWeight;
              this.produDimention.productLength = item.shippingLength;
              this.produDimention.productQuantity =item.quantity;
              this.produDimention.productPrice = item.price;
              this.produDimention.productWidth = item.shippingWidth;
      
              pproduDimention.push(this.produDimention);
       
            }
            this.orderCheckout.productDimention = pproduDimention;






       
       // for (var i = 0; i < this.itemsInCart.length; i++) {
          await  this.checkout.getShippingMethodsOnAddress(this.orderCheckout).subscribe((res) => {
                resShippingResponse.push({
                    shippingProfileId: res.shippingProfileId,
                    shippingOriginAddress: res.shippingOriginAddress
                });
                let locationFee = res.locationFee;
                this.shippingMethod = res.deliveryMethods;
                if(res.deliveryMethods != undefined) for (var i = 0; i < res.deliveryMethods.length; i++) res.deliveryMethods[i].deliveryFee = res.deliveryMethods[i].deliveryFee + res.locationFee;
                this.loader_shippingMethod = false;
                this.showShippingMethod = true;
                this.loader_productTax = true;
                for (var i = 0; i < this.filteredCartItems.length; i++) {
                    for (var j = 0; j < this.filteredCartItems[i].orderItems.length; j++) {
                        let order = this.filteredCartItems[i].orderItems[j];
                        if (order.shipProfileId == res.shippingProfileId) {
                            if (res.noDeliveryMethod) {
                                this.ifNoDeliveryMethod = true;
                                if (this.filteredCartItems[i].differentShippingMethod) {
                                    this.filteredCartItems[i].orderItems[j].noDeliveryMessage = res.noDeliveryMessage;
                                    this.filteredCartItems[i].orderItems[j].noDeliveryMethod = true;
                                }
                                else {
                                    this.filteredCartItems[i].noDeliveryMessage = res.noDeliveryMessage;
                                    this.filteredCartItems[i].noDeliveryMethod = true;
                                }
                            }
                            else {
                                if (this.filteredCartItems[i].differentShippingMethod) {
                                    this.filteredCartItems[i].orderItems[j].deliveryTiers = res.deliveryMethods;
                                    this.filteredCartItems[i].orderItems[j].locationFee = locationFee;
                                }
                                else {
                                    this.filteredCartItems[i].deliveryTiers = res.deliveryMethods;
                                    this.filteredCartItems[i].locationFee = locationFee;
                                }
                            }
                        }
                    }
                }
                if (this.filteredCartItems.length == resShippingResponse.length) {
                    this.questionPopUps = [];
                    document.getElementsByClassName("mobile_chat")[0].children[1].classList.remove("height75");
                    document.getElementsByClassName("mobile_chat")[0].children[1].classList.add("d-none");
                    document.getElementsByClassName("quepopupmoreless")[0].classList.add("d-none");
                    this.questionPopUps.push(new QuestionPopUp(this.getCardsDetails, 'cards'))
                    this.conversations.push(new Conversation(MsgDirection.Out, address));
                    console.log(this.conversations)
                    this.conversations.push(new Conversation(MsgDirection.In, 'What card do you want to pay with?'))
                    this.getTax(address, resShippingResponse);
                }
            }, (err) => {
                console.log(err)
                this.loader_shippingMethod = false;
            });
        }
    }

    getTax(address, toAddress) {
        let date = new Date();
        this.avalaraTaxModel = new AvalaraTaxModel();
        this.avalaraTaxModel.shipToAddress = new shippingAddress();
        this.avalaraTaxModel.itemTax = new ItemsTaxModel();
        this.avalaraTaxModel.deliveryLocation = address.state;
        this.avalaraTaxModel.shipToAddress.addressLine1 = address.addressLine1;
        this.avalaraTaxModel.shipToAddress.addressLine2 = address.addressLine2;
        this.avalaraTaxModel.shipToAddress.city = address.city;
        this.avalaraTaxModel.shipToAddress.state = address.state;
        this.avalaraTaxModel.shipToAddress.zipcode = address.zipcode;
        this.avalaraTaxModel.date = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate();
        this.avalaraTaxModel.customerCode = this.getUserInfo.userId;
        let number = 0;
        for (var i = 0; i < this.filteredCartItems.length; i++) {
            let item = this.filteredCartItems[i];
            this.avalaraTaxModel.itemTax[item.retailerId] == undefined? this.avalaraTaxModel.itemTax[item.retailerId]= new Array<ItemsTaxList>():{};
            for (var j = 0; j < this.filteredCartItems[i].orderItems.length; j++) {
                let order = this.filteredCartItems[i].orderItems[j]
                this.avalaraTaxModel.itemTax[item.retailerId].push(new ItemsTaxList(number++, order.quantity, order.quantity * order.price, order.productId, order.taxCode, "", "", "", order.shipProfileId))
            }
        }
        for (var i = 0; i < toAddress.length; i++) {
            for (var keys in this.avalaraTaxModel.itemTax) {
                for (var j = 0; j < this.avalaraTaxModel.itemTax[keys].length; j++) {
                    let key = this.avalaraTaxModel.itemTax[keys][j];
                    if (toAddress[i].shippingProfileId == key.shippingProfileId) {
                        key.shippingOriginAddress = new shippingAddress();
                        key.shippingOriginAddress = toAddress[i].shippingOriginAddress;
                    }
                }
            }
        }
        console.log(this.avalaraTaxModel);
        for (var i = 0; i < this.itemsInCart.length; i++) {
            let items = this.itemsInCart[i];
            items["productTaxCost"] = 0;
        }
        this.checkout.getTax(this.avalaraTaxModel).subscribe((res) => {
            this.loader_productTax = false;




            // if(res.invalidAddress == true)
            // {
            //      this.conversations.push(new Conversation(MsgDirection.In, "The shipping address you selected is not valid. Please update your address to check out."));
            //     setTimeout(() => {
            //         this.router.navigateByUrl('/myaccount');
            //     }, 2000);
            // }
            res.id != undefined? this.avalaraId = res.id: {};
            if (res.status !== 'Non taxable product') {
                this.totalProductTax = res.totalTax;
                if(res.lines != null)
                {
                    for (var i = 0; i < res.lines.length; i++) {
                        let line = res.lines[i];
                        for (var j = 0; j < this.itemsInCart.length; j++) {
                            let items = this.itemsInCart[j];
                            if (line.itemCode == items.productId) {
                                items["productTaxCost"] = line.taxCalculated;
                            }
                        }
                    }
                }
            }
            else {
                for (var j = 0; j < this.itemsInCart.length; j++) {
                    let items = this.itemsInCart[j];
                    items["productTaxCost"] = 0;
                    this.totalProductTax = 0;
                }
            }
        }, (err) => {
            this.loader_productTax = false;
            console.log(err);
        })
    }

    async onSubmitAddCard(form: NgForm) {
        if (this.getUserInfo === undefined) this.error = "Please login to add new card";
        else if(this.addPaymentCard.controls.creditCard.value==""||this.addPaymentCard.controls.expirationDate.value==""||this.addPaymentCard.controls.cvc.value==""||this.addPaymentCard.controls.cardZipcode.value=="")
        {
            this.error = 'Please complete all fields.';
        }
        else if (!this.addPaymentCard.valid) {
            if (!this.addPaymentCard.touched) this.error = 'Please complete all fields.';
            else {
                if (!this.addPaymentCard.controls.creditCard.valid) this.error = 'Invalid Card Number';
                else if (!this.addPaymentCard.controls.expirationDate.valid) this.error = 'Invalid Expiration Date';
                else if (!this.addPaymentCard.controls.cvc.valid) this.error = 'Invalid CVC';
                else this.error = 'Invalid Zipcode';
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
                            this.checkout.addCard(this.stripeAddCard).subscribe((res) => {
                            this.loader_addCard = false;
                            if(res && res.message != null && res.source == null)
                            {
                            this.error = res.message;
                            }
                            else
                            {
                            this.sendLatestAddedCard = true;
                            this.error = "Card added successfully.";
                            }
                            setTimeout(() => {
                                this.refreshCardPopup = true;
                                this.resetAddCard();
                                this.getCards();
                                this.questionPopUps =[];
                                this.questionPopUps.push(new QuestionPopUp(this.getCardsDetails, 'cards'))
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

    async onSubmitGuestCard(form: NgForm) {
        if (this.getUserInfo === undefined) this.error = "Please login to add new card";
        else if(this.addPaymentCard.controls.creditCard.value==""||this.addPaymentCard.controls.expirationDate.value==""||this.addPaymentCard.controls.cvc.value==""||this.addPaymentCard.controls.cardZipcode.value=="")
        {
            this.error = 'Please complete all fields.';
        }
        else if (!this.addPaymentCard.valid) {
            if (!this.addPaymentCard.touched) this.error = 'Please complete all fields.';
            else {
                if (!this.addPaymentCard.controls.creditCard.valid) this.error = 'Invalid Card Number';
                else if (!this.addPaymentCard.controls.expirationDate.valid) this.error = 'Invalid Expiration Date';
                else if (!this.addPaymentCard.controls.cvc.valid) this.error = 'Invalid CVC';
                else this.error = 'Invalid Zipcode';
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
                        // this.stripeAddCard.userId = this.getUserInfo.userId;
                        this.stripeAddCard.customer.customerId = this.customerId;
                        
                        
                           
                            
                              this.resetGuestCard();
                                
                                this.questionPopUps =[];
                                this.questionPopUps.push(new QuestionPopUp(this.getCardsDetails, 'cards'))
                            this.sendLatestAddedCard = true;
                              this.getCardsDetails =[];
                              document.getElementsByClassName("mobile_chat")[0].classList.remove("d-none");
                              document.getElementsByClassName("CUIpopup")[0].classList.remove("pop_overlay");
                              this.selectedCardDetails = new GetCustomerCards(this.user.email, this.customerId, res.card.last4, res.card.brand, res.card.funding, res.id, res.card.name);
                              this.getCardsDetails.push(this.selectedCardDetails);

                              console.log(this.getCardsDetails)

                              this.validateGuestBillingAddress()
                      
                              this.loader_addCard = false;
                            //   this.validateBillingAddress();
                            
                           
                        
                    }),
                    (err) => this.zone.run(() => {
                        this.loader_addCard = false;
                        this.error = 'Failed to add card.'
                        console.log("Failed");
                    }))
            });
        }
    }

    validateGuestBillingAddress()
{
  this.myAccount.validateGuestAddress(new CheckoutShippingAddress(null, this.billngAddressForm.controls.addAddressLineOne.value,  this.billngAddressForm.controls.addAddressLineTwo.value, this.billngAddressForm.controls.addCity.value, this.billngAddressForm.controls.addState.value, this.billngAddressForm.controls.addZipcode.value.toString(), 'billingAddress')).subscribe((resp) => {
    console.log(resp);
    if(resp.messages ==undefined)
    {
      this.myAccount.getLocation(this.billngAddressForm.controls.addZipcode.value.toString())
      .subscribe(data => {
        if(data.results.length != 0)
        {
          this.fetchValidGeoCode = data.results[0].formatted_address;
          let postLocales = data.results[0].postcode_localities;
              let validState ='';
              if(this.fetchValidGeoCode.split(',').length>=2) validState = this.fetchValidGeoCode.split(',')[this.fetchValidGeoCode.split(',').length-2].trim().split(" ")[0];
              let validCity ='';
              if(this.fetchValidGeoCode.split(',').length>=3) validCity = this.fetchValidGeoCode.split(',')[this.fetchValidGeoCode.split(',').length-3].trim();
            
              
              if(postLocales !=undefined && validCity.toLowerCase() != this.billngAddressForm.controls.addCity.value.trimLeft(' ').trimRight(' ').toLowerCase() )
              {
                let item = postLocales.find(i=>i.toLowerCase()==this.billngAddressForm.controls.addCity.value.trimLeft(' ').trimRight(' ').toLowerCase());
                if(item != undefined)
                {
                  validCity = item.toLowerCase();
                }
              }
              let cityExists = false;
              if(validCity !=this.billngAddressForm.controls.addCity.value.trimRight().trimLeft().toLowerCase())
              {
                let cityArr =validCity!=undefined? validCity.split(' '):[];
                let objCityArr = this.billngAddressForm.controls.addCity.value.trimLeft().trimRight().split(' ');
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
              if((this.billngAddressForm.controls.addCity.value.trimLeft(' ').trimRight(' ').toString().toLowerCase() == validCity.toLowerCase() || cityExists) && validCity!='' && validState !='' && validState.toLowerCase() ==this.billngAddressForm.controls.addState.value.toString().trimLeft(' ').trimRight(' ').toLowerCase())
              {
                this.shippingAddressCheckout.push(new CheckoutShippingAddress(null, this.billngAddressForm.controls.addAddressLineOne.value, this.billngAddressForm.controls.addAddressLineTwo.value, this.billngAddressForm.controls.addCity.value, this.billngAddressForm.controls.addState.value, this.billngAddressForm.controls.addZipcode.value, 'billingAddress'))
                this.AddressSaveModel.emailId = this.user.email;
                //this.AddressSaveModel.userId = this.userData.userId;
                this.AddressSaveModel.address = this.shippingAddressCheckout;
                this.addBillingAddressFormWrapper = false;
                // this.switchPages="GuestPage3"
                // this.route.navigateByUrl('/guest-checkout-shipping');
                this.selectPayCard(this.getCardsDetails[this.getCardsDetails.length - 1]);
                window.localStorage['Guest-CardInfo'] = JSON.stringify(this.selectedCardDetails);
                window.localStorage['Guest-UserInfo'] = JSON.stringify(this.user);
                window.localStorage['Guest-BillingInfo'] = JSON.stringify(new CheckoutShippingAddress(null, 
                  this.addShippingAddressForm.controls.addAddressLineOne.value, this.addShippingAddressForm.controls.addAddressLineTwo.value, 
                  this.addShippingAddressForm.controls.addCity.value, this.addShippingAddressForm.controls.addState.value, 
                  this.addShippingAddressForm.controls.addZipcode.value, 'shippingAddress', this.addShippingAddressForm.controls.appendAdddefaultShipping.value));
                // this.checkout.addEditShippingAddress(this.AddressSaveModel).subscribe((res) => {
                //   window.localStorage['userInfo'] = JSON.stringify(res);
                //   this.AddressSaveModel.address = res.address;
                // }, (err) => {
                //   console.log(err);
                // });
              }
              else
              {
                this.core.openModal(this.invalidBillingAddressModel);
                return;
              }
        }
        else
        {
          this.core.openModal(this.invalidBillingAddressModel);
          return;
        }
  });
}
else{
  this.core.openModal(this.invalidBillingAddressModel);
  return;
}
});
}

    resetGuestCard() {
        this.addCard = false;
        this.error = null;
        this.ngOnDestroy();
        //this.ngAfterViewInit();
      }

    addNewCard() {
        this.addCard = !this.addCard;
        if (this.addCard) {
            document.getElementsByClassName("mobile_chat")[0].classList.add("d-none");
            document.getElementsByClassName("CUIpopup")[0].classList.add("pop_overlay");
            this.ngAfterViewInit();
        }
        else this.resetAddCard();
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

    resetAddCard() {
        document.getElementsByClassName("mobile_chat")[0].classList.remove("d-none");
        document.getElementsByClassName("CUIpopup")[0].classList.remove("pop_overlay");
        this.addCard = false;
        this.error = null;
        this.ngAfterViewInit();
    }

    updateCard(stripeAddCard) {
        this.checkout.updateCard(stripeAddCard).subscribe((res) => {
            this.loader = false;
            if(res && res.message != null && res.source == null)
            {
                this.error = res.message;
            }
            else
            {
                this.error = "Card added successfully.";
            }
            setTimeout(() => {
                this.refreshCardPopup = true;
                this.resetAddCard();
                this.getCards();
            }, 5000);
        });
    }

    

    ngAfterViewInit() {
        
          if (this.cardNumber != undefined) {
            this.cardNumber.addEventListener('change', ({ brand }) => {
              if (brand) {
                this.setBrandIcon(brand);
              }
            });
          }
        this.loader_addCard = false;
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
    }

    setBrandIcon(brand) {
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
      }

    ngOnDestroy() {
        this.checkallitemDelMethsAreselected  = false;
        if (this.cardNumber != undefined) {
            this.cardNumber.destroy();
            this.cardExpiry.destroy();
            this.cardZip.destroy();
            this.cardCvc.destroy();
            this.cardNumber = undefined;
          }
    }

    addAddress() {
        this.addShippingAddressFormWrapper = !this.addShippingAddressFormWrapper;
        if (this.addShippingAddressFormWrapper) {
            this.getAllStates();
            this.editShippingAddressFormWrapper = false;
            this.addShippingAddressFormWrapper = true;
            this.addShippingAddressForm = this.formBuilder.group({
                addAddressLineOne: ['', Validators.required],
                addAddressLineTwo: [''],
                addCity: ['', Validators.required],
                addState: ['', Validators.required],
                addZipcode: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(5), Validators.pattern(regexPatterns.zipcodeRegex)]],
                appendAdddefaultShipping: ['']
            });
        }
    }

    editAddress(address) {
        this.getAllStates();
        this.editShippingAddressFormWrapper = true;
        this.addShippingAddressFormWrapper = false;
        this.editShippingAddressForm = this.formBuilder.group({
            editAddressLineOne: [address.addressLine1, Validators.required],
            editAddressLineTwo: [address.addressLine2],
            editCity: [address.city, Validators.required],
            editState: [address.state, Validators.required],
            editZipcode: [address.zipcode, [Validators.required, Validators.minLength(5), Validators.maxLength(5), Validators.pattern(regexPatterns.zipcodeRegex)]]
        });
        this.addressFormData = address;
    }

    

    addGuestAddress(addressForm, toDo) :any {
        console.log('guest')
        return new Promise(async (respo, rej)  => {
        this.addEditInvalidZipCode = false;
        if(toDo == 'add') {
          this.myAccount.validateGuestAddress(new CheckoutShippingAddress(null, this.addShippingAddressForm.controls.addAddressLineOne.value,  this.addShippingAddressForm.controls.addAddressLineTwo.value, this.addShippingAddressForm.controls.addCity.value,this.addShippingAddressForm.controls.addState.value, this.addShippingAddressForm.controls.addZipcode.value.toString(), 'shippingAddress')).subscribe((resp) => {
            console.log(resp);
            if(resp.messages ==undefined)
            {
              this.myAccount.getLocation(this.addShippingAddressForm.controls.addZipcode.value.toString())
              .subscribe(data => {
                if(data.results.length != 0)
                {
                  this.fetchValidGeoCode = data.results[0].formatted_address;
                  let postLocales = data.results[0].postcode_localities;
                      let validState ='';
                      if(this.fetchValidGeoCode.split(',').length>=2) validState = this.fetchValidGeoCode.split(',')[this.fetchValidGeoCode.split(',').length-2].trim().split(" ")[0];
                      let validCity ='';
                      if(this.fetchValidGeoCode.split(',').length>=3) validCity = this.fetchValidGeoCode.split(',')[this.fetchValidGeoCode.split(',').length-3].trim();
                    
                      
                      if(postLocales !=undefined && validCity.toLowerCase() != this.addShippingAddressForm.controls.addCity.value.trimLeft(' ').trimRight(' ').toLowerCase() )
                      {
                        let item = postLocales.find(i=>i.toLowerCase()==this.addShippingAddressForm.controls.addCity.value.trimLeft(' ').trimRight(' ').toLowerCase());
                        if(item != undefined)
                        {
                          validCity = item.toLowerCase();
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
                      if((this.addShippingAddressForm.controls.addCity.value.trimLeft(' ').trimRight(' ').toString().toLowerCase() == validCity.toLowerCase() || cityExists) && validCity!='' && validState !='' && validState.toLowerCase() == this.addShippingAddressForm.controls.addState.value.toString().trimLeft(' ').trimRight(' ').toLowerCase())
                      {

                       
                          
                        this.shippingAddressCheckout.push(new CheckoutShippingAddress(null, this.addShippingAddressForm.controls.addAddressLineOne.value, this.addShippingAddressForm.controls.addAddressLineTwo.value, this.addShippingAddressForm.controls.addCity.value, this.addShippingAddressForm.controls.addState.value, this.addShippingAddressForm.controls.addZipcode.value, 'shippingAddress'))
                        // this.AddressSaveModel.emailId = this.user.email;
                        //this.AddressSaveModel.userId = this.userData.userId;
                        this.AddressSaveModel.address = this.shippingAddressCheckout;
                        this.addShippingAddressFormWrapper = false;
    
                        this.selectGuestShippingAddress({},this.shippingAddressCheckout[this.shippingAddressCheckout.length-1]);
                        // this.checkout.addEditShippingAddress(this.AddressSaveModel).subscribe((res) => {
                        //   window.localStorage['userInfo'] = JSON.stringify(res);
                        //   this.AddressSaveModel.address = res.address;
                        // }, (err) => {
                        //   console.log(err);
                        // });

                       
                        
                
                       
                       
                        // if(!this.sameAsShipAddress)
                        // {
                        //   this.validateBillingAddress();
                        // }
                        // this.switchPages="GuestPage2"
                        window.localStorage['Guest-UserInfo'] = JSON.stringify(this.user);
                        window.localStorage['Guest-ShippingInfo'] = JSON.stringify(new CheckoutShippingAddress(null, this.addShippingAddressForm.controls.addAddressLineOne.value, this.addShippingAddressForm.controls.addAddressLineTwo.value, this.addShippingAddressForm.controls.addCity.value, this.addShippingAddressForm.controls.addState.value, this.addShippingAddressForm.controls.addZipcode.value, 'shippingAddress'));
                        
                        this.loader_Address = false;
                       
                        this.sameAsShippingAddress(event);
                
                        this.showMoreLessStr = "Show More";
                        this.showaddressQuestPopup = false;
                        this.addShippingAddressFormWrapper = false;
                        document.getElementsByClassName("mobile_chat")[0].children[1].classList.remove("d-none");
                        document.getElementsByClassName("mobile_chat")[0].children[1].classList.add("height75");
                        document.getElementsByClassName("quepopupmoreless")[0].classList.remove("d-none");
                        document.getElementsByClassName("CUIpopup")[0].classList.remove("pop_overlay");
    
                        return true;
                      }
                      else
                      {
                        this.core.openModal(this.invalidAddressModel);
                        return false;
                      }
                }
                else
                {
                  this.core.openModal(this.invalidAddressModel);
                  return false;
                }
          });
        }
        else{
          this.core.openModal(this.invalidAddressModel);
          return false;
        }
        respo();
      });
     
    
      }
      });
    }

    selectGuestShippingAddress(e?, address?) {
        this.loader_shippingMethod = true;
        this.showShippingMethod = false;
        this.finalShippingAmount =0;
        for (var i = 0; i < this.itemsInCart.length; i++) {
          if(this.itemsInCart[i].deliveryMethod != undefined)
          {
            this.itemsInCart[i].deliveryMethod = undefined;
          }
        }
        // let allAddress = document.getElementsByClassName("customerShippingAddress");
        // for (var i = 0; i < allAddress.length; i++) {
        //   if (allAddress[i].classList.contains("categ_outline_red")) {
        //     allAddress[i].classList.remove("categ_outline_red");
        //     allAddress[i].classList.add("categ_outline_gray");
        //   }
        // }
        // let element = e.currentTarget;
        // element.classList.remove("categ_outline_gray");
        // element.classList.add("categ_outline_red");
        if (window.localStorage['Guest-CardInfo'] != undefined) 
        {
          this.selectedCardDetails = JSON.parse(window.localStorage['Guest-CardInfo'])
        }
        this.selectedAddressDetails = address;
        let resShippingResponse = [];
    
       console.log(address)
        for (var i = 0; i < this.filteredCartItems.length; i++) {
          this.orderCheckout = new OrderCheckout();
          let  pproduDimention =  Array<ProduDimention>();
          for (var j = 0; j < this.filteredCartItems[i].orderItems.length; j++) {
            let prodId = this.filteredCartItems[i].orderItems[j].productId;
            let item = this.itemsInCart.find(function(element){
              return element.productId ==prodId
            })
            this.orderCheckout.locationName = address.state;
            this.orderCheckout.shippingProfileId = item.shipProfileId;
            this.produDimention = new ProduDimention();
            this.produDimention.productHeight = item.shippingHeight;
            this.produDimention.productWeight = item.shippingWeight;
            this.produDimention.productLength = item.shippingLength;
            this.produDimention.productQuantity =item.quantity;
            this.produDimention.productPrice = item.price;
            this.produDimention.productWidth = item.shippingWidth;
    
            pproduDimention.push(this.produDimention);
     
          }
          this.orderCheckout.productDimention = pproduDimention;
          this.checkout.getGuestShippingMethodsOnAddress(this.orderCheckout).subscribe((res) => {
            resShippingResponse.push({
              shippingProfileId: res.shippingProfileId,
              shippingOriginAddress: res.shippingOriginAddress
            });
            
               
            
            let locationFee = res.locationFee;
            this.shippingMethod = res.deliveryMethods;
            this.selectedAddressDetails = address;
            this.loader_shippingMethod = false;
            this.showShippingMethod = true;
            this.loader_productTax = true;
            for (var i = 0; i < this.filteredCartItems.length; i++) {
              for (var j = 0; j < this.filteredCartItems[i].orderItems.length; j++) {
                let order = this.filteredCartItems[i].orderItems[j];
                if (order.shipProfileId == res.shippingProfileId) {
                    if (res.noDeliveryMethod) {
                        this.ifNoDeliveryMethod = true;
                        if (this.filteredCartItems[i].differentShippingMethod) {
                            this.filteredCartItems[i].orderItems[j].noDeliveryMessage = res.noDeliveryMessage;
                            this.filteredCartItems[i].orderItems[j].noDeliveryMethod = true;
                        }
                        else {
                            this.filteredCartItems[i].noDeliveryMessage = res.noDeliveryMessage;
                            this.filteredCartItems[i].noDeliveryMethod = true;
                        }
                    }
                    else {
                        if (this.filteredCartItems[i].differentShippingMethod) {
                            this.filteredCartItems[i].orderItems[j].deliveryTiers = res.deliveryMethods;
                            this.filteredCartItems[i].orderItems[j].locationFee = locationFee;
                        }
                        else {
                            this.filteredCartItems[i].deliveryTiers = res.deliveryMethods;
                            this.filteredCartItems[i].locationFee = locationFee;
                        }
                    }
                }
              }
            }
            if (this.filteredCartItems.length == resShippingResponse.length) {
                // this.sameAsShippingAddress(event);
                this.questionPopUps = [];
                document.getElementsByClassName("mobile_chat")[0].children[1].classList.remove("height75");
                document.getElementsByClassName("mobile_chat")[0].children[1].classList.add("d-none");
                document.getElementsByClassName("quepopupmoreless")[0].classList.add("d-none");
                this.questionPopUps.push(new QuestionPopUp(this.getCardsDetails, 'cards'))
                this.conversations.push(new Conversation(MsgDirection.Out, address, 'guest'));
                console.log(this.conversations)
                this.conversations.push(new Conversation(MsgDirection.In, 'Please enter your payment information'))
                this.getGuestTax(address, resShippingResponse);
            }
          }, (err) => {
            console.log(err)
          });
          this.produDimention = new ProduDimention();
       }
    
    
    
    
    
    
    
    
        // for (var i = 0; i < this.itemsInCart.length; i++) {
        //   this.checkout.getShippingMethods(address.state, this.itemsInCart[i].shipProfileId, this.itemsInCart[i].quantity, this.itemsInCart[i].shippingWeight, this.itemsInCart[i].price, this.itemsInCart[i].shippingLength, this.itemsInCart[i].shippingHeight, this.itemsInCart[i].shippingWidth).subscribe((res) => {
        //     resShippingResponse.push({
        //       shippingProfileId: res.shippingProfileId,
        //       shippingOriginAddress: res.shippingOriginAddress
        //     });
        //     let locationFee = res.locationFee;
        //     this.shippingMethod = res.deliveryMethods;
        //     this.loader_shippingMethod = false;
        //     this.showShippingMethod = true;
        //     this.loader_productTax = true;
        //     for (var i = 0; i < this.filteredCartItems.length; i++) {
        //       for (var j = 0; j < this.filteredCartItems[i].orderItems.length; j++) {
        //         let order = this.filteredCartItems[i].orderItems[j];
        //         if (order.shipProfileId == res.shippingProfileId) {
        //           if (res.noDeliveryMethod) {
        //             this.ifNoDeliveryMethod = true;
        //             if (this.filteredCartItems[i].differentShippingMethod) {
        //               this.filteredCartItems[i].orderItems[j].noDeliveryMessage = res.noDeliveryMessage;
        //               this.filteredCartItems[i].orderItems[j].noDeliveryMethod = true;
        //             }
        //             else {
        //               this.filteredCartItems[i].noDeliveryMessage = res.noDeliveryMessage;
        //               this.filteredCartItems[i].noDeliveryMethod = true;
        //             }
        //           }
        //           else {
        //             if (this.filteredCartItems[i].differentShippingMethod) {
        //               this.filteredCartItems[i].orderItems[j].deliveryTiers = res.deliveryMethods;
        //               this.filteredCartItems[i].orderItems[j].locationFee = locationFee;
        //             }
        //             else {
        //               this.filteredCartItems[i].deliveryTiers = res.deliveryMethods;
        //               this.filteredCartItems[i].locationFee = locationFee;
        //             }
        //           }
        //         }
        //       }
        //     }
        //     if (this.itemsInCart.length == resShippingResponse.length) {
        //       this.getTax(address, resShippingResponse);
        //     }
        //   }, (err) => {
        //     console.log(err)
        //   });
        // }
        // setTimeout(() => {
        //   this.getTax(address, resShippingResponse);
        // }, 3000)
      }

      getGuestTax(address, toAddress) {
        let date = new Date();
        this.avalaraTaxModel = new AvalaraTaxModel();
        this.avalaraTaxModel.shipToAddress = new shippingAddress();
        this.avalaraTaxModel.itemTax = new ItemsTaxModel();
        this.avalaraTaxModel.deliveryLocation = address.state;
        this.avalaraTaxModel.shipToAddress.addressLine1 = address.addressLine1;
        this.avalaraTaxModel.shipToAddress.addressLine2 = address.addressLine2;
        this.avalaraTaxModel.shipToAddress.city = address.city;
        this.avalaraTaxModel.shipToAddress.state = address.state;
        this.avalaraTaxModel.shipToAddress.zipcode = address.zipcode;
        this.avalaraTaxModel.date = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate();
        this.avalaraTaxModel.customerCode = this.user.email;
        let number = 0;
        for (var i = 0; i < this.filteredCartItems.length; i++) {
          let item = this.filteredCartItems[i];
          this.avalaraTaxModel.itemTax[item.retailerId] == undefined?this.avalaraTaxModel.itemTax[item.retailerId] = new Array<ItemsTaxList>() : {};
          for (var j = 0; j < this.filteredCartItems[i].orderItems.length; j++) {
            let order = this.filteredCartItems[i].orderItems[j]
            this.avalaraTaxModel.itemTax[item.retailerId].push(new ItemsTaxList(number++, order.quantity, order.quantity * order.price, order.productId, order.taxCode, "", "", "", order.shipProfileId))
          }
        }
        for (var i = 0; i < toAddress.length; i++) {
          for (var keys in this.avalaraTaxModel.itemTax) {
            for (var j = 0; j < this.avalaraTaxModel.itemTax[keys].length; j++) {
              let key = this.avalaraTaxModel.itemTax[keys][j];
              if (toAddress[i].shippingProfileId == key.shippingProfileId) {
                key.shippingOriginAddress = new shippingAddress();
                key.shippingOriginAddress = toAddress[i].shippingOriginAddress;
              }
            }
          }
        }
        console.log(this.avalaraTaxModel);
        for (var i = 0; i < this.itemsInCart.length; i++) {
          let items = this.itemsInCart[i];
          items["productTaxCost"] = 0;
        }
        
          this.checkout.getGuestTax(this.avalaraTaxModel).subscribe((res) => {
            this.loader_productTax = false;
            // this.ifInvalidAddress = res.invalidAddress;
            // if(res.invalidAddress == true)
            // {
            //   this.core.openModal(this.invalidAddressModel);
            //   return;
            // }
            res.id != undefined ? this.avalaraId = res.id:{};
            if (res.status !== 'Non taxable product') {
              this.totalProductTax = res.totalTax;
              if(res.lines != null)
                {
                    for (var i = 0; i < res.lines.length; i++) {
                        let line = res.lines[i];
                        for (var j = 0; j < this.itemsInCart.length; j++) {
                            let items = this.itemsInCart[j];
                            if (line.itemCode == items.productId) {
                                items["productTaxCost"] = line.taxCalculated;
                            }
                        }
                    }
                }
            }
            else {
              for (var j = 0; j < this.itemsInCart.length; j++) {
                let items = this.itemsInCart[j];
                items["productTaxCost"] = 0;
                this.totalProductTax = 0;
              }
            }
          }, (err) => {
            this.loader_productTax = false;
            console.log(err);
          })
      }

    //   validateBillingAddress()
    //   {
    //     this.myAccount.validateGuestAddress(new CheckoutShippingAddress(null, this.billngAddressForm.controls.addAddressLineOne.value,  this.billngAddressForm.controls.addAddressLineTwo.value, this.billngAddressForm.controls.addCity.value, this.billngAddressForm.controls.addState.value, this.billngAddressForm.controls.addZipcode.value.toString(), 'billingAddress')).subscribe((resp) => {
    //       console.log(resp);
    //       if(resp.messages ==undefined)
    //       {
    //         this.myAccount.getLocation(this.billngAddressForm.controls.addZipcode.value.toString())
    //         .subscribe(data => {
    //           if(data.results.length != 0)
    //           {
    //             this.fetchValidGeoCode = data.results[0].formatted_address;
    //             let postLocales = data.results[0].postcode_localities;
    //                 let validState ='';
    //                 if(this.fetchValidGeoCode.split(',').length>=2) validState = this.fetchValidGeoCode.split(',')[this.fetchValidGeoCode.split(',').length-2].trim().split(" ")[0];
    //                 let validCity ='';
    //                 if(this.fetchValidGeoCode.split(',').length>=3) validCity = this.fetchValidGeoCode.split(',')[this.fetchValidGeoCode.split(',').length-3].trim();
                  
                    
    //                 if(postLocales !=undefined && validCity.toLowerCase() != this.billngAddressForm.controls.addCity.value.trimLeft(' ').trimRight(' ').toLowerCase() )
    //                 {
    //                   let item = postLocales.find(i=>i.toLowerCase()==this.billngAddressForm.controls.addCity.value.trimLeft(' ').trimRight(' ').toLowerCase());
    //                   if(item != undefined)
    //                   {
    //                     validCity = item.toLowerCase();
    //                   }
    //                 }
    //                 let cityExists = false;
    //                 if(validCity !=this.billngAddressForm.controls.addCity.value.trimRight().trimLeft().toLowerCase())
    //                 {
    //                   let cityArr =validCity!=undefined? validCity.split(' '):[];
    //                   let objCityArr = this.billngAddressForm.controls.addCity.value.trimLeft().trimRight().split(' ');
    //                   if(cityArr.length>1)
    //                   {
    //                     if(objCityArr.length>1)
    //                     {
    //                           if(cityArr[1].toLowerCase() == objCityArr[1].toLowerCase())
    //                           {
    //                             cityExists = true;
    //                           }
                            
    //                     }
    //                   }
    //                 }
    //                 if((this.billngAddressForm.controls.addCity.value.trimLeft(' ').trimRight(' ').toString().toLowerCase() == validCity.toLowerCase() || cityExists) && validCity!='' && validState !='' && validState.toLowerCase() ==this.billngAddressForm.controls.addState.value.toString().trimLeft(' ').trimRight(' ').toLowerCase())
    //                 {
    //                   this.shippingAddressCheckout.push(new CheckoutShippingAddress(null, this.billngAddressForm.controls.addAddressLineOne.value, this.billngAddressForm.controls.addAddressLineTwo.value, this.billngAddressForm.controls.addCity.value, this.billngAddressForm.controls.addState.value, this.billngAddressForm.controls.addZipcode.value, 'billingAddress'))
    //                   this.AddressSaveModel.emailId = this.user.email;
    //                   //this.AddressSaveModel.userId = this.userData.userId;
    //                   this.AddressSaveModel.address = this.shippingAddressCheckout;
    //                   this.addBillingAddressFormWrapper = false;
    //                 //   this.switchPages="GuestPage3"
      
    //                   // this.checkout.addEditShippingAddress(this.AddressSaveModel).subscribe((res) => {
    //                   //   window.localStorage['userInfo'] = JSON.stringify(res);
    //                   //   this.AddressSaveModel.address = res.address;
    //                   // }, (err) => {
    //                   //   console.log(err);
    //                   // });
    //                 }
    //                 else
    //                 {
    //                   this.core.openModal(this.invalidBillingAddressModel);
    //                   return;
    //                 }
    //           }
    //           else
    //           {
    //             this.core.openModal(this.invalidBillingAddressModel);
    //             return;
    //           }
    //     });
    //   }
    //   else{
    //     this.core.openModal(this.invalidBillingAddressModel);
    //     return;
    //   }
    //   });
    //   }

sameAsShippingAddress(e:any)
{
  if(window.localStorage['Guest-ShippingInfo'] != undefined)
  {
    this.billingAddressFromAddressPage = JSON.parse(window.localStorage['Guest-ShippingInfo']);
  } 
  if(window.localStorage['Guest-UserInfo'] != undefined)
  {
    this.user = JSON.parse(window.localStorage['Guest-UserInfo']);
  }
  
    this.sameAsShipAddress = true;
    this.billingAddressSaveModel = this.AddressSaveModel;
    this.billngAddressForm.controls['fullname'].setValue(this.user.username);
    this.billngAddressForm.controls['addAddressLineOne'].setValue(this.billingAddressFromAddressPage.addressLine1);
    this.billngAddressForm.controls['addAddressLineTwo'].setValue(this.billingAddressFromAddressPage.addressLine2);
    this.billngAddressForm.controls['addCity'].setValue(this.billingAddressFromAddressPage.city);
    this.billngAddressForm.controls['addState'].setValue(this.billingAddressFromAddressPage.state);
    this.billngAddressForm.controls['addZipcode'].setValue(this.billingAddressFromAddressPage.zipcode);
  

  
  // if(this.sameAsShipAddress)
  // {
  //   this.billingAddressSaveModel = this.AddressSaveModel;
  //   this.billngAddressForm.controls['fullname'].setValue(this.addShippingAddressForm.controls.fullname.value);
  //   this.billngAddressForm.controls['addAddressLineOne'].setValue(this.addShippingAddressForm.controls.addAddressLineOne.value);
  //   this.billngAddressForm.controls['addAddressLineTwo'].setValue(this.addShippingAddressForm.controls.addAddressLineTwo.value);
  //   this.billngAddressForm.controls['addCity'].setValue(this.addShippingAddressForm.controls.addCity.value);
  //   this.billngAddressForm.controls['addState'].setValue(this.addShippingAddressForm.controls.addState.value);
  //   this.billngAddressForm.controls['addZipcode'].setValue(this.addShippingAddressForm.controls.addZipcode.value);
  // }
  // else
  // {
  //   this.billingAddressSaveModel = new MyAccountAddressModel();
  // }
}

    addEditSave(addressForm, toDo) {
        if (toDo == 'edit') {
                    this.myAccount.validateAddress(new MyAccountAddress(null,  this.editShippingAddressForm.controls.editaddressLineOne.value, this.editShippingAddressForm.controls.editaddressLineTwo.value, this.editShippingAddressForm.controls.editCity.value, this.editShippingAddressForm.controls.editStates.value, this.editShippingAddressForm.controls.editZipcode.value.toString(), 'shippingAddress')).subscribe((resp) => {
                        console.log(resp);
                        if(resp.messages ==undefined)
                        {
                               
                
                this.myAccount.getLocation(this.editShippingAddressForm.controls.editZipcode.value)
                          .subscribe(data => {
                            if(data.results.length != 0)
                            {
                            this.fetchGeoCode = data.results[0].formatted_address;
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
                                    for (var i = 0; i < this.shippingAddressCheckout.length; i++) {
                                        if (this.shippingAddressCheckout[i].addID == this.addressFormData.addID) {
                                            this.shippingAddressCheckout[i].addressLine1 = this.editShippingAddressForm.controls.editAddressLineOne.value;
                                            this.shippingAddressCheckout[i].addressLine2 = this.editShippingAddressForm.controls.editAddressLineTwo.value;
                                            this.shippingAddressCheckout[i].city = this.editShippingAddressForm.controls.editCity.value;
                                            this.shippingAddressCheckout[i].state = this.editShippingAddressForm.controls.editState.value;
                                            this.shippingAddressCheckout[i].zipcode = this.editShippingAddressForm.controls.editZipcode.value;
                                        }
                                    }
                                    this.AddressSaveModel.emailId = this.getUserInfo.emailId;
                                    this.AddressSaveModel.userId = this.getUserInfo.userId;

                                    this.AddressSaveModel.address = this.shippingAddressCheckout;
                                    this.editShippingAddressFormWrapper = false;
                                    this.checkout.addEditShippingAddress(this.AddressSaveModel).subscribe((res) => {
                                        window.localStorage['userInfo'] = JSON.stringify(res);
                                        this.addressFormData.addressLine1 = this.editShippingAddressForm.controls.editAddressLineOne.value;
                                        this.addressFormData.addressLine2 = this.editShippingAddressForm.controls.editAddressLineTwo.value;
                                        this.addressFormData.city = this.editShippingAddressForm.controls.editCity.value;
                                        this.addressFormData.state = this.editShippingAddressForm.controls.editState.value;
                                        this.addressFormData.zipcode = this.editShippingAddressForm.controls.editZipcode.value;
                                    }, (err) => {
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
                   
                });
        }
        else {
            this.myAccount.validateAddress(new MyAccountAddress(null,  this.addShippingAddressForm.controls.addAddressLineOne.value, this.addShippingAddressForm.controls.addAddressLineTwo.value, this.addShippingAddressForm.controls.addCity.value, this.addShippingAddressForm.controls.addState.value, this.addShippingAddressForm.controls.addZipcode.value.toString(), 'shippingAddress')).subscribe((resp) => {
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
                          if((this.addShippingAddressForm.controls.addCity.value.trimLeft().trimRight().toLowerCase() == validCity || cityExists) && validCity!='' && validState !='' && validState == this.addShippingAddressForm.controls.addState.value.trimLeft(' ').trimRight(' ').toLowerCase())
                          {
            this.loader_Address = true;
            if(this.addShippingAddressForm.controls.appendAdddefaultShipping)
                      {
                        for (let i = 0; i < this.shippingAddressCheckout.length; i++) {
                          let address = this.shippingAddressCheckout[i];
                          if (address.addressType == 'shippingAddress' ) {
                            address.defaultAddress = false;
                          }
                        }
                      }
            this.shippingAddressCheckout.push(new CheckoutShippingAddress(null, this.addShippingAddressForm.controls.addAddressLineOne.value, this.addShippingAddressForm.controls.addAddressLineTwo.value, this.addShippingAddressForm.controls.addCity.value, this.addShippingAddressForm.controls.addState.value, this.addShippingAddressForm.controls.addZipcode.value, 'shippingAddress', this.addShippingAddressForm.controls.appendAdddefaultShipping.value))
            this.AddressSaveModel.emailId = this.getUserInfo.emailId;
            this.AddressSaveModel.userId = this.getUserInfo.userId;
            this.AddressSaveModel.address = this.shippingAddressCheckout;
            this.showAddressBool = true;
            this.checkout.addEditShippingAddress(this.AddressSaveModel).subscribe((res) => {
                this.loader_Address = false;
                
                this.selectShippingAddress(Event, res.address[res.address.length - 1]);
                window.localStorage['userInfo'] = JSON.stringify(res);
                this.shippingAddressCheckout = [];
                for (var i = 0; i < res.address.length; i++) {
                    let address = res.address[i];
                    if (address.addressType === 'shippingAddress') {
                        this.shippingAddressCheckout.push(new CheckoutShippingAddress(address.addID, address.addressLine1, address.addressLine2, address.city, address.state, address.zipcode, address.addressType, address.defaultAddress));
                        
                    }
                }
                this.shippingAddressCheckout = res.address.sort(function(a, b) {
                    return b.defaultAddress - a.defaultAddress;
                  });
                this.showMoreLessStr = "Show More";
                this.showaddressQuestPopup = false;
                this.addShippingAddressFormWrapper = false;
                document.getElementsByClassName("mobile_chat")[0].children[1].classList.remove("d-none");
                document.getElementsByClassName("mobile_chat")[0].children[1].classList.add("height75");
                document.getElementsByClassName("quepopupmoreless")[0].classList.remove("d-none");
                document.getElementsByClassName("CUIpopup")[0].classList.remove("pop_overlay");
            }, (err) => {
                console.log(err);
            });
        }
    }
    else
    {
        //this.addEditInvalidZipCode =true;
        this.core.openModal(this.invalidAddressModel);
        return;
    }
});
}
else
{
    //this.addEditInvalidZipCode =true;
    this.core.openModal(this.invalidAddressModel);
    return;
}
});
}
    }

    cancelAddress(address, toDo) {
        if (toDo == 'edit') this.editShippingAddressForm.reset();
        else this.addShippingAddressForm.reset();
        this.editShippingAddressFormWrapper = false;
        this.addShippingAddressFormWrapper = false;
        this.showaddressQuestPopup = false;
        document.getElementsByClassName("mobile_chat")[0].children[1].classList.remove("d-none");
        document.getElementsByClassName("mobile_chat")[0].children[1].classList.add("height75");
        document.getElementsByClassName("quepopupmoreless")[0].classList.remove("d-none");
        document.getElementsByClassName("CUIpopup")[0].classList.remove("pop_overlay");
        this.showMoreLessStr = "Show More";
        this.loadShippingAddress();
    }

    onChange({ error }) {
        if (error) {
            this.error = error.message;
        } else {
            this.error = null;
        }
        this.cd.detectChanges();
    }

    getAllStates() {
        
        if (this.getStates == undefined) {
            if(window.localStorage['existingItemsInGuestCart'] != undefined){
                this.checkout.getAllGuestStates().subscribe((res) => {
                    this.getStates = res.stateAbbreviation;
                })
            }
        else{
            this.checkout.getAllStates().subscribe((res) => {
                this.getStates = res.stateAbbreviation;
            })
        }
            
        }
    }
    showOnly4Options: boolean = true;
    ShowMoreLess() {
        let spanPopupMoreLess = document.getElementsByClassName("mobile_content")[0];
        if (this.showMoreLessStr == "Show More") {
            document.getElementsByClassName("mobile_chat")[0].children[1].classList.remove("height75");
            this.showMoreLessStr = "Show Less";
            this.showOnly4Options = false;
        }
        else {
            document.getElementsByClassName("mobile_chat")[0].children[1].classList.add("height75");
            this.showMoreLessStr = "Show More";
            this.showOnly4Options = true;
        }
        this.deleteNoPreferenceFeature();
    }

    getPlaces() {
        this.ng4LoadingSpinnerService.show();
        this.userResponse.place = [];
        this.questionPopUps = [];
        this.conversations.push(new Conversation(MsgDirection.In, "select a place"));
        this.homeService.getTilesPlace().subscribe(res => {
            this.ng4LoadingSpinnerService.hide();
            for (var i = 0; i < res.length; i++) this.userResponse.place.push(new SearchDataModal(res[i].placeId, res[i].placeName, res[i].placeName, "1", ""));
            this.showAvailablePlaces = true;
            let data = { levelName: null, levelId: null, levelCount: 1 };
            this.checkProductAvailability(data, 'place');
            this.showMoreLessStr = "Show Less";
            setTimeout(() => this.ShowMoreLess(), 50);
        })
    };

    getCategory(place) {
        this.showAvailablePlaces = false;
        this.ng4LoadingSpinnerService.show();
        this.userResponse.category = [];
        this.questionPopUps = [];
        this.gSCM.placeName = place.text;
        this.gSCM.placeId = place.id;
        this.gSCMRequestModal.placeName = place.text;
        this.gSCMRequestModal.placeId = place.id;
        this.conversations.push(new Conversation(MsgDirection.Out, place.text));
        this.conversations.push(new Conversation(MsgDirection.In, "select a category"));
        this.Step1SelectedValues.place = place;
        this.Step1SelectedValues.placeId = place.id;
        this.homeService.getTilesCategory(place.id).subscribe(res => {
            this.ng4LoadingSpinnerService.hide();
            for (var i = 0; i < res.length; i++) this.userResponse.category.push(new SearchDataModal(res[i].categoryId, res[i].categoryName, res[i].categoryName, "2", ""));
            this.showAvailableCategory = true;
            let data = { levelName: place.name, levelId: place.id, levelCount: 2 };
            this.checkProductAvailability(data, 'category');
            this.showMoreLessStr = "Show Less";
            setTimeout(() => this.ShowMoreLess(), 50);
        });
    };

    getOffersCategory(place) {
        this.showAvailablePlaces = false;
        this.ng4LoadingSpinnerService.show();
        this.userResponse.category = [];
        this.questionPopUps = [];
        this.gSCM.placeName = place.text;
        this.gSCM.placeId = place.id;
        this.gSCMRequestModal.placeName = place.text;
        this.gSCMRequestModal.placeId = place.id;
        this.conversations.push(new Conversation(MsgDirection.In, "select a category"));
        this.Step1SelectedValues.place = place;
        this.Step1SelectedValues.placeId = place.id;
        this.homeService.getTilesCategory(place.id).subscribe(res => {
            this.ng4LoadingSpinnerService.hide();
            for (var i = 0; i < res.length; i++) this.userResponse.category.push(new SearchDataModal(res[i].categoryId, res[i].categoryName, res[i].categoryName, "2", ""));
            this.showAvailableCategory = true;
            let data = { levelName: place.name, levelId: place.id, levelCount: 2 };
            this.checkProductAvailability(data, 'category');
            this.showMoreLessStr = "Show Less";
            setTimeout(() => this.ShowMoreLess(), 50);
        });
    };

    getSubCategory(category?: any) {
        if (category != undefined) {
            this.getCategoryId = category.id;
            this.conversations.push(new Conversation(MsgDirection.Out, category.text));
            this.conversations.push(new Conversation(MsgDirection.In, "select a product sub category"));
            this.gSCM.categoryName = category.text;
            this.gSCM.categoryId = category.id;
            this.gSCMRequestModal.categoryName = category.text;
            this.gSCMRequestModal.categoryId = category.id;
            this.Step1SelectedValues.category = category;
            this.Step1SelectedValues.categoryId = category.id;
        }
        this.showAvailableCategory = false;
        this.userResponse.subcategory = [];
        this.homeService.getTilesSubCategory(this.getCategoryId).subscribe(res => {
            for (var i = 0; i < res.length; i++) this.userResponse.subcategory.push(new SearchDataModal(res[i].subCategoryId, res[i].subCategoryName, res[i].subCategoryName, "3", ""));
            this.showAvailablesubcat = true;
            let data;
            if (category != undefined) data = { levelName: category.name, levelId: category.id, levelCount: 3 };
            else {
                let category = JSON.parse(window.localStorage['levelSelections']).category;
                data = { levelName: category.name, levelId: category.id, levelCount: 3 };
            }
            this.checkProductAvailability(data, 'subcategory');
        });
    };

    async checkProductAvailability(data, from?: any) {
        var response = await this.homeService.checkProductAvailability(data);
        if (from == 'place') response = response.filter(item => item.level = 1);
        else if (from == 'category') response = response.filter(item => item.level = 2);
        else response = response.filter(item => item.level = 3);
        this.modifyData(response, from);
    }

    modifyData(response, from) {
        for (let i = 0; i < response.length; i++) {
            if (from == 'place') {
                for (let j = 0; j < this.userResponse.place.length; j++) {
                    if (response[i].name == this.userResponse.place[j].name) {
                        this.userResponse.place[j].isProductAvailable = true;
                    }
                }
            }
            else if (from == 'category') {
                for (let j = 0; j < this.userResponse.category.length; j++) {
                    if (response[i].name == this.userResponse.category[j].name) {
                        this.userResponse.category[j].isProductAvailable = true;
                    }
                }
            }
            else {
                for (let j = 0; j < this.userResponse.subcategory.length; j++) {
                    if (response[i].name == this.userResponse.subcategory[j].name) {
                        this.userResponse.subcategory[j].isProductAvailable = true;
                    }
                }
            }
        }
    }

    showMoreOrMultipleType: boolean;
    getObjectFromOrderNoLevel1(res) {
        if (res.products && res.products.length == 0) {
            this.conversations.push(new Conversation(MsgDirection.In, 'Sorry, but we don’t have any offer matches for you. Please check back soon, as we’re always adding new products.'));
            return false;
        }
        let data; let keyword; let selection;
        let resultObject = search("1", res.attributes_orders.attributes_metadata);
        function search(nameKey, myArray) {
            for (var key in myArray) {
                if (myArray[key].order === nameKey) {
                    data = myArray[key];
                    keyword = key;
                }
            }
        }
        this.getObjectFromOrder.data = data;
        this.getObjectFromOrder.key = keyword;
        for (var key in res.attributes) {
            if (key === this.getObjectFromOrder.key) {
                data = res.attributes[key];
                selection = res.attributes_orders.attributes_metadata[key];
            }
        }
        this.getObjectFromOrder.data = data;
        this.getObjectFromOrder.selection = selection;
        this.userResponse.type = [];
        if (this.getObjectFromOrder.data.length === 0) this.noTypesAvailable = true;
        else {
            //To show select multiple or show more option 
            if (selection != undefined) {
                if (selection.multiSelect == 'Y') {
                    this.showMoreOrMultipleType = true;
                }
                else {
                    this.showMoreOrMultipleType = false;
                }
                this.showOnly4Options = true;
                this.showMoreLessStr = "Show More"
            }
            //To show select multiple or show more option
            if (res.noType) this.conversations.push(new Conversation(MsgDirection.In, this.getObjectFromOrder.selection['Mobile Label']));
            for (var i = 0; i < this.getObjectFromOrder.data.length; i++) {
                let type = this.getObjectFromOrder.data[i]
                this.userResponse.type.push(new SearchDataModal('id' + i, type, type, '4', '', '', this.getObjectFromOrder.selection));
            }
            this.addNoPreferenceTypePosition(); // To add No Preference in 4th position 
        }
        //this.showAvailableTypes = true;
    }
    showMoreOrMultipleFeature: boolean;
    getObjectFromOrderNoStep2(res) {
        let order; let keyword; let getObjectFromOrder = []; let values: any; let withValues = [];
        let resAttribute = res.attributes;
        let resMetaData = res.attributes_orders.attributes_metadata;
        for (var key in resMetaData) search(resMetaData[key].order, resMetaData);
        function search(nameKey, myObject) {
            for (var key in myObject) {
                if (myObject[key].Page != "1") {
                    if (myObject[key].order === nameKey) {
                        order = myObject[key];
                        keyword = key;
                        pushData(order, keyword);
                    }
                }
            }
        }
        function pushData(order, keyword) {
            getObjectFromOrder.push({
                key: keyword,
                order: order,
                orderNo: order.order
            });
        }

        //Assigning Values
        for (var i = 0; i < getObjectFromOrder.length; i++) {
            for (var key in resAttribute) if (getObjectFromOrder[i].key === key) getObjectFromOrder[i].values = resAttribute[key];
        }
        //Splicing the Objects without Values
        for (var i = 0; i < getObjectFromOrder.length; i++) {
            if (getObjectFromOrder[i].values != undefined) withValues.push(getObjectFromOrder[i]);
        }
        //Filtering the Array Based on Filter Key as Yes
        this.sort(withValues)
        getObjectFromOrder = withValues;



        //Filter data from internal API response
        if (this.fromAPI) {
            for (var i = 0; i < this.getObjectFromOrder2.length; i++) {
                if (this.lastValueForAPI == this.getObjectFromOrder2[i].key) {
                    while ((i + 1) < this.getObjectFromOrder2.length) this.getObjectFromOrder2.pop();
                    break;
                }
            }
            //If data is already selected before the API calls
            for (var i = 0; i < getObjectFromOrder.length; i++) {
                for (var j = 0; j < this.Step2SelectedValues.length; j++) {
                    if (getObjectFromOrder[i].key == this.Step2SelectedValues[j].key) {
                        delete this.Step2SelectedValues[j];
                        this.Step2SelectedValues = this.Step2SelectedValues.filter(function (item) {
                            return item !== undefined;
                        });
                    }
                }
            }

            //If data is already selected before the API calls
            for (var i = 0; i < getObjectFromOrder.length; i++) {
                this.getObjectFromOrder2.push(getObjectFromOrder[i])
            }


            this.sort(this.getObjectFromOrder2)
            this.fromAPI = false;
            this.OtherOptionAvailable('fromAPI');
        }
        //Filter data from internal API response
        else {
            this.getObjectFromOrder2 = getObjectFromOrder;
            this.OtherOptionAvailable('fromCommon')
        }
        if (this.IsSubcatAPI) {
            this.getObjectFromOrder2.length != 0 ? this.trackFeatureObj.push(this.getObjectFromOrder2[0]) : {};
            this.IsSubcatAPI = false;
        }
        this.ng4LoadingSpinnerService.hide();

        this.showHideElements()
    }

    ShowAttributesType() {

        this.selectedType = this.getObjectFromOrder2.find(k => k.key == 'Screen Type');


        let typeValues = this.getObjectFromOrder2.find(k => k.key == 'Screen Type').values;

        for (var i = 0; i < typeValues.length; i++)
            this.userResponse.type.push(new SearchDataModal('', 'type', typeValues[i], "4", ""));
        //this.showAvailableTypes = true;
    }

    selectMultiple(key: any) {
        if (key == 'type') {
            this.showMultipleTypes = true;
            document.getElementsByClassName("CUIpopup")[0].classList.add("pop_overlay");
            //this.conversations.push(new Conversation(MsgDirection.In, 'select type'));
            this.showAvailableTypes = false;
        }
        else {
            this.showMultipleFeatures = true;
            document.getElementsByClassName("CUIpopup")[0].classList.add("pop_overlay");
            this.showAvailableFeature = false;
        }
        this.deleteNoPreferenceFeature();
        this.deleteNoPreferenceType();
    }

    deleteNoPreferenceType() {
        if (this.userResponse.type.length > 0) {
            if (this.userResponse.type[3] != undefined && this.userResponse.type[3].name == "No Preference" && this.RemoveNoPreferenceType) {
                this.userResponse.type.splice(3, 1);
                this.RemoveNoPreferenceType = false;
            }
        }
    }

    deleteNoPreferenceFeature() {
        if (this.trackFeatureObj.length > 0) {
            if (this.trackFeatureObj[this.trackFeatureObj.length - 1].values[3] == "No Preference" && this.RemoveNoPreferenceFeature) {
                this.trackFeatureObj[this.trackFeatureObj.length - 1].values.splice(3, 1);
                this.RemoveNoPreferenceFeature = false;
            }
        }
    }

    skipToEnd() {
        this.hidePartNumberData = true;
        this.conversations.push(new Conversation(MsgDirection.Out, "skip to end"));
        this.conversations.push(new Conversation(MsgDirection.In, "What's your budget?"));
        this.showAvailableFeature = false;
        this.showMultipleFeatures = false;
        this.showAvailableTypes = false;
        this.showMultipleTypes = false;
        let index = this.getObjectFromOrder2.indexOf(this.getObjectFromOrder2.find(x => x.key == 'Price'));
        let nextItem = this.getObjectFromOrder2[index];
        if (nextItem.key == 'Price') {
            let price = nextItem.values;
            this.minPrice = price[0].split("-")[0];
            this.maxPrice = price[0].split("-")[1];
            this.ng4LoadingSpinnerService.hide();
            this.getOffer_orderInfo = this.formBuilder.group({
                "minPrice": [this.minPrice],
                "maxPrice": [this.maxPrice],
            });
            this.showMinMaxPrice = true;
            this.changedetRef.detectChanges();
        }
        // let price = ["50-10000"];
        // this.minPrice = price[0].split("-")[0];
        // this.maxPrice = price[0].split("-")[1];
        // this.ng4LoadingSpinnerService.hide();
        // this.getOffer_orderInfo = this.formBuilder.group({
        //     "minPrice": [this.minPrice],
        //     "maxPrice": [this.maxPrice],
        // });
        // this.showMinMaxPrice = true;
        // this.changedetRef.detectChanges();
    }

    async changeSubcategory(subcategory, attrKey) {
        this.ng4LoadingSpinnerService.show();
        this.gSCM.productType = subcategory.name;
        this.gSCM.subCategoryId = subcategory.id;
        this.Step1SelectedValues.subcategory = subcategory;
        this.Step1SelectedValues.subCategoryId = subcategory.id;
        this.gSCMRequestModal.productType = subcategory.name;
        this.gSCMRequestModal.subCategoryId = subcategory.id;
        this.getSubcategoryId = subcategory.id;
        this.attributeKey = attrKey;
        this.conversations.push(new Conversation(MsgDirection.Out, subcategory.name));
        document.getElementsByClassName("CUIpopup")[0].classList.remove("pop_overlay");
        var gTResponse = await this.getoffers.getofferSubCategory(this.gSCM);
        if (gTResponse.attributes != null && gTResponse.products && gTResponse.products.length > 0) {
            this.showAvailablesubcat = false;
            this.showAvailableTypes = true;
            if (gTResponse.noType == true) {
                this.gSCMRequestModal.attributes = {};
                this.Step1Modal.getoffer_1 = new Array<OfferInfo1>();
                this.Step1Modal.getoffer_1.push(new OfferInfo1(this.Step1SelectedValues.place, this.Step1SelectedValues.category, this.Step1SelectedValues.subcategory, this.Step1SelectedValues.type, this.Step1SelectedValues.placeId, this.Step1SelectedValues.categoryId, this.Step1SelectedValues.subCategoryId));
                var gTResponse = await this.getoffers.getofferSubCategory(this.gSCMRequestModal);
                this.ng4LoadingSpinnerService.hide();
                if (gTResponse.attributes != null) {
                    this.getObjectFromOrderNoStep2(gTResponse);
                    this.noTypeTrueFunction();
                }
            }
            else {
                this.conversations.push(new Conversation(MsgDirection.In, gTResponse.attributes_orders.attributes_metadata.Type["Mobile Label"]));
                this.getObjectFromOrderNoLevel1(gTResponse);
            }
        }
        else {
            // this.conversations.push(new Conversation(MsgDirection.In, "No offers found for this product type - " + this.gSCM.productType));
            this.conversations.push(new Conversation(MsgDirection.In, 'Sorry, but we don’t have any offer matches for you. Please check back soon, as we’re always adding new products.'));
        }
        this.ng4LoadingSpinnerService.hide();
        // this.getofferSubCategory(subcategory);
    }
    noTypeTrueFunction() {
        this.showMultipleTypes = false;
        document.getElementsByClassName("CUIpopup")[0].classList.remove("pop_overlay");
        this.showAvailableFeature = true;
        this.GetOfferStep_2.attributes = this.gSCMRequestModal.attributes;
        this.GetOfferStep_2Summary.attributes = this.gSCMRequestModal.attributes;
        this.showOnly4Options = true;
        if (this.getObjectFromOrder2.length != 0) {
            if (this.getObjectFromOrder2[0].order.multiSelect == 'Y') {
                this.showMoreOrMultipleFeature = true;
            }
            else {
                this.showMoreOrMultipleFeature = false;
            }
            this.showMoreLessStr = "Show More"
        }

        this.getObjectFromOrder2.length != 0 ? this.trackFeatureObj.push(this.getObjectFromOrder2[0]) : {};
        this.addNoPreferenceFeaturePosition();
        this.getObjectFromOrder2.length != 0 ? this.conversations.push(new Conversation(MsgDirection.In, (this.getObjectFromOrder2[0].order["Units"] == "" || this.getObjectFromOrder2[0].order["Units"] == undefined) ? this.getObjectFromOrder2[0].order["Mobile Label"] : this.getObjectFromOrder2[0].order["Mobile Label"] + " (" + this.getObjectFromOrder2[0].order["Units"] + ")")) : {};
    }

    closesubcat() {
        this.showAvailablesubcat = false;
        document.getElementsByClassName("CUIpopup")[0].classList.remove("pop_overlay");
    }

    async closeTypes() {
        this.showMultipleTypes = false;
        this.showAvailableTypes = true;
        document.getElementsByClassName("CUIpopup")[0].classList.remove("pop_overlay");
        this.addNoPreferenceTypePosition()

    }

    closeFeatures() {
        this.showMultipleTypes = false;
        this.showAvailableFeature = true;
        this.showMultipleFeatures = false;
        document.getElementsByClassName("CUIpopup")[0].classList.remove("pop_overlay");
        this.addNoPreferenceFeaturePosition();
    }

    addNoPreferenceFeaturePosition() {
        if (this.trackFeatureObj[this.trackFeatureObj.length - 1].values.indexOf("No Preference") > 3) {
            this.trackFeatureObj[this.trackFeatureObj.length - 1].values.splice(3, 0, "No Preference");
            this.RemoveNoPreferenceFeature = true;
        }
    }

    addNoPreferenceTypePosition() {
        if (this.getObjectFromOrder.data.indexOf("No Preference") > 3) {
            this.userResponse.type.splice(3, 0, new SearchDataModal('id', "No Preference", "No Preference", '4', '', '', this.getObjectFromOrder.selection));
            this.RemoveNoPreferenceType = true;
        }
    }
    getUpdateTypes() {
        this.gSCMRequestModal.placeName = this.gSCM.placeName;
        this.gSCMRequestModal.categoryName = this.gSCM.categoryName;
        this.gSCMRequestModal.productType = this.gSCM.productType;
        this.gSCMRequestModal.placeId = this.gSCM.placeId;
        this.gSCMRequestModal.categoryId = this.gSCM.categoryId;
        this.gSCMRequestModal.subCategoryId = this.gSCM.subCategoryId;
        if (this.Step1SelectedValues.type.length > 0) {
            this.gSCMRequestModal.attributes = {};
            if (this.getObjectFromOrder.key == "") this.getObjectFromOrder.key = Object.keys(this.gSCMRequestModal.attributes)[0]
            this.gSCMRequestModal.attributes[this.getObjectFromOrder.key] = [];
            for (var i = 0; i < this.Step1SelectedValues.type.length; i++) {
                let typeName = this.Step1SelectedValues.type[i].name;
                this.gSCMRequestModal.attributes[this.getObjectFromOrder.key].push(typeName)
            }
        }
        else this.gSCMRequestModal.attributes[this.getObjectFromOrder.key] = [];
    }

    sort(arr) {
        arr.sort(function (a, b) {
            var keyA = parseFloat(a.orderNo),
                keyB = parseFloat(b.orderNo);
            if (keyA < keyB) return -1;
            if (keyA > keyB) return 1;
            return 0;
        });
    }

    OtherOptionAvailable(from) {
        for (var i = 0; i < this.getObjectFromOrder2.length; i++) {
            if (this.getObjectFromOrder2[i].values.indexOf("Other") > -1) {
                if (from == 'fromAPI') {
                    if (this.getObjectFromOrder2[i].otherInput != undefined && !this.getObjectFromOrder2[i].otherInput) {
                        this.getObjectFromOrder2[i].otherInput = false;
                    }
                }
                else this.getObjectFromOrder2[i].otherInput = false;
            }
        }
    }

    showHideElements() {
        for (var i = 0; i < this.getObjectFromOrder2.length; i++) {
            let elements = this.getObjectFromOrder2[i];
            if (elements.values.length > 5) this.getObjectFromOrder2[i].hideRemaining = true;
        }
    }

    async  select(offer, values) {
        let addSelected: boolean = false;

        if (values == 'No Preference') {
            //this.GetOfferStep_2.attributes[offer.key] = [];
            //this.GetOfferStep_2.attributes[offer.key].push(values);
            this.GetOfferStep_2Summary.attributes[offer.key] = [];
            this.GetOfferStep_2Summary.attributes[offer.key].push(values);
            this.core.inputNewOption = false;
            this.core.footerSwapCUI(true, true);
            if (!this.getoffersingleFeatureTracker) {
                this.changeType(values, "features");
            }
            else {
                this.printInResponseCUI(values);
            }
        }
        else {
            addSelected = true;
            if (offer.order.multiSelect == "N" || this.getoffersingleFeatureTracker) {
                this.ng4LoadingSpinnerService.show();
                this.printInResponseCUI(values);
                //this.GetOfferStep_2.attributes[offer.key] = [];
                //this.GetOfferStep_2.attributes[offer.key].push(values);
                this.GetOfferStep_2Summary.attributes[offer.key] = [];
                this.GetOfferStep_2Summary.attributes[offer.key].push(values);
                this.lastValueForAPI = offer.key;
                this.otherOptionValue = '';
                this.core.inputNewOption = false;
                this.core.footerSwapCUI(true, true);


            }
            else {
                window.localStorage['multiSelectAPI'] = true;

                this.changeType(values, "features");

            }
        }

        if (addSelected && offer.order.Filter == "Y") {
            if (offer.order.Filter == "Y" && offer.order.multiSelect == "Y" && !this.getoffersingleFeatureTracker) {
                // Do nothing & call an API on confirm 
            }
            else {
                this.lastValueForAPI = offer.key;
                this.GetOfferStep_2 = this.gSCMRequestModal;
                this.GetOfferStep_2.attributes = {};
                this.GetOfferStep_2.attributes[offer.key] == undefined ? this.GetOfferStep_2.attributes[offer.key] = [] : {};
                this.GetOfferStep_2.attributes[offer.key].push(values);

                //this.GetOfferStep_2.attributes[offer.key].push(values);
                //var gTResponse = await this.getoffers.getofferSubCategory(this.gSCMRequestModal);
                var gTResponse = await this.getoffers.getofferSubCategory(this.GetOfferStep_2);
                if (gTResponse.attributes != null) {
                    this.fromAPI = true;
                    //this.GetOfferStep_2.attributes = {};
                    //if (!window.localStorage['multiSelectAPI']) this.GetOfferStep_2.attributes = {};
                    localStorage.removeItem("multiSelectAPI");
                    this.getObjectFromOrderNoStep2(gTResponse);
                    //if(offer.order.multiSelect =="N")
                    //{
                    if (offer.order.multiSelect == "N" || this.getoffersingleFeatureTracker) {
                        this.findNextKeyItem(offer);
                        this.showMultipleFeatures = false;
                        this.showAvailableFeature = true;
                    }
                }
            }


        } else {
            if (offer.order.multiSelect == "N" || this.getoffersingleFeatureTracker) {
                this.findNextKeyItem(offer);
                this.showMultipleFeatures = false;
                this.showAvailableFeature = true;
            }

            this.ng4LoadingSpinnerService.hide();
        }
        this.getoffersingleFeatureTracker = false;
    }

    pushpopSelectedSingleFeature(featureObj: any, event: any, value: any) {
        this.showPartNumberSection = false;
        this.getoffersingleFeatureTracker = true;
        this.pushpopSelectedFeature(featureObj, event, value);
        this.partNumberArray = [];
    }

    pushPopPartNumber(featureObj: any, value: any){
        let getoffer2PopIndex;
        if(value =='' || value == undefined)
        {
            this.errorMsg = "please enter a part number"
            this.partNumberInvalid = true;
            setTimeout(() => {
                this.partNumberInvalid = false;
            }, 2000);
            return;
        }
        this.partNumberArray.push(value);
        this.partNumValue ='';
        if (value == "No Preference") {
            var RepeatedNoPreference;
            if (this.GetOfferStep_2Summary.attributes[featureObj.key]) {
                RepeatedNoPreference = this.GetOfferStep_2Summary.attributes[featureObj.key].filter(i => i == value);
            }
            if (RepeatedNoPreference != undefined && RepeatedNoPreference.length != 0) {
                var checkboxes = null;
                checkboxes = document.getElementsByClassName('chkBorder');
                for (var j = 0; j < checkboxes.length; j++) {
                    if (checkboxes[j].id == "No Preference") {
                        checkboxes[j].checked = true;
                    }
                }
                return
            }
        }
        if (this.GetOfferStep_2Summary.attributes[featureObj.key]) {
            for (let i = 0; i < this.GetOfferStep_2Summary.attributes[featureObj.key].length; i++) {
                if (this.GetOfferStep_2Summary.attributes[featureObj.key][i] == "No Preference") {
                    this.GetOfferStep_2Summary.attributes[featureObj.key].splice(i, 1);
                    var checkboxes = null;
                    checkboxes = document.getElementsByClassName('chkBorder');
                    for (var j = 0; j < checkboxes.length; j++) {
                        if (checkboxes[j].id == "No Preference") {
                            checkboxes[j].checked = false;
                        }
                    }
                }
            }

        }

        if (this.Step2SelectedValues.length != 0) {
            var RemoveNopreference = this.Step2SelectedValues.filter(i => i.key == featureObj.key)
            if (RemoveNopreference.length != 0)
                for (let i = 0; i < RemoveNopreference.length; i++) {
                    if (RemoveNopreference[i].values == "No Preference") {
                        this.Step2SelectedValues = this.Step2SelectedValues.filter(i => i.key != featureObj.key);
                    }
                }
        }

        if (value != '' && value != undefined) {
            this.GetOfferStep_2.attributes[featureObj.key] == undefined ? this.GetOfferStep_2.attributes[featureObj.key] = [] : {};
            this.GetOfferStep_2.attributes[featureObj.key].push(value);

           this.GetOfferStep_2Summary.attributes[featureObj.key] == undefined ? this.GetOfferStep_2Summary.attributes[featureObj.key] = [] : {};
           this.GetOfferStep_2Summary.attributes[featureObj.key].push(value);
        }
        // else {
        //     this.GetOfferStep_2.attributes[featureObj.key] != undefined ? this.GetOfferStep_2.attributes[featureObj.key].splice(this.GetOfferStep_2.attributes[featureObj.key].indexOf(value), 1) : {};
        //     this.GetOfferStep_2Summary.attributes[featureObj.key] != undefined ? this.GetOfferStep_2Summary.attributes[featureObj.key].splice(this.GetOfferStep_2Summary.attributes[featureObj.key].indexOf(value), 1) : {};
        // }


        if ((value !='' && value != undefined) || (this.getoffersingleFeatureTracker && value != "Other")) { // multi select - any value other than other
            this.Step2SelectedValues.push({
                key: featureObj.key,
                values: value
            });
            this.lastValueForAPI = featureObj.key;
            this.select(featureObj, value);
            // this.changeType(value, "features");
        }

        // if (this.getoffersingleFeatureTracker && value == "Other") { // single select - other option 
        //     this.core.inputNewOption = true;
        //     this.core.footerSwapCUI(false, true);
        //     this.otherOptionFeatureObj = featureObj;
        //     this.otherOptionHasBeenSelected = value;
        //     this.lastValueForAPI = featureObj.key;
        // }
        // else {                                                             //  deselect any value but not other
        //     getoffer2PopIndex = this.Step2SelectedValues.findIndex(obj => obj.values === value);
        //     if (getoffer2PopIndex != -1) {
        //         this.Step2SelectedValues.splice(getoffer2PopIndex, 1);
        //     }
        //     this.lastValueForAPI = featureObj.key;
        //     this.select(featureObj, value);
        //     // this.changeType(value, "features");
        // }

    }
    deleteSinglepartNumber(featureObj: any, value: any, index: any)
    {
        let getoffer2PopIndex;
        this.partNumberArray.splice(index,1);
        this.GetOfferStep_2.attributes[featureObj.key] != undefined ? this.GetOfferStep_2.attributes[featureObj.key].splice(this.GetOfferStep_2.attributes[featureObj.key].indexOf(value), 1) : {};
        this.GetOfferStep_2Summary.attributes[featureObj.key] != undefined ? this.GetOfferStep_2Summary.attributes[featureObj.key].splice(this.GetOfferStep_2Summary.attributes[featureObj.key].indexOf(value), 1) : {};
        
        getoffer2PopIndex = this.Step2SelectedValues.findIndex(obj => obj.values === value);
        if (getoffer2PopIndex != -1) {
            this.Step2SelectedValues.splice(getoffer2PopIndex, 1);
        }
        this.lastValueForAPI = featureObj.key;
        this.select(featureObj, value);
    }
    pushpopSelectedFeature(featureObj: any, event: any, value: any) {

        let getoffer2PopIndex;
        //this.GetOfferStep_2.attributes = {};

        if (value == "No Preference") {
            var RepeatedNoPreference;
            if (this.GetOfferStep_2Summary.attributes[featureObj.key]) {
                RepeatedNoPreference = this.GetOfferStep_2Summary.attributes[featureObj.key].filter(i => i == value);
            }
            if (RepeatedNoPreference != undefined && RepeatedNoPreference.length != 0) {
                var checkboxes = null;
                checkboxes = document.getElementsByClassName('chkBorder');
                for (var j = 0; j < checkboxes.length; j++) {
                    if (checkboxes[j].id == "No Preference") {
                        checkboxes[j].checked = true;
                    }
                }
                return
            }
        }
        if (this.GetOfferStep_2Summary.attributes[featureObj.key]) {
            for (let i = 0; i < this.GetOfferStep_2Summary.attributes[featureObj.key].length; i++) {
                if (this.GetOfferStep_2Summary.attributes[featureObj.key][i] == "No Preference") {
                    this.GetOfferStep_2Summary.attributes[featureObj.key].splice(i, 1);
                    var checkboxes = null;
                    checkboxes = document.getElementsByClassName('chkBorder');
                    for (var j = 0; j < checkboxes.length; j++) {
                        if (checkboxes[j].id == "No Preference") {
                            checkboxes[j].checked = false;
                        }
                    }
                }
            }

        }
        if (this.Step2SelectedValues.length != 0) {
            var RemoveNopreference = this.Step2SelectedValues.filter(i => i.key == featureObj.key)
            if (RemoveNopreference.length != 0)
                for (let i = 0; i < RemoveNopreference.length; i++) {
                    if (RemoveNopreference[i].values == "No Preference") {
                        this.Step2SelectedValues = this.Step2SelectedValues.filter(i => i.key != featureObj.key);
                    }
                }
        }
        if (event.target.checked) {
            this.GetOfferStep_2.attributes[featureObj.key] == undefined ? this.GetOfferStep_2.attributes[featureObj.key] = [] : {};
            this.GetOfferStep_2.attributes[featureObj.key].push(value);

            this.GetOfferStep_2Summary.attributes[featureObj.key] == undefined ? this.GetOfferStep_2Summary.attributes[featureObj.key] = [] : {};
            this.GetOfferStep_2Summary.attributes[featureObj.key].push(value);
        }
        else {
            this.GetOfferStep_2.attributes[featureObj.key] != undefined ? this.GetOfferStep_2.attributes[featureObj.key].splice(this.GetOfferStep_2.attributes[featureObj.key].indexOf(value), 1) : {};
            this.GetOfferStep_2Summary.attributes[featureObj.key] != undefined ? this.GetOfferStep_2Summary.attributes[featureObj.key].splice(this.GetOfferStep_2Summary.attributes[featureObj.key].indexOf(value), 1) : {};
        }
        if (event.target.checked && value == "Other") { // multi selcet - other option selected
            this.core.inputNewOption = true;
            this.core.inputNewLocation = false;
            this.core.footerSwapCUI(false, true);
            this.otherOptionFeatureObj = featureObj;
            this.otherOptionHasBeenSelected = value;
            this.lastValueForAPI = featureObj.key;

            this.select(featureObj, value);
        }
        else if (event.target.checked && value == "No Preference") {  // multi select - no preference
            this.Step2SelectedValues = this.Step2SelectedValues.filter(i => i.key != featureObj.key);
            this.Step2SelectedValues.push({
                key: featureObj.key,
                values: "No Preference"
            });
            this.lastValueForAPI = featureObj.key;
            this.select(featureObj, value);
        }
        else if (event.target.checked || (this.getoffersingleFeatureTracker && value != "Other")) { // multi select - any value other than other
            this.Step2SelectedValues.push({
                key: featureObj.key,
                values: value
            });
            this.lastValueForAPI = featureObj.key;
            this.select(featureObj, value);
            // this.changeType(value, "features");
        }

        else if (!event.target.checked && value == "Other" && !this.getoffersingleFeatureTracker) {  // deselect other value 
            this.core.inputNewOption = false;
            this.core.footerSwapCUI(true, true);
            this.Step2SelectedValues.splice(this.Step2SelectedValues.findIndex(obj => obj.values === this.otherOptionValue), 1);
            this.lastValueForAPI = featureObj.key;
            this.select(featureObj, value);
        }
        else if (this.getoffersingleFeatureTracker && value == "Other") { // single select - other option 
            this.core.inputNewOption = true;
            this.core.footerSwapCUI(false, true);
            this.otherOptionFeatureObj = featureObj;
            this.otherOptionHasBeenSelected = value;
            this.lastValueForAPI = featureObj.key;
        }
        else {                                                             //  deselect any value but not other
            getoffer2PopIndex = this.Step2SelectedValues.findIndex(obj => obj.values === value);
            if (getoffer2PopIndex != -1) {
                this.Step2SelectedValues.splice(getoffer2PopIndex, 1);
            }
            this.lastValueForAPI = featureObj.key;
            this.select(featureObj, value);
            // this.changeType(value, "features");
        }
    }

    otherOptionsInput(otherOption: any) {
        this.Step2SelectedValues.push({
            key: this.otherOptionFeatureObj.key,
            values: otherOption
        });
        this.GetOfferStep_2Summary.attributes[this.otherOptionFeatureObj.key] == undefined ? this.GetOfferStep_2Summary.attributes[this.otherOptionFeatureObj.key] = [] : {};
        this.GetOfferStep_2Summary.attributes[this.otherOptionFeatureObj.key].push(otherOption);
        this.lastValueForAPI = this.otherOptionFeatureObj.key;
        if (this.getoffersingleFeatureTracker) {
            this.select(this.otherOptionFeatureObj, otherOption);
        }
    }


    async confirmTypes(attrKey, type) {

        let indexofNopreferenceStep1;
        if (attrKey == 'multiple') {
            if (!this.gSCM.placeName) {
                this.validationMsg = "Please select a place";
            }
            else if (!this.gSCM.categoryName) {
                this.validationMsg = "Please select a category";
            }
            else {

                document.getElementsByClassName("CUIpopup")[0].classList.remove("pop_overlay");
                let selectedsubTypes = [];
                this.userResponse.type.forEach(type => {
                    type.isChecked == true ? selectedsubTypes.push(type) : {};
                });
                indexofNopreferenceStep1 = selectedsubTypes.findIndex(obj => obj.name === "No Preference");
                if (selectedsubTypes.length == 0) {
                    this.conversations.push(new Conversation(MsgDirection.In, "select types to continue!"));
                    return;
                }
                else if (this.noPreferenceType == "No Preference" && indexofNopreferenceStep1 != -1) {
                    selectedsubTypes = selectedsubTypes.filter(i => i.name == "No Preference");
                }
                else if (this.noPreferenceType != "No Preference" && indexofNopreferenceStep1 != -1) {
                    selectedsubTypes = selectedsubTypes.filter(i => i.name != "No Preference");
                }

                this.NoPreferencechkunchk = [];
                this.showAvailableTypes = false;
                this.showMultipleTypes = false;
                this.Step1SelectedValues.type = selectedsubTypes;
                let multipleType = "";
                for (var i = 0; i < this.Step1SelectedValues.type.length; i++) {
                    multipleType += this.Step1SelectedValues.type[i].name + ', ';
                }
                multipleType = multipleType.substring(0, multipleType.length - 2);
                this.conversations.push(new Conversation(MsgDirection.Out, multipleType.replace(/(^,)|(,$)/g, "")));
                //this.checkIfStored = true;
                this.Step1Modal.getoffer_1 = new Array<OfferInfo1>();
                this.Step1Modal.getoffer_1.push(new OfferInfo1(this.Step1SelectedValues.place, this.Step1SelectedValues.category, this.Step1SelectedValues.subcategory, this.Step1SelectedValues.type, this.Step1SelectedValues.placeId, this.Step1SelectedValues.categoryId, this.Step1SelectedValues.subCategoryId));
                this.getUpdateTypes();
                this.GetOfferStep_2 = this.gSCMRequestModal;
                var gTResponse = await this.getoffers.getofferSubCategory(this.gSCM);
                if (gTResponse.attributes != null) {
                    this.getObjectFromOrderNoStep2(gTResponse);
                }
            }
        }
        else if (attrKey == 'single') {
            this.ng4LoadingSpinnerService.show();
            this.NoPreferencechkunchk = [];
            this.showAvailableTypes = false;
            //this.gSCMRequestModal.attributes = type;
            let selectedsubTypes = [];
            selectedsubTypes.push(type);
            this.Step1SelectedValues.type = selectedsubTypes;
            this.Step1Modal.getoffer_1 = new Array<OfferInfo1>();
            this.Step1Modal.getoffer_1.push(new OfferInfo1(this.Step1SelectedValues.place, this.Step1SelectedValues.category, this.Step1SelectedValues.subcategory, this.Step1SelectedValues.type, this.Step1SelectedValues.placeId, this.Step1SelectedValues.categoryId, this.Step1SelectedValues.subCategoryId));
            //this.gSCMRequestModal.attributes = selectedsubcategory;
            this.GetOfferStep_2 = this.gSCMRequestModal;
            this.conversations.push(new Conversation(MsgDirection.Out, type.name));
            this.getUpdateTypes();
            var gTResponse = await this.getoffers.getofferSubCategory(this.gSCMRequestModal);
            this.ng4LoadingSpinnerService.hide();
            if (gTResponse.attributes != null) {
                this.getObjectFromOrderNoStep2(gTResponse);
            }
            //this.getofferSubCategoryStep2(this.gSCMRequestModal);
        }

        this.showMultipleTypes = false;
        document.getElementsByClassName("CUIpopup")[0].classList.remove("pop_overlay");
        this.showAvailableFeature = true;
        this.GetOfferStep_2.attributes = this.gSCMRequestModal.attributes;
        this.GetOfferStep_2Summary.attributes = this.gSCMRequestModal.attributes;
        this.showOnly4Options = true;
        if (this.getObjectFromOrder2.length != 0) {
            if (this.getObjectFromOrder2[0].order.multiSelect == 'Y') {
                this.showMoreOrMultipleFeature = true;
            }
            else {
                this.showMoreOrMultipleFeature = false;
            }
            this.showMoreLessStr = "Show More"
        }

        this.getObjectFromOrder2.length != 0 ? this.trackFeatureObj.push(this.getObjectFromOrder2[0]) : {};
        this.addNoPreferenceFeaturePosition();
        
        //let index = this.getObjectFromOrder2.indexOf(this.getObjectFromOrder2.find(x => x.key == 'Price'));
        let nextItem = this.getObjectFromOrder2[0];
        if (nextItem.key == 'Price') {
            let price = nextItem.values;
            this.minPrice = price[0].split("-")[0];
            this.maxPrice = price[0].split("-")[1];
            this.ng4LoadingSpinnerService.hide();
            this.getOffer_orderInfo = this.formBuilder.group({
                "minPrice": [this.minPrice],
                "maxPrice": [this.maxPrice],
            });
            this.showMinMaxPrice = true;
            this.changedetRef.detectChanges();
        }
        this.getObjectFromOrder2.length != 0 ? this.conversations.push(new Conversation(MsgDirection.In, (this.getObjectFromOrder2[0].order["Units"] == "" || this.getObjectFromOrder2[0].order["Units"] == undefined) ? this.getObjectFromOrder2[0].order["Mobile Label"] : this.getObjectFromOrder2[0].order["Mobile Label"] + " (" + this.getObjectFromOrder2[0].order["Units"] + ")")) : {};
    };

    changeType(value, flag) {
        if (value.name) {
            this.noPreferenceType = value.name;
        }

        if (flag == "type" && value.name == "No Preference") {
            for (let i = 0; i < this.userResponse.type.length; i++) {
                if (this.userResponse.type[i].isChecked == true && this.userResponse.type[i].name != "No Preference") {
                    this.userResponse.type[i].isChecked = false;
                }
            }
            for (let j = 0; j < this.userResponse.type.length; j++) {
                if (this.userResponse.type[j].isChecked == false && this.userResponse.type[j].name == "No Preference") {
                    this.userResponse.type[j].isChecked = true;
                    return
                }
            }
        }
        else if (flag == "type" && value.name != "No Preference") {
            for (let i = 0; i < this.userResponse.type.length; i++) {
                if (this.userResponse.type[i].isChecked == true && this.userResponse.type[i].name == "No Preference") {
                    this.userResponse.type[i].isChecked = false;
                }
            }
        }
        else {

        }
        if (flag == "type") {
            let typetext = value.text.replace(/ /g, "").concat("_type");
            //this.NoPreferencechkunchk.attributes[type.name] =[];
            if (document.getElementsByClassName(typetext)[0] != undefined) {
                if (document.getElementsByClassName(typetext)[0].classList.contains("chkaddbackgrnd")) {
                    document.getElementsByClassName(typetext)[0].classList.remove("chkaddbackgrnd");
                }
                else {
                    if (typetext != "NoPreference_type") {
                        document.getElementsByClassName("NoPreference_type")[0] != undefined ? document.getElementsByClassName("NoPreference_type")[0].classList.remove("chkaddbackgrnd") : {};
                    }
                    this.NoPreferencechkunchk.push(typetext);
                    document.getElementsByClassName(typetext)[0].classList.add("chkaddbackgrnd");
                }
                if (value.text == 'No Preference') {
                    for (var i = 0; i < this.NoPreferencechkunchk.length; i++) {
                        if (this.NoPreferencechkunchk[i] != "NoPreference_type") {
                            if (document.getElementsByClassName(this.NoPreferencechkunchk[i])[0].classList.contains("chkaddbackgrnd")) {
                                document.getElementsByClassName(this.NoPreferencechkunchk[i])[0].classList.remove("chkaddbackgrnd");
                            }
                        }
                    }
                    document.getElementsByClassName(typetext)[0].classList.add("chkaddbackgrnd");
                    // this.confirmTypes('single', value);
                }

            }
            if (value.selection.multiSelect == 'N' && value.text != 'No Preference') {
                this.Step1SelectedValues.type = [];
                this.confirmTypes('single', value);
            }
        }
        else if (flag == "features") {
            let featuretext = value.replace(/ /g, "") + "_attr";
            //this.NoPreferencechkunchk.attributes[type.name] =[];
            if (document.getElementsByClassName(featuretext)[0]) {
                if (document.getElementsByClassName(featuretext)[0].classList.contains("chkaddbackgrnd")) {
                    document.getElementsByClassName(featuretext)[0].classList.remove("chkaddbackgrnd");
                }
                else {
                    if (featuretext != "NoPreference_attr") {
                        document.getElementsByClassName("NoPreference_attr")[0] != undefined ? document.getElementsByClassName("NoPreference_attr")[0].classList.remove("chkaddbackgrnd") : {};
                    }
                    this.NoPreferencechkunchk.push(featuretext);
                    document.getElementsByClassName(featuretext)[0].classList.add("chkaddbackgrnd");
                }
                if (value == 'No Preference') {

                    for (var i = 0; i < this.NoPreferencechkunchk.length; i++) {
                        if (this.NoPreferencechkunchk[i] != "NoPreference_attr") {
                            if (document.getElementsByClassName(this.NoPreferencechkunchk[i])[0].classList.contains("chkaddbackgrnd")) {
                                document.getElementsByClassName(this.NoPreferencechkunchk[i])[0].classList.remove("chkaddbackgrnd");
                            }
                        }
                    }
                    var checkboxes = null;
                    checkboxes = document.getElementsByClassName('chkBorder');
                    for (var j = 0; j < checkboxes.length; j++) {
                        if (checkboxes[j].id != "No Preference") {
                            checkboxes[j].checked = false;
                        }
                    }
                    document.getElementsByClassName(featuretext)[0].classList.add("chkaddbackgrnd")
                }
            }
        }
    }

    confirmsinglefeature(featureObj: any, value: any) {
        this.Step2SelectedValues.push({
            key: featureObj.key,
            values: value
        });
        this.GetOfferStep_2.attributes[featureObj.key] == undefined ? this.GetOfferStep_2.attributes[featureObj.key] = [] : {};
        this.GetOfferStep_2.attributes[featureObj.key].push(value);
        this.GetOfferStep_2Summary.attributes[featureObj.key] == undefined ? this.GetOfferStep_2.attributes[featureObj.key] = [] : {};
        this.GetOfferStep_2Summary.attributes[featureObj.key].push(value);

        this.lastValueForAPI = featureObj.key;
        this.confirmFeature(featureObj, value);
    }

    printInResponseCUI(value: any) {
        this.conversations.push(new Conversation(MsgDirection.Out, value));
    }

    confirmFeature(featureObj: any, attrKey: any) {
        if(attrKey == 'Part Number' && this.partNumberArray.length == 0)
        {
            this.errorMsg = "Please, provide partnumber!"
            this.partNumberInvalid = true;
            setTimeout(() => {
                this.partNumberInvalid = false;
            }, 2000);
        }
        this.showPartNumberSection = false;
        this.otherOptionValue = '';
        this.partNumberArray = [];
        var selectedfeatures = this.Step2SelectedValues.filter(i => i.key == featureObj.key)
        let indexofNopreference;
        this.core.inputNewOption = false;
        this.core.footerSwapCUI(true, true);
        if (selectedfeatures == undefined || selectedfeatures.length == 0) {
            return;
        }
        else {
            indexofNopreference = selectedfeatures.findIndex(obj => obj.values === "No Preference");
            if (indexofNopreference != -1) {
                this.Step2SelectedValues = this.Step2SelectedValues.filter(i => i.key != featureObj.key);
                this.Step2SelectedValues.push({
                    key: featureObj.key,
                    values: "No Preference"
                });
                selectedfeatures = this.Step2SelectedValues.filter(i => i.key == featureObj.key)
            }
        }
        this.NoPreferencechkunchk = [];
        let multiConversation = "";
        for (var i = 0; i < selectedfeatures.length; i++) {
            multiConversation += selectedfeatures[i].values + ', '
        }
        multiConversation = multiConversation.substring(0, multiConversation.length - 2);
        this.conversations.push(new Conversation(MsgDirection.Out, multiConversation.replace(/(^,)|(,$)/g, "")));
        this.findNextKeyItem(featureObj);
        this.showAvailableFeature = true;
        this.showMultipleFeatures = false;

    }

    findNextKeyItem(featureObj) {
        let nextItem;
        let index = this.getObjectFromOrder2.indexOf(this.getObjectFromOrder2.find(x => x.key == featureObj.key));
        if (index >= 0 && index < this.getObjectFromOrder2.length - 1) {
            nextItem = this.getObjectFromOrder2[index + 1];
            this.conversations.push(new Conversation(MsgDirection.In, (nextItem.order["Units"] == "" || nextItem.order["Units"] == undefined) ? nextItem.order["Mobile Label"] : nextItem.order["Mobile Label"] + " (" + nextItem.order["Units"] + ")"));
            // this.conversations.push(new Conversation(MsgDirection.In, "select " + nextItem.key));
            document.getElementsByClassName("CUIpopup")[0].classList.remove("pop_overlay");
            this.trackFeatureObj.push(nextItem);
            this.addNoPreferenceFeaturePosition();
            this.showOnly4Options = true;
            if (this.getObjectFromOrder2.length != 0) {
                if (this.getObjectFromOrder2[index + 1].order.multiSelect == 'Y') {
                    this.showMoreOrMultipleFeature = true;
                }
                else {
                    this.showMoreOrMultipleFeature = false;
                }
                this.showMoreLessStr = "Show More"
            }
            if (nextItem.key == 'Price') {
                let price = nextItem.values;
                this.minPrice = price[0].split("-")[0];
                this.maxPrice = price[0].split("-")[1];
                this.ng4LoadingSpinnerService.hide();
                this.getOffer_orderInfo = this.formBuilder.group({
                    "minPrice": [this.minPrice],
                    "maxPrice": [this.maxPrice],
                });
                this.showMinMaxPrice = true;
                this.changedetRef.detectChanges();
            }
        }
        else {
            this.showMultipleFeatures = false;
            document.getElementsByClassName("CUIpopup")[0].classList.remove("pop_overlay");
        }
    }

    getExistingLocations() {
        if (window.localStorage['userInfo']) this.userId = JSON.parse(window.localStorage['userInfo']).userId;
        if (this.userId) {
            this.getoffers.getExistingLocations(this.userId).subscribe(res => {
                for (var i = 0; i < res.length; i++) {
                    this.existingLocation.push({
                        "zipcode": res[i].zipcode,
                        "country": res[i].country,
                        "city": res[i].city,
                        "state": res[i].state
                    });
                }
                this.showExistingLocation = true;
            });
        }
    }

    selectAddress(address) {
        this.showExistingLocation = false;
        this.conversations.push(new Conversation(MsgDirection.Out, address.zipcode));
        this.conversations.push(new Conversation(MsgDirection.In, 'How fast?'));
        document.getElementsByClassName("CUIpopup")[0].classList.remove("pop_overlay");
        this.questionPopUps.push(new QuestionPopUp('Next day: 1 business day shipping'));
        this.questionPopUps.push(new QuestionPopUp('2 day: 2 business day shipping'));
        this.questionPopUps.push(new QuestionPopUp('Express: 3 to 5 business days'));
        this.questionPopUps.push(new QuestionPopUp('Standard: 5 to 8 business days'));
        this.questionPopUps.push(new QuestionPopUp('No Preference'));
        this.getCSC = [];
        this.getCSC.push({
            "zipcode": address.zipcode,
            "country": address.country,
            "state": address.state
        });
        this.Step3SelectedValues.location = this.getCSC;
        this.core.inputNewLocation = false; //To make text in footer for getoffer inactive
        this.core.footerSwapCUI(true, false);
    }

    rangeValueChanged(event, start: any, end: any) {
        var start_el = this.getElement(start);
        var end_el = this.getElement(end);
        start_el.textContent = event.startValue;
        end_el.textContent = event.endValue;
    }

    getElement(data) {
        if (typeof (data) == 'string') {
            return document.getElementById(data);
        }
        if (typeof (data) == 'object' && data instanceof Element) {
            return data;
        }
        return null;
    }

    confirmPrice() {
        

        this.showMinMaxPrice = false;
        this.Step3SelectedValues.price.minPrice = this.getOffer_orderInfo.controls.minPrice.value;
        this.Step3SelectedValues.price.maxPrice = this.getOffer_orderInfo.controls.maxPrice.value;
        this.conversations.push(new Conversation(MsgDirection.Out, "$" + this.Step3SelectedValues.price.minPrice + "-" + "$" + this.Step3SelectedValues.price.maxPrice));

        this.core.inputNewLocation = true;
        this.conversations.push(new Conversation(MsgDirection.In, 'What’s your zipcode?'));
        this.core.footerSwapCUI(false, true);
        this.getExistingLocations();
        this.showOnly4Options = true;
        this.showMoreLessStr = "Show More";
        //this.core.footerSwapCUI(false, true);
        this.questionPopUps = [];
        document.getElementsByClassName("CUIpopup")[0] != undefined ? document.getElementsByClassName("CUIpopup")[0].classList.remove("pop_overlay") : {};
    }

    GetOffersFromSummary() {
        this.loginFromGetOffers = false;
        this.conversations.push(new Conversation(MsgDirection.In, 'Your request has been submitted. We are generating your offers now…'));
        var current = new Date();
        var currentDay = current.getDate()
        var currentMonth = current.getMonth() + 1
        var currentYear = current.getFullYear()
        var forThreeDays = new Date(new Date().getTime() + 72 * 60 * 60 * 1000);
        var futureDay = forThreeDays.getDate()
        var futureMonth = forThreeDays.getMonth() + 1
        var futureYear = forThreeDays.getFullYear()
        this.loader = true;
        this.Step4Modal.placeName = this.Step4Summary.place.name;
        this.Step4Modal.categoryName = this.Step4Summary.category.name;
        this.Step4Modal.subCategoryName = this.Step4Summary.subCategory.name;
        this.Step4Modal.placeId = this.Step4Summary.place.id;
        this.Step4Modal.categoryId = this.Step4Summary.category.id;
        this.Step4Modal.subCategoryId = this.Step4Summary.subCategory.id;
        this.Step4Modal.deliveryMethod = this.Step4Summary.delivery;
        this.Step4Modal.deliveryLocation = this.Step4Summary.location;
        if (this.Step4Summary.priceRange != undefined) {
            this.Step4Modal.price.minPrice = this.Step4Summary.priceRange.minPrice;
            this.Step4Modal.price.maxPrice = this.Step4Summary.priceRange.maxPrice;
        }
        this.Step4Modal.startDate = current;
        this.Step4Modal.endDate = forThreeDays;
        if (this.Step4Summary.attributes == undefined) {
            let attr = { Type: [] };
            for (var i = 0; i < this.Step4Summary.type.length; i++) {
                attr.Type.push(this.Step4Summary.type[i].name)
            }
            this.Step4Modal.attributes = attr;
        }
        else this.Step4Modal.attributes = this.Step4Summary.attributes;
        this.Step4Modal.productType = this.Step4Summary.productType;
        // this.Step4Modal.typeName = new Array<any>();
        // for (var i = 0; i < this.Step4Summary.type.length; i++) this.Step4Modal.typeName.push(this.Step4Summary.type[i].name);
        if (this.getUserInfo == undefined) {
            this.Step4Modal.emailId = '';
            this.Step4Modal.userId = '';
        }
        else {
            this.Step4Modal.emailId = this.getUserInfo.emailId;
            this.Step4Modal.userId = this.getUserInfo.userId;
        }
        if (window.localStorage['offerIdForEdit'] != undefined) {
            this.Step4Modal.startDate = null;
            this.Step4Modal.endDate = null;
            this.Step4Modal.offerId = window.localStorage['offerIdForEdit']
            this.Step4Modal.consumerExist = true;
        }
        this.getoffers.confirmOffer(this.Step4Modal).subscribe(res => {
            this.loader = false;
            if (!res.offerID || !res.getOffersResponse) {
                this.conversation = new Conversation(MsgDirection.In, 'Sorry, but we don’t have any offer matches for you. Please check back soon, as we’re always adding new products.');
                this.conversations.push(this.conversation);
                this.questionPopUps = [];
                this.questionPopUps.push(new QuestionPopUp("I want to start over"));
            }
            else {
                window.localStorage['getOffers'] = JSON.stringify(res);
                localStorage.removeItem("offerIdForEdit");
                this.route.navigateByUrl("/app-myoffers");
                this.showMyOffer = true;
            }
        }, (err) => {
            this.loader = false;
        });
    };

    addNewAddress(inputText: any) {
        this.getCSC = [];
        this.fetchGeoCode = '';
        //this.removeSelectedAddress();
        if (inputText.length == 5 && regexPatterns.zipcodeRegex.test(inputText)) {
            // this.enterZipcode = false;
            // this.loaderLocation = true;
            // inputText.setAttribute('readonly', true);
            this.getoffers.getLocation(inputText)
                .subscribe(data => {

                    //this.loaderLocation = false;
                    //   input.removeAttribute('readonly');
                    if (data.results.length != 0) {
                        this.fetchGeoCode = data.results[0].formatted_address;
                        this.getCSC.push({
                            "zipcode": inputText.trim(),
                            "country": this.fetchGeoCode.split(',')[2].trim(),
                            "state": this.fetchGeoCode.split(',')[1].trim().split(" ")[0].trim()
                        });
                        this.selectAddress(this.getCSC[0]);
                    }
                    else {

                    }
                });

        }
        else {
            //this.enterZipcode = true;
        }
    };

    signOut(event) {
        this.core.LoungeShowHide();
        this.questionPopUps = [];
        this.conversations.push(new Conversation(MsgDirection.Out, "Sign out"));
        this.questionPopUps.push(new QuestionPopUp('log in'));
        this.questionPopUps.push(new QuestionPopUp('sign up'));
    }

    signIn(event) {
        this.core.LoungeShowHide();
        this.showMultipleFeatures = false;
        this.showMultipleTypes = false;
        this.showAvailableFeature = false;
        this.showAvailableTypes = false;
        this.showAvailablesubcat = false;
        this.questionPopUps = [];
        this.conversations.push(new Conversation(MsgDirection.Out, "Sign in"));
        this.questionPopUps.push(new QuestionPopUp('log in'));
        this.questionPopUps.push(new QuestionPopUp('sign up'));
        this.core.deactivateRouteFlagVal = false;
    }

    filterValue(value, append?: any) {
        return value.replace(/ /g, "").concat(append)
    }

    emailValidator() {
        // this.emptyEmailAddress = false;
        // this.invalidEmailAddress = false;
        // if (!this.append_Email) this.emptyEmailAddress = true;
        if (this.emailRegex.test(this.loginEmailId) == false) {
            // document.getElementsByClassName("emailIdValid")[0].classList.add("invalid"); 
            return false;
        }
        else {
            //document.getElementsByClassName("emailIdValid")[0].classList.remove("invalid"); 
            return true;
        }
    }

    passwordValidator(userInputChat) {
        if (this.passwordRegex.test(userInputChat) == false) return false;
        else return true;
    }

    openDatePicker() {
        setTimeout(
            () => {
                this.picker.open();
                document.getElementsByClassName("cdk-overlay-container")[0].classList.add("signupdob");
            },
            50
        );

    }

    scrollTo() {
        window.scrollTo(0, document.body.scrollHeight);
    }

    getShiName(shipmentName:any)
    {
        let deliveryCustom = shipmentName!=""?shipmentName.split(':'):[];
        if(deliveryCustom.length >1)
        {
            if(deliveryCustom[0] =='Custom')
            {
                // this.deliveryMethodCustomName =deliveryCustom[0];
                let minmaxArr=deliveryCustom[1].split('to');
                var regExp = /\(([^)]+)\)/;
                return deliveryCustom[0]+": " +Number(regExp.exec(minmaxArr[0])[1]) +" to "+  Number(regExp.exec(minmaxArr[1])[1]) +" business days"
            }
            else
            {
                return shipmentName;
            }
       
        
        }
        else
        {
        return shipmentName;
        }
    }
    ShowAddPartNumber()
    {
        this.showPartNumberSection = true;
        this.showMultipleFeatures = true;
        this.hidePartNumberData = false;
        document.getElementsByClassName("CUIpopup")[0].classList.add("pop_overlay");
        this.showAvailableFeature = false;
        this.deleteNoPreferenceFeature();
        this.deleteNoPreferenceType();
    }
    confirmPartNumber(featureObj: any, attrKey: any) {
        this.showPartNumberSection = false;
        // this.otherOptionValue = '';
        // var selectedfeatures = this.Step2SelectedValues.filter(i => i.key == featureObj.key)
        // let indexofNopreference;
        // this.core.inputNewOption = false;
        // this.core.footerSwapCUI(true, true);
        // if (selectedfeatures == undefined || selectedfeatures.length == 0) {
        //     return;
        // }
        // else {
        //     indexofNopreference = selectedfeatures.findIndex(obj => obj.values === "No Preference");
        //     if (indexofNopreference != -1) {
        //         this.Step2SelectedValues = this.Step2SelectedValues.filter(i => i.key != featureObj.key);
        //         this.Step2SelectedValues.push({
        //             key: featureObj.key,
        //             values: "No Preference"
        //         });
        //         selectedfeatures = this.Step2SelectedValues.filter(i => i.key == featureObj.key)
        //     }
        // }
        // this.NoPreferencechkunchk = [];
        // let multiConversation = "";
        // for (var i = 0; i < selectedfeatures.length; i++) {
        //     multiConversation += selectedfeatures[i].values + ', '
        // }
        // multiConversation = multiConversation.substring(0, multiConversation.length - 2);
        // this.conversations.push(new Conversation(MsgDirection.Out, multiConversation.replace(/(^,)|(,$)/g, "")));
        // this.findNextKeyItem(featureObj);
        // this.showAvailableFeature = true;
        // this.showMultipleFeatures = false;

    }
    closePartNumber() {
        this.showMultipleTypes = false;
        this.showAvailableFeature = true;
        this.showMultipleFeatures = false;
        this.showPartNumberSection = false;
        document.getElementsByClassName("CUIpopup")[0].classList.remove("pop_overlay");
        this.addNoPreferenceFeaturePosition();
    }

  async  chargeGuestAmount() {

    let productQuantityInStock = [];
    let checkInStock = [];

        let productAvailable: boolean = true;
        this.loader_chargeAmount = true;
        this.ProductCheckoutModal.orderItems = [];
        this.ProductCheckoutModal.customerId = this.selectedCardDetails.customerId;
        //this.ProductCheckoutModal.userId = this.userData.userId;
        this.ProductCheckoutModal.consumerEmail = this.user.email;
        this.ProductCheckoutModal.customerName = this.user.username;
        this.ProductCheckoutModal.firstName = this.user.username.split(' ')[0];
        this.ProductCheckoutModal.lastName = this.user.username.split(' ').length >1?this.user.username.split(' ')[1]:'';
        this.ProductCheckoutModal.address = new Address();
        this.ProductCheckoutModal.address = this.selectedAddressDetails;
        this.ProductCheckoutModal.purchasedDate = new Date();
        this.ProductCheckoutModal.source = 'card';
        this.ProductCheckoutModal.paymentFunding = this.selectedCardDetails.funding;
        this.ProductCheckoutModal.paymentSource = this.selectedCardDetails.cardType;
        this.ProductCheckoutModal.last4Digits = this.selectedCardDetails.last4Digit;
        this.ProductCheckoutModal.cardId = this.selectedCardDetails.cardId;
        this.ProductCheckoutModal.totalShipCost = this.finalShippingAmount ;
        this.ProductCheckoutModal.totalTaxCost = this.totalProductTax;
        this.ProductCheckoutModal.purchasedPrice = eval(`${this.totalProductTax + this.totalAmountFromCart + this.finalShippingAmount}`);
        this.ProductCheckoutModal.userType ="GUEST";
  
        this.avalaraId != undefined? this.ProductCheckoutModal.avalaraTaxId = this.avalaraId :this.ProductCheckoutModal.avalaraTaxId  = null;
        for (var i = 0; i < this.itemsInCart.length; i++) {
            let item = this.itemsInCart[i];
            let ordItems = new OrderItems();
            ordItems.productId = item.productId;
            ordItems.productName = item.productName;
            ordItems.retailerName = item.retailerName;
            ordItems.retailerId = item.retailerId;
            ordItems.productDescription = item.productDescription;
            ordItems.productImage = item.productImage;
            ordItems.productQuantity = item.quantity; 
            ordItems.productPrice = item.price; 
            ordItems.productTaxCost = item.productTaxCost; 
            ordItems.shippingCost = item.shippingCost; 
            ordItems.totalProductPrice = eval(`${item.price * item.quantity}`); 
            ordItems.deliveryMethod = item.deliveryMethod; 
            ordItems.productUPCCode = item.productUPCCode; 
            ordItems.productSKUCode = item.productSKUCode; 
            ordItems.orderFrom = item.orderFrom; 
            ordItems.productHierarchy = item.productHierarchy; 
            ordItems.productAttributes = item.productAttributes;
            ordItems.channelAdviosorProductSku = item.channelAdviosorProductSku;
            ordItems.channelAdviosorRetailerSku = item.channelAdviosorRetailerSku;
            ordItems.leadTimeToShip = parseInt(item.leadTimeToShip);
            //new OrderItems(item.productId, item.productName, item.retailerName, item.retailerId, item.productDescription, item.productImage, item.quantity, item.price, item.productTaxCost, item.shippingCost, eval(`${item.price * item.quantity}`), item.deliveryMethod, item.productUPCCode, item.productSKUCode, item.orderFrom, item.productHierarchy, item.productAttributes)
            this.ProductCheckoutModal.orderItems.push(ordItems);
        };
        console.log(this.ProductCheckoutModal);
        for (var i = 0; i < this.itemsInCart.length; i++) {
            let item = this.itemsInCart[i];
            this.checkout.productGuestAvailability(item.productId).subscribe((res) => {
                if (res.quantity == 0) {
                  productAvailable = false;
                  this.confirmValidationMsg.message = res.productName + " is currently out of stock. Please update your cart.";
                  this.core.openModal(this.checkoutModal);
                  this.loader_chargeAmount = false;
                  return false;
                }
                else {
                  productQuantityInStock.push({
                    productName: item.productName,
                    quantity: res.quantity,
                    productId: res.productId
                  });
                }
              });
        }
        setTimeout(() => {
            setTimeout(() => {
              /*Proceed to checkout if quantity available*/
              if (productAvailable) {
                for (var i = 0; i < productQuantityInStock.length; i++) {
                  let product = productQuantityInStock[i];
                  for (var j = 0; j < this.itemsInCart.length; j++) {
                    let item = this.itemsInCart[j];
                    if (product.productId == item.productId) {
                      if (product.quantity >= item.inStock) {
                        this.itemsInCart[j].inStock = product.quantity;
                        this.itemsInCart[j]['availability'] = true;
                        checkInStock.push(true);
                      }
                      else {
                        this.itemsInCart[j].inStock = product.quantity;
                        this.itemsInCart[j]['availability'] = false;
                        checkInStock.push(false);
                        this.showUnAvailableItems.push(item.productName)
                      }
                    }
                  }
                }
                this.conversations.push(new Conversation(MsgDirection.In, "Please wait while we place your order..."));
                this.checkout.chargeGuestAmount(this.ProductCheckoutModal).subscribe((res) => {
                  this.paymentSuccessfullMsg = res;
                  this.loader_chargeAmount = false;
                  if(this.paymentSuccessfullMsg.includes("Glad you found what you want"))
                  {
                    this.paymentSuccessfullMsg = "Thanks, glad you found what you want! We’ll send your order confirmation shortly, and will let you know as soon as your order ships."
                    this.core.openModal(this.checkoutConfirmModal);
                    /* Deleting Items from Cart */
                   // this.mycart.deleteAllCartItem(this.userId).subscribe((res) => {
                      localStorage.removeItem('existingItemsInGuestCart');
                      this.route.navigateByUrl('/home');
                    // }, (err) => {
                    //   console.log("Error From Delete Items API")
                    // })
                  }
                  else
                  {
                    this.core.openModal(this.checkoutConfirmModal);
                    this.route.navigateByUrl('/home');
                  }
                  
                  /* Deleting Items from Cart */
                }, (err) => {
                  this.loader_chargeAmount = false;
                  console.log("Error From Place an Order API");
                })
              }
            }, 3000)
          }, 1000)
       
    }

   
    
}

