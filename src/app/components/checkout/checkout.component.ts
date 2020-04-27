import { Component, OnInit, ViewEncapsulation, ChangeDetectorRef, AfterViewInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CoreService } from '../../services/core.service';
import { NgForm } from '@angular/forms';
import { environment } from '../../../environments/environment';
import { StripeAddCardModel } from '../../models/StripeAddCard';
import { StripeCheckoutModal } from '../../models/StripeCheckout';
import { CheckoutService } from '../../services/checkout.service';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { GetCustomerCards } from '../../models/getCards';
import { CheckoutShippingAddress } from '../../models/checkoutShippingAddress';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ProductCheckout, Address, OrderItems } from '../../models/productCheckout';
import { MyAccountAddressModel } from '../../models/myAccountPost';
import { OrderListing, Orders, OrderCheckout, ProduDimention } from '../../models/orderListing';
import { filter } from 'rxjs/operator/filter';
import animateScrollTo from 'animated-scroll-to';
import { AvalaraTaxModel, shippingAddress, ItemsTaxModel, ItemsTaxList } from '../../models/tax';
import { CheckOutMessages } from './checkoutMessages';
import { regexPatterns } from '../../common/regexPatterns';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class CheckoutComponent implements OnInit, AfterViewInit, OnDestroy {
  addCard: boolean = false;
  itemsInCart: any;
  productTaxIIC: number;
  avalaraTaxModel = new AvalaraTaxModel();
  totalAmountFromCart: number;
  editShippingAddressForm: FormGroup;
  addShippingAddressForm: FormGroup;
  @ViewChild('cardInfo') cardInfo: ElementRef;
  @ViewChild('toBeCharged') toBeCharged: ElementRef;
  @ViewChild('confirmProcess') confirmProcess: ElementRef;
  AddressSaveModel = new MyAccountAddressModel();
  card: any;
  cardHandler = this.onChange.bind(this);
  error: string;
  loggedIn: boolean = false;
  loader: boolean = false;
  loader_chargeAmount: boolean = false;
  loader_productTax: boolean = false;
  stripeAddCard = new StripeAddCardModel();
  stripeCheckout = new StripeCheckoutModal();
  shippingAddressCheckout = Array<CheckoutShippingAddress>();
  ProductCheckoutModal = new ProductCheckout();
  selectedCardDetails: any;
  selectedAddressDetails: any;
  selectedMethodDetails: any;
  paymentSuccessfullMsg: any;
  shippingMethod: any;
  closeResult: string;
  userData: any;
  userId: string;
  getCardsDetails: any;
  loader_getCards: boolean = false;
  retailerReturnPolicy: string;
  showShippingMethod: boolean = false;
  loader_shippingMethod: boolean = false;
  customerId: string;
  editShippingAddressFormWrapper: boolean = false;
  addShippingAddressFormWrapper: boolean = false;
  addressFormData: any;
  retiailerShipIds = [];
  filteredCartItems = [];
  finalShippingAmount: number = 0;
  shippingLabels: string;
  shippingLabelsArr: Array<any>;
  lastLabel: number;
  cardNumber: any;
  cardExpiry: any;
  cardCvc: any;
  cardZip: any;
  @ViewChild('cardNumber') cardNumberInfo: ElementRef;
  @ViewChild('cardExpiry') cardExpiryInfo: ElementRef;
  @ViewChild('cardCvc') cardCvcInfo: ElementRef;
  @ViewChild('cardZip') cardZipInfo: ElementRef;
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
  totalProductTax: number = 0;
  getStates: any;
  confirmProcessMessage: string;
  checkOutMessages = CheckOutMessages;
  showUnAvailableItems = [];
  @ViewChild('checkoutModal') checkoutModal: ElementRef;
  @ViewChild('deleteCardModal') deleteCardModal: ElementRef;
  confirmValidationMsg = { label: '', message: '' };
  saveCardDetails: any;
  orderCheckout:OrderCheckout;
  produDimention:ProduDimention;
  ifNoDeliveryMethod: boolean = false;
  constructor(
    public core: CoreService,
    private cd: ChangeDetectorRef,
    private checkout: CheckoutService,
    private modalService: NgbModal,
    private formBuilder: FormBuilder,
    private route: Router
  ) { }

  async ngOnInit() {
    this.core.checkIfLoggedOut(); /*** If User Logged Out*/
    this.core.hide();
    this.core.searchMsgToggle();
    if (window.localStorage['existingItemsInCart'] != undefined) this.itemsInCart = JSON.parse(window.localStorage['existingItemsInCart']);
    if (window.localStorage['userInfo'] == undefined) this.itemsInCart = JSON.parse(window.localStorage['existingItemsInGuestCart']);
    if (window.localStorage['TotalAmount'] != undefined) this.totalAmountFromCart = parseFloat(window.localStorage['TotalAmount']);
    if (window.localStorage['userInfo'] != undefined) {
      this.userData = JSON.parse(window.localStorage['userInfo']);
      this.userId = this.userData.userId;
      this.getCards();
      this.loadShippingAddress();
      
    }

    if (window.localStorage['userInfo'] == undefined) {

    }
    
    this.getRetailerIds();
    this.filterShipiProfileId();
    this.filteritemsInCart();
    
  }

  ngAfterViewInit() {
    const elementStyles = {
      base: {
        color: '#000',
        fontWeight: 600,
        fontFamily: 'Quicksand, Open Sans, Segoe UI, sans-serif',
        fontSize: '16px',
        fontSmoothing: 'antialiased',

        ':focus': {
          color: '#424770',
        },

        '::placeholder': {
          color: '#9BACC8',
        },

        ':focus::placeholder': {
          color: '#CFD7DF',
        },
      },
      invalid: {
        color: '#FA755A',
        ':focus': {
          color: '#FA755A'
        },
        '::placeholder': {
          color: '#FFCCA5',
        },
      },
    };

    const elementClasses = {
      focus: 'focus',
      empty: 'empty',
      invalid: 'invalid',
    };

    // this.cardNumber = elements.create('cardNumber', { style: elementStyles, classes: elementClasses, });
    // this.cardExpiry = elements.create('cardExpiry', { style: elementStyles, classes: elementClasses, });
    // this.cardCvc = elements.create('cardCvc', { style: elementStyles, classes: elementClasses, });
    // this.cardZip = elements.create('postalCode', { style: elementStyles, classes: elementClasses, placeholder: 'Zipcode', });
    // this.cardNumber.mount(this.cardNumberInfo.nativeElement);
    // this.cardExpiry.mount(this.cardExpiryInfo.nativeElement);
    // this.cardCvc.mount(this.cardCvcInfo.nativeElement);
    // this.cardZip.mount(this.cardZipInfo.nativeElement);
    // this.cardNumber.addEventListener('change', ({ brand }) => {
    //   if (brand) {
    //     this.setBrandIcon(brand);
    //   }
    // });
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
    this.cardNumber !=undefined? this.cardNumber.destroy():"";
    this.cardExpiry !=undefined? this.cardExpiry.destroy():"";
    this.cardCvc !=undefined? this.cardCvc.destroy():"";
    this.cardZip !=undefined? this.cardZip.destroy():"";
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
          filterItems.orderItems.push(new Orders(item.inStock, item.price, item.productDescription, item.productId, item.productImage, item.productName, item.quantity, item.shipProfileId, 0, item.taxCode))
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
    //Remove Duplicates from Main Array

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

  getCards() {
    this.loader_getCards = true;
    this.checkout.getCards(this.userId).subscribe((res) => {
      this.getCardsDetails = [];
      this.loader_getCards = false;
      if (res.length > 0) {
        this.customerId = res[0].customerId;
        for (var i = 0; i < res.length; i++) {
          this.getCardsDetails.push(new GetCustomerCards(res[i].userId, res[i].customerId, res[i].last4Digits, res[i].cardType, res[i].funding, res[i].cardId, res[i].cardHoldersName))
        }
      }
    });
  }

  loadShippingAddress() {
    this.checkout.getShippingAddress(this.userData.userId).subscribe((res) => {
      for (var i = 0; i < res.address.length; i++) {
        let address = res.address[i];
        if (address.addressType === 'shippingAddress') {
          this.shippingAddressCheckout.push(new CheckoutShippingAddress(address.addID, address.addressLine1, address.addressLine2, address.city, address.state, address.zipcode, address.addressType))
        }
      }
    })
  }

  getAllStates() {
    if (this.getStates == undefined) {
      this.checkout.getAllStates().subscribe((res) => {
        this.getStates = res.stateAbbreviation;
      })
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
        addZipcode: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(5), Validators.pattern(regexPatterns.zipcodeRegex)]]
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

  addEditSave(addressForm, toDo) {
    if (toDo == 'edit') {
      for (var i = 0; i < this.shippingAddressCheckout.length; i++) {
        if (this.shippingAddressCheckout[i].addID == this.addressFormData.addID) {
          this.shippingAddressCheckout[i].addressLine1 = this.editShippingAddressForm.controls.editAddressLineOne.value;
          this.shippingAddressCheckout[i].addressLine2 = this.editShippingAddressForm.controls.editAddressLineTwo.value;
          this.shippingAddressCheckout[i].city = this.editShippingAddressForm.controls.editCity.value;
          this.shippingAddressCheckout[i].state = this.editShippingAddressForm.controls.editState.value;
          this.shippingAddressCheckout[i].zipcode = this.editShippingAddressForm.controls.editZipcode.value;
        }
      }
      this.AddressSaveModel.emailId = this.userData.emailId;
      this.AddressSaveModel.userId = this.userData.userId;
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
    else {
      this.shippingAddressCheckout.push(new CheckoutShippingAddress(null, this.addShippingAddressForm.controls.addAddressLineOne.value, this.addShippingAddressForm.controls.addAddressLineTwo.value, this.addShippingAddressForm.controls.addCity.value, this.addShippingAddressForm.controls.addState.value, this.addShippingAddressForm.controls.addZipcode.value, 'shippingAddress'))
      this.AddressSaveModel.emailId = this.userData.emailId;
      this.AddressSaveModel.userId = this.userData.userId;
      this.AddressSaveModel.address = this.shippingAddressCheckout;
      this.addShippingAddressFormWrapper = false;
      this.checkout.addEditShippingAddress(this.AddressSaveModel).subscribe((res) => {
        window.localStorage['userInfo'] = JSON.stringify(res);
      }, (err) => {
        console.log(err);
      });
    }
  }

  cancelAddress(address, toDo) {
    if (toDo == 'edit') this.editShippingAddressForm.reset();
    else this.addShippingAddressForm.reset();
    this.editShippingAddressFormWrapper = false;
    this.addShippingAddressFormWrapper = false;
  }

  selectShippingAddress(e, address) {
    this.loader_shippingMethod = true;
    this.showShippingMethod = false;
    this.finalShippingAmount =0;
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
    element.classList.remove("categ_outline_gray");
    element.classList.add("categ_outline_red");
    this.selectedAddressDetails = address;
    let resShippingResponse = [];

   
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
      this.checkout.getShippingMethodsOnAddress(this.orderCheckout).subscribe((res) => {
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
                this.ifNoDeliveryMethod = false;
                if (this.filteredCartItems[i].differentShippingMethod) {
                  this.filteredCartItems[i].orderItems[j].deliveryTiers = res.deliveryMethods;
                  this.filteredCartItems[i].orderItems[j].locationFee = locationFee;
                  this.filteredCartItems[i].orderItems[j].noDeliveryMessage = res.noDeliveryMessage;
                  this.filteredCartItems[i].orderItems[j].noDeliveryMethod =  res.noDeliveryMethod;
                }
                else {

                  this.filteredCartItems[i].deliveryTiers = res.deliveryMethods;
                  this.filteredCartItems[i].locationFee = locationFee;
                  this.filteredCartItems[i].noDeliveryMessage = res.noDeliveryMessage;
                  this.filteredCartItems[i].noDeliveryMethod =  res.noDeliveryMethod;
                }
              }
            }
          }
        }
        if (this.filteredCartItems.length == resShippingResponse.length) {
          this.getTax(address, resShippingResponse);
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
    this.avalaraTaxModel.customerCode = this.userData.userId;
    let number = 0;
    for (var i = 0; i < this.filteredCartItems.length; i++) {
      let item = this.filteredCartItems[i];
      this.avalaraTaxModel.itemTax[item.retailerId] = new Array<ItemsTaxList>();
      for (var j = 0; j < this.filteredCartItems[i].orderItems.length; j++) {
        let order = this.filteredCartItems[i].orderItems[j]
        this.avalaraTaxModel.itemTax[item.retailerId].push(new ItemsTaxList(number++, order.quantity, order.price, order.productId, order.taxCode, "", "", "", order.shipProfileId))
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
      if (res.status !== 'Non taxable product') {
        this.totalProductTax = res.totalTax;
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

  getPerItemTotal(price, quantity) {
    return eval(`${price * quantity}`);
  }

  selectPayCard(e, card) {
    let allCards = document.getElementsByClassName("customerCards");
    for (var i = 0; i < allCards.length; i++) {
      if (allCards[i].classList.contains("categ_outline_red")) {
        allCards[i].classList.remove("categ_outline_red");
        allCards[i].classList.add("categ_outline_gray");
      }
    }
    let element = e.currentTarget;
    element.classList.remove("categ_outline_gray");
    element.classList.add("categ_outline_red");
    this.selectedCardDetails = card;
  }

  getSelectedValue(value) {
    this.lastLabel = parseFloat(value.split("-")[0].trim().split("$")[1].trim())
  }

  selectShippingMethod(e, value, item) {
    this.selectedMethodDetails = value;
    if (item.productId != undefined) {
      for (var i = 0; i < this.itemsInCart.length; i++) {
        if (item.productId == this.itemsInCart[i].productId) {
          this.itemsInCart[i].deliveryMethod = value.split("-")[1].trim();
          this.itemsInCart[i].shippingCost = parseFloat(value.split("-")[0].trim().split("$")[1].trim());
        }
      }
    }
    else {
      for (var i = 0; i < item.orderItems.length; i++) {
        let selectedItem = item.orderItems[i];
        for (var j = 0; j < this.itemsInCart.length; j++) {
          if (selectedItem.productId == this.itemsInCart[j].productId) {
            this.itemsInCart[j].deliveryMethod = value.split("-")[1].trim();
            this.itemsInCart[j].shippingCost = parseFloat(value.split("-")[0].trim().split("$")[1].trim());
          }
        }
      }
    }
    let getShippingCost = [];
    for (var i = 0; i < this.itemsInCart.length; i++) {
      let item = this.itemsInCart[i]
      if (item.shippingCost == undefined) getShippingCost.push(0);
      else getShippingCost.push(item.shippingCost);
    }
    this.finalShippingAmount = eval(getShippingCost.join("+"));
  }

  onChange({ error }) {
    if (error) {
      this.error = error.message;
    } else {
      this.error = null;
    }
    this.cd.detectChanges();
  }

  async onSubmit(form: NgForm) {
    this.error = null;
    this.loader = false;
    if (this.userData === undefined) this.error = "Please login to add new card";
    else if ((this.cardNumberInfo.nativeElement.classList.contains("invalid") || this.cardNumberInfo.nativeElement.classList.contains("empty"))
      || (this.cardExpiryInfo.nativeElement.classList.contains("invalid") || this.cardExpiryInfo.nativeElement.classList.contains("empty"))
      || (this.cardCvcInfo.nativeElement.classList.contains("invalid") || this.cardCvcInfo.nativeElement.classList.contains("empty"))
      || (this.cardZipInfo.nativeElement.classList.contains("invalid") || this.cardZipInfo.nativeElement.classList.contains("empty"))) {
      this.error = "Please complete all fields.";
      return false;
    }
    else {
      this.loader = true;
      const { token, error } = await stripe.createToken(this.cardNumber);
      if (error) this.loader = false;
      else {
        this.stripeAddCard.customer.email = this.userData.emailId;
        this.stripeAddCard.customer.source = token.id;
        this.stripeAddCard.userId = this.userId;
        this.stripeAddCard.customer.customerId = this.customerId;
        if (this.getCardsDetails.length > 0) this.updateCard(this.stripeAddCard);
        else {
          this.checkout.addCard(this.stripeAddCard).subscribe((res) => {
            this.loader = false;
            this.resetAddCard();
            this.getCards();
          });
        }
      }
    }
  }

  addNewCard() {
    this.addCard = !this.addCard;
    if (this.addCard) this.ngAfterViewInit();
    else this.resetAddCard();
  }

  resetAddCard() {
    this.addCard = false;
    this.error = null;
    this.ngOnDestroy();
    this.ngAfterViewInit();
  }

  updateCard(stripeAddCard) {
    this.checkout.updateCard(stripeAddCard).subscribe((res) => {
      this.loader = false;
      this.resetAddCard();
      this.getCards();
    });
  }

  confirmDeleteCard(card) {
    this.saveCardDetails = card;
    this.core.openModal(this.deleteCardModal);
  }

  deleteCard() {
    let card = this.saveCardDetails;
    this.loader_getCards = true;
    this.checkout.deleteCard(card.customerId, card.cardId).subscribe((res) => {
      this.getCards();
    })
  }

  calculateTotalPayable() {
    return eval(`${this.totalProductTax + this.totalAmountFromCart + this.finalShippingAmount}`)
  }

  /*chargeAmount() {
    let productQuantityInStock = [];
    let checkInStock = [];
    let proceed = false;
    if ((this.selectedAddressDetails || this.selectedCardDetails || this.selectedMethodDetails) == undefined) {
      this.confirmValidationMsg.message = "Please select a Shipping Address, Shipping Method and a Card";
      this.core.openModal(this.checkoutModal);
    }
    else if (this.selectedAddressDetails == undefined) {
      this.confirmValidationMsg.message = "Please select a Shipping Address";
      this.core.openModal(this.checkoutModal);
    }
    else if (this.selectedCardDetails == undefined) {
      this.confirmValidationMsg.message = "Please select a Card";
      this.core.openModal(this.checkoutModal);
    }
    else if (this.selectedMethodDetails == undefined) {
      this.confirmValidationMsg.message = "Please select a Shipping Method";
      this.core.openModal(this.checkoutModal);
    }
    else if (this.selectedMethodDetails != undefined) {
      var getAllSelects = document.getElementsByClassName("taxAmounts");
      for (var i = 0; i < getAllSelects.length; i++) {
        var selectedValue = getAllSelects[i] as HTMLSelectElement;
        if (selectedValue.selectedIndex == 0) {
          this.confirmValidationMsg.message = "Please select per product shipping methods";
          this.core.openModal(this.checkoutModal);
          return false
        }
      }
      proceed = true
    }
    if (proceed == true) {
      this.loader_chargeAmount = true;
      this.ProductCheckoutModal.orderItems = [];
      this.ProductCheckoutModal.customerId = this.selectedCardDetails.customerId;
      this.ProductCheckoutModal.userId = this.userData.userId;
      this.ProductCheckoutModal.consumerEmail = this.userData.emailId;
      this.ProductCheckoutModal.customerName = this.userData.firstName + ' ' + this.userData.lastName;
      this.ProductCheckoutModal.address = new Address();
      this.ProductCheckoutModal.address = this.selectedAddressDetails;
      this.ProductCheckoutModal.purchasedDate = new Date();
      this.ProductCheckoutModal.source = 'card';
      this.ProductCheckoutModal.paymentFunding = this.selectedCardDetails.funding;
      this.ProductCheckoutModal.paymentSource = this.selectedCardDetails.cardType;
      this.ProductCheckoutModal.last4Digits = this.selectedCardDetails.last4Digit;
      this.ProductCheckoutModal.totalShipCost = this.finalShippingAmount;
      this.ProductCheckoutModal.totalTaxCost = this.totalProductTax;
      this.ProductCheckoutModal.purchasedPrice = eval(`${this.totalProductTax + this.totalAmountFromCart + this.finalShippingAmount}`);
      for (var i = 0; i < this.itemsInCart.length; i++) {
        let item = this.itemsInCart[i]
        this.ProductCheckoutModal.orderItems.push(new OrderItems(item.productId, item.productName, item.retailerName, item.retailerId, item.productDescription, item.productImage, item.quantity, item.price, item.productTaxCost, item.shippingCost, eval(`${item.price * item.quantity}`), item.deliveryMethod, item.productUPCCode, item.productSKUCode))
      };
      console.log(this.ProductCheckoutModal);
      for (var i = 0; i < this.itemsInCart.length; i++) {
        let item = this.itemsInCart[i];
        this.checkout.productAvailability(item.productId).subscribe((res) => {
          productQuantityInStock.push({
            productName: item.productName,
            quantity: res.quantity,
            productId: res.productId
          });
        });
      }
      setTimeout(() => {
        setTimeout(() => {
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
          this.checkout.chargeAmount(this.ProductCheckoutModal).subscribe((res) => {
            this.paymentSuccessfullMsg = res;
            localStorage.removeItem('existingItemsInCart');
            this.loader_chargeAmount = false;
            this.route.navigateByUrl('/myorder');
          }, (err) => {
            this.loader_chargeAmount = false;
            console.log("Something went wrong");
          })
        }, 3000)
      }, 1000)
    }
  }*/

  showRetailerReturns(order) {
    this.retailerReturnPolicy = order.retailerReturns;
  }

  open(content) {
    this.modalService.open(content).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }

  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) return 'by pressing ESC';
    else if (reason === ModalDismissReasons.BACKDROP_CLICK) return 'by clicking on a backdrop';
    else return `with: ${reason}`;
  }

}