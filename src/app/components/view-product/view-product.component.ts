import { Component, OnInit, ViewEncapsulation, ViewChild, ElementRef } from '@angular/core';
import { CoreService } from '../../services/core.service';
import { AddToCart } from '../../models/addToCart';
import { Router, RouterOutlet, ActivatedRoute } from '@angular/router';
import { ViewProductService } from '../../services/viewProduct.service';
import { ReadReviewModel } from '../../models/readReviews';
import { environment } from '../../../environments/environment';
import animateScrollTo from 'animated-scroll-to';
import { BrowseProductsModal } from '../../models/browse-products';
import { SearchDataModal } from '../../models/searchData.modal';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { CurrencyPipe } from '@angular/common';
import { SaveGetCartItems } from '../../models/save-get-cart';
import { MyCartService } from '../../services/mycart.service';
@Component({
  selector: 'app-view-product',
  templateUrl: './view-product.component.html',
  styleUrls: ['./view-product.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class ViewProductComponent implements OnInit {
  selectedProduct: any;
  loader: boolean = false;
  addToCartModal = new AddToCart();
  quantity: any;
  inStock = [];
  productReviews = [];
  alreadyAddedInCart: boolean = false;
  s3 = environment.s3;
  userData: any;
  cartData = [];
  itemsInCartCheckout = [];
  noItemsInCart: boolean = false;
  fromMoveFunction: boolean = false;
  cartEmpty: boolean = false;
  @ViewChild('viewProductModal') viewProductModal: ElementRef;
  @ViewChild('loginSignUpModal') loginSignUpModal: ElementRef;

  @ViewChild('makeAnOfferAcceptModal') makeAnOfferAcceptModal: ElementRef;
  @ViewChild('acceptRejSection') acceptRejSection: ElementRef;
  @ViewChild('makeAnOfferChatModel') makeAnOfferChatModel: ElementRef;
  @ViewChild('contCheckoutSection') contCheckoutSection: ElementRef;
  
  confirmValidationMsg = { label: '', message: '' };
  dynamicColorData: any;
  dynamicSizeData: any;
  productListingModal = new BrowseProductsModal();
  unitValue: string;
  dynamicAttributeSize: Array<any>;
  dynamicAttributeColor: Array<any>;
  totalReviewSummary: any;
  retailerPolicy: string;
  fromES: boolean;
  attributeData = { selectedColor: [], selectedSizes: [] }
  callColorIfAvailable: number = 0;
  callReviewsAPI: number = 0;
  loaderQuantity: boolean = true;
  productId :any;
  dynamicAttributeData:any;
  dynamicAttributeLength: Array<any>;
  loadcalliftrue:boolean = false;
  clickCallCount =0;
  categoryId:any;
  categoryName:any;
  eskey : any;
  isFilterVal:any = '0';
  classArray:any=[];
  selectedClassArray:any=[];
  clickedSelectedVariations:any;
  prodAttributeArray:any=[];
  isLoadSimilarItemInternalCalled:boolean= false;
  makeOfferUserInput:any;
  token:any;
  makeOfferResponseOptions = { level: 0, name: '', data: [] };
  makeOfferData = {
    "options": [
      {
        "name": "Offer Value",
        "options": ["Product", "Order", "Account", "Shipping", "Using Kala", "Other"]
      }
    ]}
  isMakeABid:boolean = false;
  alreadyInvoked:boolean = false;
  makeABidMessages = [];
  makeofferValue:any;
  makeofferMaxValue:any;
  makeofferMinValue:any;
  makeofferResponse:any;
  makeofferValueError:boolean = false;
  checkOfferExistBefore:boolean = true;
  makeOfferCall = 1;
  makeofferForm: FormGroup;
  makeOfferErrorMsg='';
  lowestPriceError:boolean = false;
  isMakeOfferRejected : boolean = false;
  offerAlreadyAccepted : boolean = false;
  showOfferValue : boolean = false;
  inputOffer ="InputOffer";
  continueCheckout ="ContinueCheckout";
  acceptRejectOffer="AcceptRejectOffer";
  userResponse = { place: {}, type: {}, category: [], subcategory: {}, subType: {} };
  placeIconsUrl: string = "mykala-dev-images/product/Places/icon_";
  placeImageUrl: string = "mykala-dev-images/product/Places/";
  categoryImageUrl: string = "mykala-dev-images/product/Places/";
  selectionLevel: number = 1;
  constructor(
    public core: CoreService,
    private route: Router,
    private router : ActivatedRoute,
    private viewProduct: ViewProductService,
    private mycart: MyCartService,
    private formBuilder: FormBuilder
    ) {
    this.productId = router.snapshot.queryParams['productId'];
    this.isFilterVal = router.snapshot.queryParams['Isfilter'];
   }

  async ngOnInit() {
    this.core.checkIfLoggedOut(); /*** If User Logged Out*/
    this.core.hide();
    this.core.clearUser();
    this.core.hideUserInfo(true);
    this.core.searchMsgToggle();
    this.core.LoungeShowHide();
    this.core.footerSwap();
    this.core.resetSignInOutFlags();
    let appFooter = document.getElementsByClassName("footer")[0];
    appFooter.classList.remove("hideFooter");
    localStorage.removeItem("addedInCart");
    this.callColorIfAvailable = 1;
    if (window.localStorage['fromES'] != undefined) this.fromES = true;
    if (window.localStorage['userInfo'] != undefined && window.localStorage['token'] != undefined) this.userData = JSON.parse(window.localStorage['userInfo'])
    if( window.localStorage['token'] != undefined) this.token =  JSON.parse(window.localStorage['token']);
  
    //if (window.localStorage['selectedProduct'] != undefined) this.loadProductInfo(undefined);
    
    this.core.getDetails(this.productId).subscribe((res) => {

      const tile = new BrowseProductsModal(res);
      window.localStorage['selectedProduct'] = JSON.stringify(tile);
      if (window.localStorage['levelSelections']) {
        const updateStorage = JSON.parse(window.localStorage['levelSelections']);
        updateStorage.subType.id = tile.product.kalaUniqueId;
        updateStorage.subType.name = tile.product.productName;
        updateStorage.subType.text = tile.product.productName;
        updateStorage.subType.level = '5';
        window.localStorage['levelSelections'] = JSON.stringify(updateStorage);
        this.categoryId =  updateStorage.category.id;
        this.categoryName = updateStorage.category.name;
      }
      else
      {
        const selectedPDT = JSON.parse(window.localStorage['selectedProduct']);
        this.categoryId =  selectedPDT.product.productHierarchyWithIds.find(x => x.levelCount == 2).levelId;
        this.categoryName = selectedPDT.product.productHierarchyWithIds.find(x => x.levelCount == 2).levelName;
      }
      //this.route.navigateByUrl('/view-product?productId='+this.productId);
      this.loadProductInfo(undefined);
      if (window.localStorage['userInfo'] == undefined){
        this.itemsInGuestCart()
        }
      if (window.localStorage['existingItemsInCart'] != undefined) this.itemsInCart();
      // if (window.localStorage['existingItemsInGuestCart'] != undefined) this.itemsInGuestCart();
      if (this.selectedProduct.product.productImages) {
        this.selectedProduct.product.productImages.sort(function (x, y) {
          return (x.mainImage === y.mainImage) ? 0 : x.mainImage ? -1 : 1;
        });
      }
      //setTimeout(() => {
        this.defaultClassLastcall();
      // }, 2000);
    }, (err) => {
      localStorage.removeItem("selectedProduct");
      console.log(err)
    });

    
  }
  makeBidWithoutUser()
  {
    if (window.localStorage['token'] == undefined) {
      this.confirmValidationMsg.label = 'login';
      this.confirmValidationMsg.message = "You must be logged in as a member to make an offer. Do you want to log in now or create an account?";
      this.core.openModal(this.loginSignUpModal);
      this.core.getbackToMakeAnOffer = true;
      this.core.getbackToGetOffer = false;
      this.core.getbackToBuyProduct = false;
    }
  }
  noOfferOnLowestPrice()
  {
    this.makeOfferErrorMsg ='Make an Offer is unavailable for this product, as it’s already at the lowest allowable sale price.';
    setTimeout(() => {
      this.makeOfferErrorMsg ='';
    }, 5000);
  }

  makeBid()
  {
    if (window.localStorage['token'] == undefined) {
      this.confirmValidationMsg.label = 'login';
      this.confirmValidationMsg.message = "You must be logged in to make an offer! Do you want to login or sign up now?"
      this.core.openModal(this.loginSignUpModal);
      this.core.getbackToMakeAnOffer = true;
      this.core.getbackToGetOffer = false;
      this.core.getbackToBuyProduct = false;
      return;
    }
    if(!this.alreadyInvoked)
    {
      this.alreadyInvoked = true;
      this.makeOfferUserInput ="InputOffer";
      this.makeABidMessages.push({
        mainImage: '/consumer-app/assets/images/logo.png',
        from: 'Kala',
        message: 'Hi ' + this.userData.firstName + ', what price would you like to offer?'
      });
    }
    this.isMakeABid = true;
    setTimeout(() => {
      let InputOffer = document.querySelector('.makeOfferScroll') as HTMLElement
      animateScrollTo(InputOffer);
      document.getElementById("offerSection").style.display = this.isMakeABid ?"block":"none";

   
      //this.core.openModal(this.makeAnOfferChatModel);
      //let InputOffer = document.getElementById('offerSection');
      //InputOffer.scrollIntoView();
    }, 500);
    
  }
  closeMakeAnOffer()
  {
    document.getElementById("offerSection").style.display = "none";
    this.isMakeABid = false;
  
  }

  addClassBody() {
    let body = document.querySelector('body');
      body.classList.add('model_open')
  }

  removeClassBody() {
    let body = document.querySelector('body');
      body.classList.remove('model_open')
  }
  
  scrollOnOfferEnter()
  {
    var objDiv = document.getElementById("buyOfferSection");
   
      objDiv != null ? objDiv.scrollTop = objDiv.scrollHeight:{};
        
      let InputOffer = document.querySelector('.makeOfferScroll') as HTMLElement
      animateScrollTo(InputOffer);

  }
  
  
  makeanOffer(from?:any)
  {
    let body = document.querySelector('body');
      if(body.classList.contains('model_open')) {
        body.classList.remove('model_open')
      }
      
    if(from !='init' && (this.makeofferValue =='' || this.makeofferValue == undefined || this.makeofferValue == 0 ))
    {
      this.makeofferValueError = true;
      this.makeABidMessages.push({
        mainImage: '/consumer-app/assets/images/logo.png',
        from: 'Kala',
        message: 'Please enter a valid offer value'
      });

      //let InputOffer = document.getElementById('offerSection');
        //InputOffer.scrollIntoView();
        //let InputOffer = document.querySelector('.allowScroll') as HTMLElement
        //animateScrollTo(InputOffer);

      this.scrollToConversDev();
      return;
    }
    this.makeOfferUserInput ="";


    switch(from)
    {
      case 'confirmOfferValue':
      {
        this.makeABidMessages.push({
          mainImage: this.userData.consumerImagePath,
          from: 'User',
          message: parseFloat(this.makeofferValue).toLocaleString('en-US', { style: 'currency', currency: 'USD' })
        });
        setTimeout(() => {
          this.makeABidMessages.push({
            mainImage: '/consumer-app/assets/images/logo.png',
            from: 'Kala',
            message: 'Thanks! We’re sending your bid now.'
          });
          this.scrollToConversDev();
        }, 1500);
        
        this.showOfferValue = true;
      }
      break;
      default:
      {

      }
    }
   
    this.lowestPriceError = false;
    this.makeofferValueError = false;
    this.isMakeOfferRejected = false;
    //this.makeofferResponse = undefined;
    setTimeout(() => {
      if(from != 'init')
      {
      this.checkOfferExistBefore = false;
      }
      if(this.selectedProduct != undefined && this.selectedProduct.product.lowestPrice < this.selectedProduct.product.kalaPrice && this.selectedProduct.product.lowestPrice < this.selectedProduct.product.retailPrice)
      {
        this.core.getOfferMakeAnOffer(this.productId,this.userData.userId,this.makeOfferCall,this.makeofferValue,this.checkOfferExistBefore).subscribe((respnse) => {
          console.log(respnse);
          this.makeofferResponse = respnse;
          if(from != 'init')
          {
            if(this.makeofferResponse.offerRejected)
            {
              this.isMakeOfferRejected = true;
              this.makeABidMessages.push({
                mainImage: '/consumer-app/assets/images/logo.png',
                from: 'Kala',
                message: 'Sorry, we can’t go quite that low. Please enter a higher offer amount.'
              });
              //this.showOfferValue = false;
              this.makeOfferUserInput = "InputOffer";
              this.scrollToConversDev();
             
            }
            if(this.makeofferResponse.offerAcceptedType == 'OfferPriceGTKalaPrice' )
            {
              this.makeOfferUserInput ="AcceptRejectOffer";
              setTimeout(() => {
                this.acceptRejSection!=undefined?this.acceptRejSection.nativeElement.focus():{};
              }, 1500);
              this.makeABidMessages.push({
                mainImage: '/consumer-app/assets/images/logo.png',
                from: 'Kala',
                message: 'Looks like we can give you an even better price. How does '+ this.makeofferResponse.offerPrice.toLocaleString('en-US', { style: 'currency', currency: 'USD' })+' sound?'
              });
              
              this.showOfferValue = false;
              
            } 
            if(this.makeofferResponse.offerAcceptedType == 'OfferPriceEQKalaPrice' )
            {
            // this.makeOfferUserInput ="AcceptRejectOffer";
              this.makeABidMessages.push({
                mainImage: '/consumer-app/assets/images/logo.png',
                from: 'Kala',
                message: 'Great news! Your offer has been accepted.'
              });
              setTimeout(() => {
                this.makeABidMessages.push({
                  mainImage: '/consumer-app/assets/images/logo.png',
                  from: 'Kala',
                  message: 'Would you like to checkout now or continue shopping?'
                });
                this.makeOfferUserInput ="ContinueCheckout";
                this.showOfferValue = false;
                setTimeout(() => {
                  this.contCheckoutSection!=undefined?this.contCheckoutSection.nativeElement.focus():{};
                  this.scrollToConversDev();
                }, 1500);
              }, 1500);

            } 
            if(this.makeofferResponse.offerAcceptedType == 'OfferPriceGTMidPrice' )
            {
              this.makeABidMessages.push({
                mainImage: '/consumer-app/assets/images/logo.png',
                from: 'Kala',
                message: 'Great news! Your offer has been accepted.'
              });
              setTimeout(() => {
                this.makeABidMessages.push({
                  mainImage: '/consumer-app/assets/images/logo.png',
                  from: 'Kala',
                  message: 'Would you like to checkout now or continue shopping?'
                });
                this.makeOfferUserInput ="ContinueCheckout";
                this.showOfferValue = false;
                setTimeout(() => {
                  this.contCheckoutSection!=undefined?this.contCheckoutSection.nativeElement.focus():{};
                  this.scrollToConversDev();
                }, 1500);
              }, 1500);
             
            }

            if(this.makeofferResponse.offerAcceptedType == 'OfferPriceLTMidPrice' )
            {
              this.makeOfferUserInput ="AcceptRejectOffer";
              setTimeout(() => {
                this.acceptRejSection!=undefined?this.acceptRejSection.nativeElement.focus():{};
              }, 1500);
              this.makeABidMessages.push({
                mainImage: '/consumer-app/assets/images/logo.png',
                from: 'Kala',
                message: 'That offer was a little low, but we can make you an offer of '+ this.makeofferResponse.offerPrice.toLocaleString('en-US', { style: 'currency', currency: 'USD' }) +' Would you like to accept that?'
              });
              this.showOfferValue = false;
              this.scrollToConversDev();
            } 
            
            if(this.makeofferResponse.offerAcceptedType == 'OfferPriceEQLowestPrice' )
            {
              this.makeOfferUserInput ="AcceptRejectOffer";
              setTimeout(() => {
                this.acceptRejSection!=undefined?this.acceptRejSection.nativeElement.focus():{};
              }, 1500);
              this.makeABidMessages.push({
                mainImage: '/consumer-app/assets/images/logo.png',
                from: 'Kala',
                message: 'That offer was still a little too low, but we can make you an offer of '+ this.makeofferResponse.offerPrice.toLocaleString('en-US', { style: 'currency', currency: 'USD' }) +' Would you like to accept that?'
              });
              this.showOfferValue = false;
              this.scrollToConversDev();
            }

            if(this.makeofferResponse.offerAcceptedType == 'KALAVALUE' )
            {
              this.makeOfferUserInput ="AcceptRejectOffer";
              this.acceptRejSection!=undefined?this.acceptRejSection.nativeElement.focus():{};
              this.makeABidMessages.push({
                mainImage: '/consumer-app/assets/images/logo.png',
                from: 'Kala',
                message: 'Looks like we can give you an even better price. How does '+this.makeofferResponse.offerPrice.toLocaleString('en-US', { style: 'currency', currency: 'USD' })+' sound?'
              });
              this.showOfferValue = false;
              this.scrollToConversDev();
            // return;
            }
          }
          else if(from == 'init')
          {
            if(this.core.getbackToMakeAnOffer && (this.makeofferResponse != undefined && this.makeofferResponse.offerMade == false)){
              setTimeout(() => {
                this.makeBid();
                this.core.getbackToMakeAnOffer = false;
                this.core.getbackToGetOffer = false;
                this.core.getbackToBuyProduct = false;
              }, 1000);
            }
            else
            {
              this.core.getbackToMakeAnOffer = false;
              this.core.getbackToGetOffer = false;
              this.core.getbackToBuyProduct = false;
            }
          }
          

          this.scrollToConversDev();
          this.makeOfferCall++;
        }, (err) => {
          localStorage.removeItem("selectedProduct");
          console.log(err)
        });
      }
      else
      {
        this.lowestPriceError = true;
      }
      }, 3500);
      
  }
  scrollToConversDev()
  {
    var objDiv = document.getElementById("conversationScroll");
    setTimeout(() => {
        if(objDiv != null && objDiv != undefined)
        {
          objDiv.scrollTop = objDiv.scrollHeight + 60 ;
        }
      }, 500);
  }
  
  toBrowseProdFromMakeOffer(selectedProduct:any)
  {
    this.makeABidMessages.push({
      mainImage: this.userData.consumerImagePath,
      from: 'User',
      message: 'continue shopping'
    });
    this.scrollToConversDev();
    setTimeout(() => {
      this.makeABidMessages.push({
        mainImage: '/consumer-app/assets/images/logo.png',
        from: 'Kala',
        message: 'Ok great…we added this item to your cart whenever you’re ready to checkout.'
      });
      this.scrollToConversDev();
      setTimeout(() => {
        this.makeABidMessages.push({
          mainImage: '/consumer-app/assets/images/logo.png',
          from: 'Kala',
          message: 'We’ll hold your offer for the next 24 hours.'
        });
        this.scrollToConversDev();
        if(!this.offerAlreadyAccepted)
          this.addToCart('continueShopping');
        else
        {
          setTimeout(() => {
            this.navigateToBrowse(this.selectedProduct);
          }, 4000);
        }
      }, 1500);
      
    }, 1500);
   
    
    
  }
  toElasticFromMakeOffer(selectedProduct:any)
  {
    this.makeABidMessages.push({
      mainImage: this.userData.consumerImagePath,
      from: 'User',
      message: 'continue shopping'
    });
    this.scrollToConversDev();
    setTimeout(() => {
      this.makeABidMessages.push({
        mainImage: '/consumer-app/assets/images/logo.png',
        from: 'Kala',
        message: 'Ok great…we added this item to your cart whenever you’re ready to checkout.'
      });
      this.scrollToConversDev();
      setTimeout(() => {
        this.makeABidMessages.push({
          mainImage: '/consumer-app/assets/images/logo.png',
          from: 'Kala',
          message: 'We’ll hold your offer for the next 24 hours.'
        });
        this.scrollToConversDev();
        if(!this.offerAlreadyAccepted)
          this.addToCart('continueShopping');
        else
        {
          setTimeout(() => {
            if (window.localStorage['esKeyword'] != undefined) {
              this.eskey = JSON.parse(window.localStorage['esKeyword']).text;
              this.route.navigateByUrl('/elastic-product?search=' + this.eskey.replace(/ /g, "-") +"&IsFilter=" + this.isFilterVal);
            }
            else
            {
              this.eskey = JSON.parse(window.localStorage['searchKeyword']).text;
              this.route.navigateByUrl('/elastic-product?search=' + this.eskey.replace(/ /g, "-"));
            }
          }, 2000);
           
        }
      }, 1500);
      
    }, 1500);
    
   
   
   
  }
  navigateToBrowse(selectedProduct:any)
  {
    let selectedTilesData;
    if(window.localStorage['levelSelections'] != undefined)
    {
      selectedTilesData = JSON.parse(window.localStorage['levelSelections']);
    }
 
    let url = ('/browse-product?category='+ encodeURIComponent(selectedTilesData.category.name) + '&catId='+ selectedTilesData.category.id+ '&subCategory='+encodeURIComponent(selectedTilesData.subcategory.name) + '&subCatId='+ selectedTilesData.subcategory.id + '&viewAll=' + true +"&IsFilter=" + this.isFilterVal );
    this.route.navigateByUrl('/', {skipLocationChange: true})
      .then(()=>this.route.navigateByUrl(url));
    
  }
  
  navigateToElastic(selectedProduct:any)
  {
    if (window.localStorage['esKeyword'] != undefined) {
      this.eskey = JSON.parse(window.localStorage['esKeyword']).text;
      this.route.navigateByUrl('/elastic-product?search=' + this.eskey.replace(/ /g, "-") +"&IsFilter=" + this.isFilterVal);
    }
    else
    {
      this.eskey = JSON.parse(window.localStorage['searchKeyword']).text;
      this.route.navigateByUrl('/elastic-product?search=' + this.eskey.replace(/ /g, "-"));
    }

  }

  loadProductInfo(fromInternalAPI?: any,from?:any) {
    this.selectedProduct = JSON.parse(window.localStorage['selectedProduct']);
    this.makeofferValue = parseFloat(this.selectedProduct.product.kalaPrice).toFixed(2);
    this.makeofferMaxValue = parseFloat(this.selectedProduct.product.kalaPrice) + 100;
    this.makeofferMinValue =0;// this.selectedProduct.product.kalaPrice - 1 <=0 ? this.selectedProduct.product.kalaPrice:this.selectedProduct.product.kalaPrice - 1;
    if (this.callReviewsAPI == 1) this.loadReviewsSummary(this.selectedProduct.product.kalaUniqueId);
    this.loadRetailerPolicy(this.selectedProduct.product.retailerId);
    if (this.selectedProduct.product.productImages) {
      this.filterIamgeURL();
      this.getMainImage();
    }
    this.getStockNumber();
    if (this.callReviewsAPI == 1) this.getReviews(this.selectedProduct.product.kalaUniqueId);
    if (this.selectedProduct.product.attributes != undefined && this.selectedProduct.product.attributes != {}) {
      if (this.selectedProduct.product.attributes.Color != undefined && this.selectedProduct.product.attributes.Size != {}) {
        this.loadAttributes(this.selectedProduct.product.attributes, fromInternalAPI,from);
      }
      else {
        this.loadAttributes(this.selectedProduct.product.attributes, undefined,from);
      }
    }
    if (this.callReviewsAPI == 1) this.getItBy(this.selectedProduct.product.shipProfileId);
    this.makeofferValue =  parseFloat(this.selectedProduct.product.kalaPrice).toFixed(2);
    this.makeofferMaxValue =parseFloat(this.selectedProduct.product.kalaPrice) + 100;
    this.makeofferMinValue = 0;//this.selectedProduct.product.kalaPrice - 1 <=0 ? this.selectedProduct.product.kalaPrice:this.selectedProduct.product.kalaPrice - 1;
    if(this.userData != undefined)
        this.makeanOffer('init');
  }

  getItBy(shippingProfileId) {
    this.viewProduct.getItBy(shippingProfileId).subscribe((res) => {
      this.selectedProduct.product.deliveryMethod = this.getDeliveryDate(res, new Date())
    }, (err) => {
      console.log(err);
    })
  }

  loadReviewsSummary(productId) {
    this.totalReviewSummary = '';
    this.viewProduct.getReviewsSummary(productId).subscribe((res) => {
      if (res.length > 0) {
        this.totalReviewSummary = res[0];
        this.totalReviewSummary.average = parseInt(this.totalReviewSummary.avg);
        this.totalReviewSummary.left = eval(`${5 - this.totalReviewSummary.average}`);
        setTimeout(() => this.appendRatings(), 100);
      }
    }, (err) => {
      console.log(err);
    })
  }

  loadRetailerPolicy(retailerId) {
    this.viewProduct.getRetailerPolicy(retailerId).subscribe((res) => {
      this.retailerPolicy = res.returnPolicy;
    }, (err) => {
      console.log(err);
    })
  }

  async loadAttributes(attributesData, fromInternalAPI?: any,from?:any) {
    this.filterAttributes(attributesData);
    if (fromInternalAPI == undefined) {
      let res =await this.viewProduct.getDynamicAttributes(this.selectedProduct, this.selectedProduct.product.attributes.Length,from);
      if(res != undefined)
      {
        this.dynamicAttributeData = res;
        await this.defaultClassDynamic(from);
        await this.defaultClassLastcall();
      }
    }
    else this.defaultClassDynamic();
  }

  filterAttributes(attributesData) {
    let attributes = [];
    for (var key in attributesData) {
      //if (key == 'Unit') { this.unitValue = attributesData[key] }
     // else 
     {
        if (key == 'Color' && attributesData[key].indexOf(';') > -1) {
          attributesData[key] = attributesData[key].split(";").join(",");
        }
        attributes.push({
          key: key,
          value: attributesData[key]
        })
      }
    }
    //if (this.selectedProduct.product.units && this.selectedProduct.product.units != {}) this.unitValue = this.selectedProduct.product.units['Size']
    if (this.selectedProduct.product.units && this.selectedProduct.product.units != {}) {
      for (let key in this.selectedProduct.product.units) {
        attributes.map((x) => {
          if (key === x.key) {
            this.unitValue = this.selectedProduct.product.units[key];
            x.key = x.key + ' ' + '(' + this.selectedProduct.product.units[key] + ')';
          }
        })
      }
    }
    attributes.filter((x) => {
      if (x.key == 'Features') {
        x.value = x.value.filter((x) => x !== "");
        if (x.value.length == 0) attributes = attributes.filter(p => p.key != x.key)
      }
    })
    this.selectedProduct.product.filteredAttr = attributes;
  }

  async loadSimilarItems(e, data, from) {
    let lastAttribute;
    this.selectedClassArray = [];
    let alreadyPushedInOrder = false;
    this.clickedSelectedVariations = this.dynamicAttributeData.selectedVariations[from];
    window.localStorage['clickedSelectedVariations'] = JSON.stringify(this.clickedSelectedVariations);
    for (var i = 0; i < this.classArray.length; i++) {
     
      
      let dataValue = this.classArray[i].dataValue;
     let dataKey =  this.classArray[i].dataKey;
      for (let j = 0; j < dataValue.length; j++) {
        if (from == this.classArray[i].dataKey && dataValue[j].classList.contains('categ_outline_red'))
        {
          lastAttribute = dataValue[j].innerHTML;
        }
        if(data != undefined)
        {
          lastAttribute = data;
        }
        if ( dataValue[j].classList.contains('categ_outline_red')) {
          if(lastAttribute != dataValue[j].innerHTML && !alreadyPushedInOrder && from != dataKey)
          {
           
            this.selectedClassArray.push({innerhtml:dataValue[j].innerHTML,key:this.classArray[i].dataKey,value:this.classArray[i].dataValue});

          }
          else if(lastAttribute == dataValue[j].innerHTML)
          {
            alreadyPushedInOrder = true;
            this.selectedClassArray.push({innerhtml:dataValue[j].innerHTML,key:this.classArray[i].dataKey,value:this.classArray[i].dataValue});
          }
        }
        if(lastAttribute == dataValue[j].innerHTML && !alreadyPushedInOrder)
        {
          alreadyPushedInOrder = true;
          this.selectedClassArray.push({innerhtml:dataValue[j].innerHTML,key:this.classArray[i].dataKey,value:this.classArray[i].dataValue});
        }
        
        let existcount = this.selectedClassArray.filter(x => x.key === from);
        if(existcount.length <= 0 && alreadyPushedInOrder && this.classArray[i].dataKey == from)
        {
          this.selectedClassArray.push({innerhtml:dataValue[j].innerHTML,key:this.classArray[i].dataKey,value:this.classArray[i].dataValue});
        }

        dataValue[j].classList.remove("categ_outline_red");
        dataValue[j].classList.remove("unavailable");
        dataValue[j].classList.add("categ_outline_gray");
        dataValue[j].classList.remove("categ_outline_redd");
       
      }
        
    }
    //Get Product
   let res =await this.viewProduct.getProductDetails(this.selectedProduct, data, from, lastAttribute,this.selectedClassArray);
   if(res != undefined)
   {
      this.productListingModal = new BrowseProductsModal(res);
      window.localStorage['selectedProduct'] = JSON.stringify(this.productListingModal);
      this.loadProductInfo('fromInternalAPI',from);
      if (window.localStorage['existingItemsInCart'] != undefined) this.itemsInCart();
      this.selectedProduct.product.productImages.sort(function (x, y) {
        return (x.mainImage === y.mainImage) ? 0 : x.mainImage ? -1 : 1;
      });
    }
  

  let response = await this.viewProduct.getDynamicAttributes(this.selectedProduct, data, from, lastAttribute,this.selectedClassArray);
  
  if(response != undefined)
  {
      //this.attributeData.selectedColor = response.selectedColor;
      //this.attributeData.selectedSizes = response.selectedSizes;
      this.dynamicAttributeData = response;
      this.dynamicAttributeData.selectedVariations[from] = JSON.parse(window.localStorage['clickedSelectedVariations']);
      let element = document.getElementsByClassName('data_'+from);
      let dataa = [];
      this.defaultClassDynamic(from);
      setTimeout(() => {
      this.filterAttribute(element, lastAttribute, [],[], dataa, from);
      this.defaultClassLastcall();
      }, 1000);
  }
   
  }
  async loadSimilarItemInternal(data, from) {
    //this.loadcalliftrue = false;
    let lastAttribute;
    this.selectedClassArray = [];
    let alreadyPushedInOrder = false;
    this.isLoadSimilarItemInternalCalled = true;
    
    for (var i = 0; i < this.classArray.length; i++) {
     
      
      let dataValue = this.classArray[i].dataValue;
     let dataKey =  this.classArray[i].dataKey;
      for (let j = 0; j < dataValue.length; j++) {
        if (from == this.classArray[i].dataKey && dataValue[j].classList.contains('categ_outline_red'))
        {
          lastAttribute = dataValue[j].innerHTML;
        }
        if(data != undefined)
        {
          lastAttribute = data;
        }
        if ( dataValue[j].classList.contains('categ_outline_red')) {
          if(lastAttribute != dataValue[j].innerHTML && !alreadyPushedInOrder && from != dataKey)
          {
           
            this.selectedClassArray.push({innerhtml:dataValue[j].innerHTML,key:this.classArray[i].dataKey,value:this.classArray[i].dataValue});
            break;
          }
          else if(lastAttribute == dataValue[j].innerHTML)
          {
            alreadyPushedInOrder = true;
            this.selectedClassArray.push({innerhtml:dataValue[j].innerHTML,key:this.classArray[i].dataKey,value:this.classArray[i].dataValue});
            break;
          }
        }
        if(lastAttribute == dataValue[j].innerHTML && !alreadyPushedInOrder)
        {
          alreadyPushedInOrder = true;
          this.selectedClassArray.push({innerhtml:dataValue[j].innerHTML,key:this.classArray[i].dataKey,value:this.classArray[i].dataValue});
          break;
        }
      //  dataValue[j].classList.remove("categ_outline_red");
      //  dataValue[j].classList.remove("unavailable");
      //  dataValue[j].classList.add("categ_outline_gray");

       
      }
        
    }

     //Get Product
  let res =await this.viewProduct.getProductDetails(this.selectedProduct, data, from, lastAttribute,this.selectedClassArray);
   if(res != undefined)
   { 
     this.productListingModal = new BrowseProductsModal(res);
    window.localStorage['selectedProduct'] = JSON.stringify(this.productListingModal);
    this.loadProductInfo('fromInternalAPI',from);
    if (window.localStorage['existingItemsInCart'] != undefined) this.itemsInCart();
    this.selectedProduct.product.productImages.sort(function (x, y) {
      return (x.mainImage === y.mainImage) ? 0 : x.mainImage ? -1 : 1;
    });
  }
  
    

  let response = await this.viewProduct.getDynamicAttributes(this.selectedProduct, data, from, lastAttribute,this.selectedClassArray);
   
  if(response != undefined)
  {
    //this.attributeData.selectedColor = response.selectedColor;
    //this.attributeData.selectedSizes = response.selectedSizes;
    this.dynamicAttributeData = response;
    let element = document.getElementsByClassName('data_'+from);
    let dataa = [];
    //this.defaultClassRecall();
    this.defaultClassDynamic(from);
    setTimeout(() => {
    this.filterAttribute(element, lastAttribute, [], [], dataa, from);
      this.defaultClassLastcall();
      
    }, 1000);
   
    
  
  }
    
  }

  filterAttribute(element, selectedData, currentData, availableData, data, from) {
    // if (selectedData != undefined) {
    //   for (var i = 0; i < element.length; i++) {
    //     if (element[i].innerHTML != selectedData) element[i].classList.add('unavailable');
    //   }
    // }
    // for (var i = 0; i < currentData.length; i++) {
    //   data.push(currentData[i].innerHTML);
    //   if (from == 'color') currentData[i].classList.add('hideUnavailable');
    //   else currentData[i].classList.add('unavailable');
    //   currentData[i].classList.remove('categ_outline_red');
    //   currentData[i].classList.add('categ_outline_gray');
    // }
    // let notAvailabe = data.filter(val => availableData.includes(val));
    // for (var i = 0; i < notAvailabe.length; i++) {
    //   for (var j = 0; j < currentData.length; j++) {
    //     if (notAvailabe[i] == currentData[j].innerHTML) {
    //       currentData[j].classList.remove('unavailable');
    //       currentData[j].classList.remove('categ_outline_red');
    //       currentData[j].classList.remove('hideUnavailable');
    //     }
    //   }
    // }

    if (selectedData != undefined) {
      // for (var i = 0; i < element.length; i++) {
      //   if (element[i].innerHTML != selectedData) element[i].classList.add('unavailable');
      // }
      let notAvailabe; 
      let dataRt =[];
      for (var dynmData in this.dynamicAttributeData.allVariations ) {
        for (let i = 1; i < this.classArray.length; i++) {
          if(this.classArray[i].dataKey == dynmData)
          {
            for(let j=0;j<this.classArray[i].dataValue.length;j++)
            {
              if(this.dynamicAttributeData.selectedVariations[dynmData] == undefined)
              {
                dataRt.push(this.classArray[i].dataValue[j]);
              }
              else
              {
              notAvailabe = this.dynamicAttributeData.selectedVariations[dynmData].filter(element => this.classArray[i].dataValue[j].innerHTML.includes(element));
              if(notAvailabe.length ==0 )
              {
                dataRt.push(this.classArray[i].dataValue[j]);

              }
            }
             // console.log(dataRt);
            }
            //this.dynamicAttributeData.selectedVariations
            //notAvailabe = this.dynamicAttributeData.selectedVariations[dynmData].filter(val => this.classArray[j].dataValue.includes(val));

          }
        }
      }


     
      var dataRet = dataRt.filter(function(obj) { return Array.from(element).indexOf(obj) == -1; });
      for(let i = 0; i < dataRt.length; i++) {
        dataRt[i].classList.remove('unavailable');
        dataRt[i].classList.add('categ_outline_gray');
        dataRt[i].classList.add('unavailable');
      }
    }
  }

  filterIamgeURL() {
    for (var i = 0; i < this.selectedProduct.product.productImages.length; i++) {
      let product = this.selectedProduct.product.productImages[i];
      if (product.location.indexOf('data:') === -1 && product.location.indexOf('https:') === -1 && product.location.indexOf('http:') === -1) {
        this.selectedProduct.product.productImages[i].location = this.s3 + product.location;
      }
      if (product.location.indexOf('maxHeight') > -1) {
        this.selectedProduct.product.productImages[i].location = product.location.split(";")[0];
      }
    }
  }

  getMainImage() {
    for (var i = 0; i < this.selectedProduct.product.productImages.length; i++) {
      let product = this.selectedProduct.product.productImages[i]
      if (product.mainImage == true) this.selectedProduct.product.mainImageSrc = product.location
    }
  }

  animateToTiles(from) {
    if (from == 'retailer') {
      var scroll = document.querySelector('.returnPolicy') as HTMLElement
    }
    else {
      var scroll = document.querySelector('.consumerReviews') as HTMLElement;
    }
    animateScrollTo(scroll);
  }

  getReviews(productId) {
    this.viewProduct.getReviews(productId).subscribe((res) => {
      this.productReviews = [];
      for (var i = 0; i < res.content.length; i++) {
        let review = res.content[i];
        if (review.reviewImages) {
          this.productReviews.push(new ReadReviewModel(review.consumerId, review.consumerReviewId, review.productName, parseFloat(review.rating), review.retailerName, review.reviewDescription, `${this.s3 + review.reviewImages}`, review.firstName, review.lastName))
        } else {
          this.productReviews.push(new ReadReviewModel(review.consumerId, review.consumerReviewId, review.productName, parseFloat(review.rating), review.retailerName, review.reviewDescription, null, review.firstName, review.lastName))
        }
      }
    }, (err) => {
      console.log(err)
    });
  }

  getRating(rate) {
    return Array(rate).fill(rate)
  }

  appendRatings() {
    let firstVal, secondVal;
    if (this.totalReviewSummary.avg.toString().indexOf('.') > -1) {
      firstVal = parseInt(this.totalReviewSummary.avg.toString().split('.')[0]);
      secondVal = parseInt(this.totalReviewSummary.avg.toString().split('.')[1]);
    }
    else {
      firstVal = this.totalReviewSummary.avg;
      secondVal = 0;
    }
    if (firstVal != undefined && firstVal != null) {
      let appendTo = document.getElementsByClassName('ratingStars');
      for (let i = 0; i < appendTo.length; i++) {
        appendTo[i].innerHTML = '<span class="ratingActiveStars"></span>';
        if ((i + 1) == firstVal && secondVal == 0) break;
        if ((i + 1) == firstVal && secondVal != undefined && secondVal != 0) {
          i++;
          secondVal = parseInt(secondVal.toString().split("")[0]);
          appendTo[i].innerHTML = '<span class="ratingActiveStars"></span>';
          let element = appendTo[i].children[0] as HTMLElement;
          element.style.width = 16 - (17 - 4 - secondVal) + 'px';
          break;
        }
      }
    }
  }

  getStockNumber() {
    if (this.selectedProduct.product.quantity < 0) this.selectedProduct.product.quantity = 0
    else {
      for (var i = 0; i < this.selectedProduct.product.quantity; i++) {
        this.inStock.push(i + 1);
      }
      this.quantity = 1;
    }
  }

  itemsInCart() {
    let itemsInCart = JSON.parse(window.localStorage['existingItemsInCart']);

    for (var i = 0; i < itemsInCart.length; i++) {
      if (this.selectedProduct != undefined && this.selectedProduct.product.kalaUniqueId == itemsInCart[i].productId) {
        this.alreadyAddedInCart = true;
      }
    }
    
  }

  // itemsInGuestCart() {
  //   let itemsInGuestCart = JSON.parse(window.localStorage['existingItemsInGuestCart']);

  //   for (var i = 0; i < itemsInGuestCart.length; i++) {
  //     if (this.selectedProduct != undefined && this.selectedProduct.product.kalaUniqueId == itemsInGuestCart[i].productId) {
  //       this.alreadyAddedInCart = true;
  //     }
  //   }
  // }

  confirmUser() {
    window.localStorage['tbnAfterLogin'] = window.location.hash.split("#")[1];
    this.core.resetAllConvoFlags();
    this.core.signInToCUI = true;
    this.route.navigateByUrl('/search-result');
    this.core.LoungeShowHide();
  }
  
  signUpUser()
  {
    window.localStorage['tbnAfterLogin'] = window.location.hash.split("#")[1];
    this.core.resetAllConvoFlags();
    this.core.signUpToCUI = true;
    this.route.navigateByUrl('/search-result');
    this.core.LoungeShowHide();
  }
  RejectOffer()
  {
      this.makeABidMessages.push({
        mainImage: this.userData.consumerImagePatgetoffermh,
        from: 'User',
        message: 'Reject'
      });
      this.scrollToConversDev();
      setTimeout(() => {
        this.makeABidMessages.push({
          mainImage: '/consumer-app/assets/images/logo.png',
          from: 'Kala',
          message: 'Ok thanks, we’ll hold your offer for 24 hours in case you change your mind.'
        });
        this.scrollToConversDev();
        setTimeout(() => {
          this.isMakeABid = false; 
        }, 3000);
      }, 1000);
    
   
    
  }
  AcceptOfferToCheckout()
  {
    this.makeABidMessages.push({
      mainImage: this.userData.consumerImagePath,
      from: 'User',
      message: 'accept'
    });
    this.makeOfferUserInput ="ContinueCheckout";
    this.scrollToConversDev();
    setTimeout(() => {
      this.makeABidMessages.push({
        mainImage: '/consumer-app/assets/images/logo.png',
        from: 'Kala',
        message: 'Great choice!'
      });
      this.scrollToConversDev();
      setTimeout(() => {
        this.makeABidMessages.push({
          mainImage: '/consumer-app/assets/images/logo.png',
          from: 'Kala',
          message: 'Would you like to checkout now or continue shopping?'
        });
        this.offerAlreadyAccepted = true;
        //this.makeOfferUserInput ="ContinueCheckout";
        this.scrollToConversDev();
        setTimeout(() => {
          this.contCheckoutSection!=undefined?this.contCheckoutSection.nativeElement.focus():{};
        }, 1500);
        setTimeout(() => {
          this.addToCart('acceptOffer');
        }, 1500);
      }, 1500);
    }, 1500);
   
    
  }
  gotoCart()
  {
    this.makeABidMessages.push({
      mainImage: this.userData.consumerImagePath,
      from: 'User',
      message: 'checkout'
    });
    this.scrollToConversDev();
    setTimeout(() => {
      this.makeABidMessages.push({
        mainImage: '/consumer-app/assets/images/logo.png',
        from: 'Kala',
        message: 'Sounds good! We will make sure to hold your offer in the cart for 24 hours.'
      });
      this.scrollToConversDev();
      setTimeout(() => {
        if(!this.offerAlreadyAccepted)
          this.addToCart('checkout');
        else
        {
          this.route.navigateByUrl('/mycart');
        }
      }, 4000);
    }, 1500);
    
  }

  addToCart(to) {
    if (window.localStorage['token'] == undefined) {
      this.confirmValidationMsg.label = 'login';
      this.confirmValidationMsg.message = "Would you like to log in, sign up as a member, or checkout as a guest?";
      this.core.openModal(this.viewProductModal);
      this.core.getbackToBuyProduct = true;
      this.core.getbackToGetOffer = false;
      this.core.getbackToMakeAnOffer = false;
    }
    else {
      this.addToCartModal.userId = this.userData.userId;
      this.addToCartModal.label = "cart";
      this.addToCartModal.retailerId = this.selectedProduct.product.retailerId;
      this.addToCartModal.retailerName = this.selectedProduct.product.retailerName;
      this.addToCartModal.productId = this.selectedProduct.product.kalaUniqueId;
      this.addToCartModal.productName = this.selectedProduct.product.productName;
      if(this.makeofferResponse != undefined && this.makeofferResponse.offerPrice != 0 && this.makeofferResponse.offerPrice!= undefined)
      {
        this.addToCartModal.price = this.makeofferResponse.offerPrice;
        this.addToCartModal.offerMade = this.makeofferResponse.offerMade;
        this.addToCartModal.offerCreatedDate = new Date();  //new Date(date.getFullYear(), date.getMonth() + 1 , date.getDate());
      }
      else
      {
        this.addToCartModal.price = this.selectedProduct.product.kalaPrice;
        this.addToCartModal.offerMade = false;
      }
      this.addToCartModal.quantity = parseFloat(this.quantity);
      this.addToCartModal.inStock = this.selectedProduct.product.quantity;
      this.addToCartModal.retailerReturns = this.selectedProduct.retailerReturns;
      this.addToCartModal.shipProfileId = this.selectedProduct.product.shipProfileId;
      this.addToCartModal.productDescription = this.selectedProduct.product.productDescription;
      this.addToCartModal.taxCode = this.selectedProduct.product.taxCode;
      this.addToCartModal.productSKUCode = this.selectedProduct.product.productSkuCode;
      this.addToCartModal.productUPCCode = this.selectedProduct.product.productUpcCode;
      this.addToCartModal.shippingWidth = this.selectedProduct.product.shippingWidth;
      this.addToCartModal.shippingHeight = this.selectedProduct.product.shippingHeight;
      this.addToCartModal.shippingLength = this.selectedProduct.product.shippingLength;
      this.addToCartModal.shippingWeight = this.selectedProduct.product.shippingWeight;
      this.addToCartModal.leadTimeToShip =parseInt(this.selectedProduct.product.attributes.LeadTimeToShip);
      this.addToCartModal.orderFrom = "PRODUCT";
      this.addToCartModal.productHierarchy = this.selectedProduct.product.productHierarchy;
      this.addToCartModal.productAttributes = this.selectedProduct.product.productAttributes;
      this.addToCartModal.channelAdviosorProductSku = this.selectedProduct.product.channelAdviosorProductSku;
      this.addToCartModal.channelAdviosorRetailerSku = this.selectedProduct.product.channelAdviosorRetailerSku;
      for (var i = 0; i < this.selectedProduct.product.productImages.length; i++) {
        let image = this.selectedProduct.product.productImages[i]
        if (image.mainImage == true) this.addToCartModal.productImage = image.location;
      }
      window.localStorage['addedInCart'] = JSON.stringify(this.addToCartModal);
      window.localStorage['callSaveCart'] = true;
      if(to != 'continueShopping' && to != 'makeOffer' && to != 'acceptOffer') // To naigate back to continue to shop
      {
        this.route.navigateByUrl('/mycart');
      }
      else
      {
        localStorage.removeItem('existingItemsInCart');
        localStorage.removeItem('existingItemsInWishList');
        this.getCartItems(this.userData.userId, this.addToCartModal.productId ,to);
      }
      //this.route.navigateByUrl('/mycart');
    }
  }

  getDeliveryDate(deliveryMethod, currentDate) {
    this.selectedProduct.product.attributes.LeadTimeToShip == undefined ? this.selectedProduct.product.attributes.LeadTimeToShip=0:{};
    let weekday = new Array("Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday")
    // Express: 3 to 5 business days Delivery
    if (deliveryMethod == 'Express: 3 to 5 business days') {
      let date = new Date(currentDate), locale = "en-us", month = date.toLocaleString(locale, { month: "long" });
      let getDay = new Date(date.getTime() + ((parseInt(this.selectedProduct.product.attributes.LeadTimeToShip) * 24) + 120) * 60 * 60 * 1000); //Calculating on the next 5days basis
      return weekday[getDay.getDay()] + ', ' + getDay.toLocaleString(locale, { month: "long" }) + ' ' + (getDay.getDate())
    }
    // 2 day: 2 business day shipping days Delivery
    else if (deliveryMethod == '2 day: 2 business day shipping') {
      let date = new Date(currentDate), locale = "en-us", month = date.toLocaleString(locale, { month: "long" });
      let getDay = new Date(date.getTime() + ((parseInt(this.selectedProduct.product.attributes.LeadTimeToShip) * 24) +48) * 60 * 60 * 1000); //Calculating on the next 5days basis
      return weekday[getDay.getDay()] + ', ' + getDay.toLocaleString(locale, { month: "long" }) + ' ' + (getDay.getDate())
    }
    // Standard: 5 to 8 business days Delivery
    else if (deliveryMethod == 'Standard: 5 to 8 business days') {
      let date = new Date(currentDate), locale = "en-us", month = date.toLocaleString(locale, { month: "long" });
      let getDay = new Date(date.getTime() + ((parseInt(this.selectedProduct.product.attributes.LeadTimeToShip) * 24) + 192) * 60 * 60 * 1000); //Calculating on the next 5days basis
      return weekday[getDay.getDay()] + ', ' + getDay.toLocaleString(locale, { month: "long" }) + ' ' + (getDay.getDate())
    }
    //Custom shipping method
    else if(deliveryMethod.indexOf('Custom')> -1 ) {
      let ctDir = deliveryMethod.split(' business days')[0];
      let coDir = ctDir.split(' ')[ctDir.split(' ').length-1];
      let date = new Date(currentDate), locale = "en-us", month = date.toLocaleString(locale, { month: "long" });
      let getDay = new Date(date.getTime() + (((parseInt(this.selectedProduct.product.attributes.LeadTimeToShip) * 24) + parseInt(coDir) *24)) * 60 * 60 * 1000); //Calculating on the next 5days basis
      return weekday[getDay.getDay()] + ', ' + getDay.toLocaleString(locale, { month: "long" }) + ' ' + (getDay.getDate())
    }
    // Next day: 1 business day shipping
    else {
      let date = new Date(currentDate), locale = "en-us", month = date.toLocaleString(locale, { month: "long" });
      let getDay = new Date(date.getTime() + ((parseInt(this.selectedProduct.product.attributes.LeadTimeToShip) * 24) + 24) * 60 * 60 * 1000); //Calculating on the next 5days basis
      return weekday[getDay.getDay()] + ', ' + getDay.toLocaleString(locale, { month: "long" }) + ' ' + (getDay.getDate())
    }
  }
  defaultClassLastcall() {
   
    
    for (let i = 0; i <  this.classArray.length; i++) {
      let dataKey = this.classArray[i].dataKey;
      let dataValue = this.classArray[i].dataValue;
      for (let j = 0; j < dataValue.length; j++) {
        for (let k = 0; k < this.prodAttributeArray.length; k++) {
         
         if(dataValue[j].innerHTML == this.prodAttributeArray[k].dataValue)
          { 
            dataValue[j].classList.add('categ_outline_redd');
            dataValue[j].classList.remove('categ_outline_gray');
            break;
          }
          
         
        }
        
      }
    }

  }

  defaultClassRecall() {
    this.isLoadSimilarItemInternalCalled = false;
    if (window.localStorage['token'] != undefined) {
      var header = document.getElementsByClassName("withoutLog");
      if(header.length !=0)
      {
        header[0].classList.remove("withoutLog");
      }

    }

   setTimeout(() => {
    this.classArray = [];
    this.prodAttributeArray = [];
    for (var dynmData in this.dynamicAttributeData.allVariations ) {
      this.classArray.push({dataKey:dynmData,dataValue: document.getElementsByClassName('data_'+dynmData)});
    }
    for (var dynmData in this.selectedProduct.product.attributes ) {
      if(isNaN(this.selectedProduct.product.attributes[dynmData]))
      {
        this.prodAttributeArray.push({dataKey:dynmData,dataValue:this.selectedProduct.product.attributes[dynmData]});

      }
      else
      {
        this.prodAttributeArray.push({dataKey:dynmData,dataValue:Number(this.selectedProduct.product.attributes[dynmData])});

      }
    }
    
    // for (let i = 0; i <  this.prodAttributeArray.length; i++) {
    //   if (colors[i].innerHTML == this.selectedProduct.product.attributes.Color) {
    //     colors[i].classList.add('categ_outline_red');
    //     colors[i].classList.remove('categ_outline_gray');
    //     break;
    //   }
    // }
    for (let i = 0; i <  this.classArray.length; i++) {
      let dataKey = this.classArray[i].dataKey;
      let dataValue = this.classArray[i].dataValue;
      let itemExist = this.prodAttributeArray.filter(x => x.dataKey === dataKey);
      for (let j = 0; j < dataValue.length; j++) {
        for (let k = 0; k < this.prodAttributeArray.length; k++) {
         
          let itemExist = this.selectedClassArray.filter(x => x.key === this.prodAttributeArray[k].dataKey);
          if(itemExist.length >0)
          { 
            dataValue[j].classList.add('categ_outline_red');
            dataValue[j].classList.remove('categ_outline_gray');
          }
          if(!this.isLoadSimilarItemInternalCalled)
          {
            this.isLoadSimilarItemInternalCalled = true;
           dataValue[j].classList.add('categ_outline_red');
           dataValue[j].classList.remove('categ_outline_gray');
           this.loadSimilarItemInternal(this.prodAttributeArray[k].dataValue,this.prodAttributeArray[k].dataKey);
          }
          break;
        }
        
      }
    }
    this.callForData();

    this.loadReviewsSummary(this.selectedProduct.product.kalaUniqueId);
    this.getReviews(this.selectedProduct.product.kalaUniqueId);
    this.getItBy(this.selectedProduct.product.shipProfileId);
   }, 500);

  }

  defaultClassDynamic(from?:any) {
    if (window.localStorage['token'] != undefined) {
      var header = document.getElementsByClassName("withoutLog");
      if(header.length !=0)
      {
        header[0].classList.remove("withoutLog");
      }
    }

   setTimeout(() => {
    this.classArray = [];
    this.prodAttributeArray = [];
    for (var dynmData in this.dynamicAttributeData.allVariations ) {
      this.classArray.push({dataKey:dynmData,dataValue: document.getElementsByClassName('data_'+dynmData)});
    }
    for (var dynmData in this.selectedProduct.product.attributes ) {
      if(isNaN(this.selectedProduct.product.attributes[dynmData]))
      {
        this.prodAttributeArray.push({dataKey:dynmData,dataValue:this.selectedProduct.product.attributes[dynmData]});

      }
      else
      {
        this.prodAttributeArray.push({dataKey:dynmData,dataValue:Number(this.selectedProduct.product.attributes[dynmData])});

      }
      //this.prodAttributeArray.push({dataKey:dynmData,dataValue:Number(this.selectedProduct.product.attributes[dynmData])});
    }
    
    // for (let i = 0; i <  this.prodAttributeArray.length; i++) {
    //   if (colors[i].innerHTML == this.selectedProduct.product.attributes.Color) {
    //     colors[i].classList.add('categ_outline_red');
    //     colors[i].classList.remove('categ_outline_gray');
    //     break;
    //   }
    // }
    for (let i = 0; i <  this.classArray.length; i++) {
      let dataKey = this.classArray[i].dataKey;
      let dataValue = this.classArray[i].dataValue;
      let itemExist = this.prodAttributeArray.filter(x => x.dataKey === dataKey);
      for (let j = 0; j < dataValue.length; j++) {
        for (let k = 0; k < this.prodAttributeArray.length; k++) {
         
          if(isNaN(dataValue[j].innerHTML))
          {

          
          if (dataValue[j].innerHTML == this.prodAttributeArray[k].dataValue) {
            let itemExist = this.selectedClassArray.filter(x => x.key === this.prodAttributeArray[k].dataKey &&  x.key == dataKey );
           if(itemExist.length >0)
           { 
             dataValue[j].classList.add('categ_outline_red');
             dataValue[j].classList.remove('categ_outline_gray');
             break;
           }

            //if(this.prodAttributeArray[k].dataKey != this.classArray[this.classArray.length-1].dataKey && from != this.classArray[this.classArray.length-1].dataKey)
                //this.loadSimilarItemInternal(this.prodAttributeArray[k].dataValue,this.prodAttributeArray[k].dataKey);
           if(!this.isLoadSimilarItemInternalCalled)
           {
            dataValue[j].classList.add('categ_outline_red');
            dataValue[j].classList.remove('categ_outline_gray');
            this.loadSimilarItemInternal(this.prodAttributeArray[k].dataValue,this.prodAttributeArray[k].dataKey);
            break;
          }
             
            
           
          }
        }
        else
        {
          if (Number(dataValue[j].innerHTML) == Number(this.prodAttributeArray[k].dataValue)) {
            let itemExist = this.selectedClassArray.filter(x => x.key === this.prodAttributeArray[k].dataKey &&  x.key == dataKey );
           if(itemExist.length >0)
           { 
             dataValue[j].classList.add('categ_outline_red');
             dataValue[j].classList.remove('categ_outline_gray');
             break;
           }

            //if(this.prodAttributeArray[k].dataKey != this.classArray[this.classArray.length-1].dataKey && from != this.classArray[this.classArray.length-1].dataKey)
                //this.loadSimilarItemInternal(this.prodAttributeArray[k].dataValue,this.prodAttributeArray[k].dataKey);
           if(!this.isLoadSimilarItemInternalCalled)
           {
            dataValue[j].classList.add('categ_outline_red');
            dataValue[j].classList.remove('categ_outline_gray');
            this.loadSimilarItemInternal(this.prodAttributeArray[k].dataValue,this.prodAttributeArray[k].dataKey);
            break;
          }
          }
        }
          
        }
        
      }
    }
    this.callForData();

    this.loadReviewsSummary(this.selectedProduct.product.kalaUniqueId);
    this.getReviews(this.selectedProduct.product.kalaUniqueId);
    this.getItBy(this.selectedProduct.product.shipProfileId);
   }, 500);

  }

  getOffers() {
    if (window.localStorage['token'] == undefined) {
      this.confirmValidationMsg.label = 'login';
      this.confirmValidationMsg.message = "You must be logged in as a member to receive custom offers. Do you want to log in now or create an account?";
      this.core.openModal(this.loginSignUpModal);
      this.core.getbackToGetOffer = true;
      this.core.getbackToMakeAnOffer = false;
      this.core.getbackToBuyProduct = false;
    }
    else
    {
      this.core.IsElasticSearch = true;
      this.core.IsTrackOrder = false; //To make track div invisible during direct navigation from home in CUI
      this.core.IsCheckout = false; //To make checkout div invisible during direct navigation from home in CUI
      this.route.navigateByUrl('/search-result');
    }

  }

  goGetOffer() {
    if (window.localStorage['token'] == undefined) {
      this.confirmValidationMsg.label = 'login';
      this.confirmValidationMsg.message = "You must be logged in as a member to receive custom offers. Do you want to log in now or create an account?"
      this.core.openModal(this.loginSignUpModal);
      this.core.getbackToGetOffer = true;
      this.core.getbackToMakeAnOffer = false;
      this.core.getbackToBuyProduct = false;
    }
    else {
      //if (window.localStorage['esKeyword'])
      let place = [], category = [], subcategory = [], levelSelection;
      place = new Array<SearchDataModal>();
      category = new Array<SearchDataModal>();
      place.push(new SearchDataModal(this.selectedProduct.product.productHierarchyWithIds[0].levelId, this.selectedProduct.product.productHierarchyWithIds[0].levelName, this.selectedProduct.product.productHierarchyWithIds[0].levelName, this.selectedProduct.product.productHierarchyWithIds[0].levelCount));
      category.push(new SearchDataModal(this.selectedProduct.product.productHierarchyWithIds[1].levelId, this.selectedProduct.product.productHierarchyWithIds[1].levelName, this.selectedProduct.product.productHierarchyWithIds[1].levelName, this.selectedProduct.product.productHierarchyWithIds[1].levelCount));
      subcategory.push(new SearchDataModal(this.selectedProduct.product.productHierarchyWithIds[2].levelId, this.selectedProduct.product.productHierarchyWithIds[2].levelName, this.selectedProduct.product.productHierarchyWithIds[2].levelName, this.selectedProduct.product.productHierarchyWithIds[2].levelCount));
      if (window.localStorage['levelSelections'] == undefined) levelSelection = new Object();
      else levelSelection = JSON.parse(window.localStorage['levelSelections']);
      levelSelection.place = place[0];
      levelSelection.category = category[0];
      levelSelection.subcategory = {};
      levelSelection.subType = {};
      levelSelection.type = [];
      window.localStorage['levelSelections'] = JSON.stringify(levelSelection);
      //if (window.localStorage['esKeyword'])
      this.core.isSearchWithoutSuggestion = false;
      this.core.IsGetoffers = true;
      this.route.navigateByUrl('/search-result');
    }
  }

  defaultClass() {
    setTimeout(() => {
      let colors = document.getElementsByClassName('data_color');
      let sizes = document.getElementsByClassName('data_size');
      for (let i = 0; i < colors.length; i++) {
        if (colors[i].innerHTML == this.selectedProduct.product.attributes.Color) {
          colors[i].classList.add('categ_outline_red');
          colors[i].classList.remove('categ_outline_gray');
          break;  
        }
      }
      for (let i = 0; i < sizes.length; i++) {
        if (sizes[i].innerHTML == this.selectedProduct.product.attributes.Size) {
          sizes[i].classList.add('categ_outline_red');
          sizes[i].classList.remove('categ_outline_gray');
          break;
        }
      }
      if (this.callColorIfAvailable) {
        let element;
        let colorData = document.getElementsByClassName('data_color');
        if (colorData.length > 0) {
          for (let i = 0; i < colorData.length; i++) {
            if (colorData[i].classList.contains('categ_outline_red')) {
              element = colorData[i];
              element.click();
              break;
            }
          }
          this.callForData();
        }
        else {
          this.callForData();
          this.loadReviewsSummary(this.selectedProduct.product.kalaUniqueId);
          this.getReviews(this.selectedProduct.product.kalaUniqueId);
          this.getItBy(this.selectedProduct.product.shipProfileId);
        }
      }
    }, 500);
  }

  callForData() {
    this.callColorIfAvailable = 0;
    this.callReviewsAPI = 1;
    setTimeout(() => {
      this.loaderQuantity = false;
    }, 100);
  }

  getCartItems(userId,productId,to) {
    // this.loader = true;
     this.mycart.getCartItems(userId).subscribe((res) => {
       console.log(res);
       let cartItems = [];
       let wishListItems = [];
       if (window.localStorage['existingItemsInCart'] != undefined) cartItems = JSON.parse(window.localStorage['existingItemsInCart']);
       if (window.localStorage['existingItemsInWishList'] != undefined) wishListItems = JSON.parse(window.localStorage['existingItemsInCart']);
       this.cartData = new Array<SaveGetCartItems>();
       for (var i = 0; i < res.length; i++) {
         let items = res[i];
        this.cartData.push(new SaveGetCartItems(items.userId, items.label, items.retailerId, items.retailerName, items.productId, items.productName, items.price, items.quantity, items.inStock, items.productImage, items.taxCode, items.productSKUCode, items.productUPCCode, items.shippingWidth, items.shippingHeight, items.shippingLength, items.shippingWeight, items.shipProfileId, items.productDescription, items.orderFrom, items.productHierarchy, items.productAttributes, items.retailerIntegrationMethod,parseInt(items.leadTimeToShip),items.cartId,items.offerMade == undefined?false:items.offerMade,(items.offerMade == undefined|| items.offerMade == false)?null:items.offerCreatedDate));
       }
       for (var i = 0; i < this.cartData.length; i++) {
         if (this.cartData[i].label == 'cart') {
           if(this.cartData[i].productId == productId)
           {
             this.cartData[i].offerMade = true;
             this.cartData[i].offerCreatedDate = this.cartData[i].offerCreatedDate == undefined? new Date():this.cartData[i].offerCreatedDate;
           }
           cartItems.push(this.cartData[i]);
           window.localStorage['existingItemsInCart'] = JSON.stringify(cartItems);
         }
         else {
           wishListItems.push(this.cartData[i]);
           window.localStorage['existingItemsInWishList'] = JSON.stringify(wishListItems);
         }
       }
       this.checkItemsInCart();
       //this.checkItemsInWishlist();
       this.loader = false;
       if (window.localStorage['callSaveCart'] != undefined) {
         localStorage.removeItem('callSaveCart');
         this.saveCartData('',to);
       }
     }, (err) => {
       console.log(err);
     })
   }
   saveCartData(from,to) {
     if (from = '') this.loader = true;
     let data; let wishlist;
     if (window.localStorage['existingItemsInCart'] != undefined) data = JSON.parse(window.localStorage['existingItemsInCart']);
     if (window.localStorage['existingItemsInWishList'] != undefined) wishlist = JSON.parse(window.localStorage['existingItemsInWishList']);
     let userData = JSON.parse(window.localStorage['userInfo']);
     if (data != undefined) {
       for (var i = 0; i < data.length; i++) {
         data[i].userId = userData.userId;
       }
     }
     if (wishlist != undefined) {
       for (var i = 0; i < wishlist.length; i++) {
         wishlist[i].userId = userData.userId;
       }
     }
     this.cartData = new Array<SaveGetCartItems>();
     if (data == undefined && wishlist == undefined) this.cartData = [];
     else if (data != undefined && wishlist != undefined) this.cartData = [...data, ...wishlist];
     else if (data == undefined) this.cartData = [...wishlist];
     else this.cartData = [...data];
     this.mycart.saveCartItems(this.cartData).subscribe((res) => {
       this.loader = false;
         setTimeout(() => {
           if(to != 'acceptOffer')
           if(this.fromES)
           {
             if (window.localStorage['esKeyword'] != undefined) {
               this.eskey = JSON.parse(window.localStorage['esKeyword']).text;
               this.route.navigateByUrl('/elastic-product?search=' + this.eskey.replace(/ /g, "-") +"&IsFilter=" + this.isFilterVal);
             }
             else
             {
               this.eskey = JSON.parse(window.localStorage['searchKeyword']).text;
               this.route.navigateByUrl('/elastic-product?search=' + this.eskey.replace(/ /g, "-"));
             }
           }
           else
           {
             this.navigateToBrowse(this.selectedProduct);
           }
           
         }, 4000);
       console.log(res);
     }, (err) => {
       this.loader = false;
       console.log(err);
     })
   }
 
   checkItemsInCart() {
     if (window.localStorage['existingItemsInCart'] == undefined) {
       if (window.localStorage['addedInCart'] != undefined) {
         this.itemsInCartCheckout.push(JSON.parse(window.localStorage['addedInCart']));
         window.localStorage['existingItemsInCart'] = JSON.stringify(this.itemsInCartCheckout);
         this.noItemsInCart = false;
       }
       else {
         this.cartEmpty = true;
         this.noItemsInCart = true;
       }
     }
     else {
       let newItem;
       let isThere: boolean;
       let existingItemsInCart = JSON.parse(window.localStorage['existingItemsInCart']);
       for (var i = 0; i < existingItemsInCart.length; i++)
         if (this.fromMoveFunction == true) {
           if (existingItemsInCart[i].productId == this.itemsInCartCheckout[i].productId) existingItemsInCart.splice(i, 1);
         }
         else this.itemsInCartCheckout.push(existingItemsInCart[i]);
       if (window.localStorage['addedInCart'] != undefined) {
         newItem = JSON.parse(window.localStorage['addedInCart']);
         for (var i = 0; i < this.itemsInCartCheckout.length; i++) {
           if (newItem.productId == this.itemsInCartCheckout[i].productId) {
             this.itemsInCartCheckout[i].quantity = eval(`${this.itemsInCartCheckout[i].quantity + newItem.quantity}`)
             isThere = true;
             window.localStorage['existingItemsInCart'] = JSON.stringify(this.itemsInCartCheckout);
             this.confirmValidationMsg.message = "Item updated in your cart";
            // this.core.openModal(this.myCartModal);
             //alert("Item updated in your cart");
             localStorage.removeItem("addedInCart");
             return false
           }
           else isThere = false;
         }
       }
       if (isThere == false) {
         this.itemsInCartCheckout.push(newItem);
         window.localStorage['existingItemsInCart'] = JSON.stringify(this.itemsInCartCheckout);
       }
     }
     localStorage.removeItem("addedInCart");
   }
  
  
  
  set2Decimal(value:any)
  {
    if(this.makeofferValue !='')
      this.makeofferValue = parseFloat(this.makeofferValue).toFixed(2);
  }
  getPartNumArray(prtNum:any)
  {
    if( prtNum instanceof Array)
      return prtNum
    else
      return prtNum.split(',');
  }
  invalidate()
  {
    this.lowestPriceError = false;
    this.makeofferValueError = false;
    this.isMakeOfferRejected = false;
  }

  ClickOutsideModule(e: Event) {
    let elements = document.getElementsByClassName("main-menu");
    if (elements != undefined) {
      elements[0].classList.add("invisible");
    }

  }
  menuClicked() {
    let elements = document.getElementsByClassName("main-menu");
    if (elements != undefined && elements[0].classList.contains("invisible") == true) {
      elements[0].classList.remove("invisible")
    }
  }

  viewAllPlaceProducts(place:any){
    this.selectionLevel = 2;
    let placeToSend = new SearchDataModal(place.placeId, place.placeName, place.placeName, "1", `${this.s3}${this.placeImageUrl}${place.placeName}.png`, `${this.s3}${this.placeIconsUrl}${place.placeName}.png`,'',false,true);
    this.userResponse = { place: {}, type: {}, category: [], subcategory: [], subType: {} };
    this.userResponse.place = placeToSend;
    window.localStorage['levelSelections'] = JSON.stringify(this.userResponse);
    let url =('/browse-subcat?place='+encodeURIComponent(place.placeName) + '&placeId='+ place.placeId);
    setTimeout(() => {
      let elements = document.getElementsByClassName("main-menu");
      if(elements != undefined)
      {
        elements[0].classList.add("invisible");
      }
    }, 500);
    this.route.navigateByUrl('/', {skipLocationChange: true})
    .then(()=>this.route.navigateByUrl(url));
  }
  viewAllCategProducts(place:any,categ:any)
  {
    this.userResponse = { place: {}, type: {}, category: [], subcategory: [], subType: {} };
    let placeToSend = new SearchDataModal(place.placeId, place.placeName, place.placeName, "1", `${this.s3}${this.placeImageUrl}${place.placeName}.png`, `${this.s3}${this.placeIconsUrl}${place.placeName}.png`,'',false,true);
    this.userResponse.place = placeToSend;
    let CategToSend = new SearchDataModal(categ.categoryId, categ.categoryName, categ.categoryName, "2", `${this.s3}${this.categoryImageUrl}${place.placeName}/${categ.categoryName}.jpg`,'','',false,true);
    this.userResponse.category = CategToSend as any;
    setTimeout(() => {
      let elements = document.getElementsByClassName("main-menu");
      if(elements != undefined)
      {
        elements[0].classList.add("invisible");
      }
    }, 500);
    window.localStorage['levelSelections'] = JSON.stringify(this.userResponse);
    let url = ('/browse-subcatgroup?placeId='+ place.placeId +'&placeName='+ encodeURIComponent(place.placeName) + '&category='+encodeURIComponent(categ.categoryName) + '&catId='+ categ.categoryId);
    this.route.navigateByUrl('/', {skipLocationChange: true})
    .then(()=>this.route.navigateByUrl(url));
  }
  viewAllProducts(place:any,categ:any,subcat:any)
  {
    this.userResponse = { place: {}, type: {}, category: [], subcategory: [], subType: {} };
    let selectedTilesData;
    if(window.localStorage['levelSelections'] != undefined)
    {
      selectedTilesData = JSON.parse(window.localStorage['levelSelections']);
      this.userResponse= selectedTilesData;
    }
    let placeToSend = new SearchDataModal(place.placeId, place.placeName, place.placeName, "1", `${this.s3}${this.placeImageUrl}${place.placeName}.png`, `${this.s3}${this.placeIconsUrl}${place.placeName}.png`,'',false,true);
    this.userResponse.place = placeToSend;

    let CategToSend = new SearchDataModal(categ.categoryId, categ.categoryName, categ.categoryName, "2", `${this.s3}${this.categoryImageUrl}${place.placeName}/${categ.categoryName}.jpg`,'','',false,true);
    this.userResponse.category =  CategToSend as any;
    let subCategToSend = new SearchDataModal(subcat.subCategoryId, subcat.subCategoryName, subcat.subCategoryName, "3", `${this.s3}${this.categoryImageUrl}${place.placeName}/${categ.categoryName}/${subcat.subCategoryName}.jpg`,'','',false,true);
    this.userResponse.subcategory = subCategToSend as any;

    setTimeout(() => {
      let elements = document.getElementsByClassName("main-menu");
      if(elements != undefined)
      {
        elements[0].classList.add("invisible");
      }
    }, 500);
    window.localStorage['levelSelections'] = JSON.stringify(this.userResponse);  
    let url ='/browse-product?category='+ encodeURIComponent(categ.categoryName) + '&catId='+ categ.categoryId+ '&subCategory='+encodeURIComponent(subcat.subCategoryName) + '&subCatId='+ subcat.subCategoryId + '&viewAll=' + true;
    this.route.navigateByUrl('/', {skipLocationChange: true})
      .then(()=>this.route.navigateByUrl(url));
    //this.router.navigateByUrl(url);
    //this.router.navigateByUrl('/browse-product?subCategory='+encodeURIComponent(subcat.subCategoryName) + '&subCatId='+ subcat.subCategoryId + '&viewAll=' + true);
  }

  addToGuestCart()
  {
      this.addToCartModal.label = "cart";
      this.addToCartModal.retailerId = this.selectedProduct.product.retailerId;
      this.addToCartModal.retailerName = this.selectedProduct.product.retailerName;
      this.addToCartModal.productId = this.selectedProduct.product.kalaUniqueId;
      this.addToCartModal.productName = this.selectedProduct.product.productName;
      let date = new Date();
      if(this.makeofferResponse != undefined && this.makeofferResponse.offerPrice != 0 && this.makeofferResponse.offerPrice!= undefined)
      {
        this.addToCartModal.price = this.makeofferResponse.offerPrice;
        this.addToCartModal.offerMade = this.makeofferResponse.offerMade;
        this.addToCartModal.offerCreatedDate = new Date();  //new Date(date.getFullYear(), date.getMonth() + 1 , date.getDate());
      }
      else
      {
        this.addToCartModal.price = this.selectedProduct.product.kalaPrice;
        this.addToCartModal.offerMade = false;
      }
      this.addToCartModal.quantity = parseFloat(this.quantity);
      this.addToCartModal.inStock = this.selectedProduct.product.quantity;
      this.addToCartModal.retailerReturns = this.selectedProduct.retailerReturns;
      this.addToCartModal.shipProfileId = this.selectedProduct.product.shipProfileId;
      this.addToCartModal.productDescription = this.selectedProduct.product.productDescription;
      this.addToCartModal.taxCode = this.selectedProduct.product.taxCode;
      this.addToCartModal.productSKUCode = this.selectedProduct.product.productSkuCode;
      this.addToCartModal.productUPCCode = this.selectedProduct.product.productUpcCode;
      this.addToCartModal.shippingWidth = this.selectedProduct.product.shippingWidth;
      this.addToCartModal.shippingHeight = this.selectedProduct.product.shippingHeight;
      this.addToCartModal.shippingLength = this.selectedProduct.product.shippingLength;
      this.addToCartModal.shippingWeight = this.selectedProduct.product.shippingWeight;
      this.addToCartModal.orderFrom = "PRODUCT";
      this.addToCartModal.productHierarchy = this.selectedProduct.product.productHierarchy;
      this.addToCartModal.productAttributes = this.selectedProduct.product.productAttributes;
      this.addToCartModal.retailerIntegrationMethod = this.selectedProduct.product.retailerIntegrationMethod;
      this.addToCartModal.channelAdviosorProductSku = this.selectedProduct.product.channelAdviosorProductSku;
      this.addToCartModal.channelAdviosorRetailerSku = this.selectedProduct.product.channelAdviosorRetailerSku;
      this.addToCartModal.leadTimeToShip = this.selectedProduct.product.attributes.LeadTimeToShip;
      for (var i = 0; i < this.selectedProduct.product.productImages.length; i++) {
        let image = this.selectedProduct.product.productImages[i]
        if (image.mainImage == true) this.addToCartModal.productImage = image.location;
      }
      window.localStorage['addedInGuestCart'] = JSON.stringify(this.addToCartModal);
      //window.localStorage['callSaveCart'] = true;
      this.route.navigateByUrl('/guest-cart');
  }

  itemsInGuestCart()
  {
    if(this.selectedProduct == undefined)
    {
      window.localStorage['selectedProduct'] != undefined? this.selectedProduct = JSON.parse(window.localStorage['selectedProduct']):{};
    }
     if (window.localStorage['existingItemsInGuestCart'] != undefined) {
      let itemsInCart = JSON.parse(window.localStorage['existingItemsInGuestCart']);
     
    if(this.selectedProduct != undefined)
    {
      for (var i = 0; i < itemsInCart.length; i++) {
        if (this.selectedProduct != undefined && this.selectedProduct.product.kalaUniqueId == itemsInCart[i].productId) {
        this.alreadyAddedInCart = true;
        }
      }
    }
    else
    {
    for (var i = 0; i < itemsInCart.length; i++) {
      if (this.productId != undefined && this.productId == itemsInCart[i].productId) {
      this.alreadyAddedInCart = true;
      }
    }
    }
  }
  }

}
