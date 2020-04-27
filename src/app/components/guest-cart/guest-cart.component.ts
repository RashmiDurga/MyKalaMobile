import { Component, OnInit, ViewEncapsulation, ViewChild, ElementRef } from '@angular/core';
import { CoreService } from '../../services/core.service';
import { AddToCart } from '../../models/addToCart';
import { Router } from '@angular/router';
import { MyCartService } from '../../services/mycart.service';
import { SaveGetCartItems } from '../../models/save-get-cart';

@Component({
  selector: 'app-guestcart',
  templateUrl: './guest-cart.component.html',
  styleUrls: ['./guest-cart.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class GuestCartComponent implements OnInit {
  @ViewChild("TotalAmountPayable") TotalAmountPayable: ElementRef;
  TotalAmountCartPayable: number
  itemsInCart = [];
  cartEmpty: boolean = false;
  noItemsInCart: boolean = false;
  savedForLater = [];
  addToCartModal = new AddToCart();
  fromMoveFunction: boolean = false;
  @ViewChild('myCartModal') myCartModal: ElementRef;
  confirmValidationMsg = { label: '', message: '' };
  userData: any;
  cartData = [];
  loader: boolean = false;
  isFromES: boolean;
  eskey : any;
  isFilterVal:any = '0';
  existingItemsInGuestCart:any=[];
  constructor(
    public core: CoreService,
    private route: Router,
    private mycart: MyCartService
  ) { }

  ngOnInit() {
    this.core.checkIfLoggedOut(); /*** If User Logged Out*/
    this.core.hide();
    this.core.searchMsgToggle();
    localStorage.removeItem('existingItemsInCart');
    // localStorage.removeItem('existingItemsInWishList');
    if (window.localStorage['addedInGuestCart'] != undefined) {
      if(window.localStorage['existingItemsInGuestCart']!= undefined)
      {
        this.existingItemsInGuestCart = JSON.parse(window.localStorage['existingItemsInGuestCart']);
      }
      this.existingItemsInGuestCart.push(JSON.parse(window.localStorage['addedInGuestCart']));
      window.localStorage['existingItemsInGuestCart'] = JSON.stringify(this.existingItemsInGuestCart);
      localStorage.removeItem('addedInGuestCart'); 
    }
    
    // if (window.localStorage['userInfo'] != undefined) {
    //   this.userData = JSON.parse(window.localStorage['userInfo']);
    //   this.getCartItems(this.userData.userId);
    // }
    // else {
    //   this.loader = true;
    //   this.checkItemsInCart();
    //   this.checkItemsInWishlist();
    //   this.loader = false;
    // }

    this.loader = true;
    this.checkItemsInGuestCart();
    this.checkItemsInWishlist();
    //this.checkItemsInWishlist();
    this.loader = false;
  }
  ngAfterViewInit()
  {
    setTimeout(() => {
      this.core.removeWithoutLogClass();
    }, 1000);
  }


  checkItemsInGuestCart() {
    if (window.localStorage['existingItemsInGuestCart'] == undefined) {
      if (window.localStorage['addedInGuestCart'] != undefined) {
        this.itemsInCart.push(JSON.parse(window.localStorage['addedInGuestCart']));
        window.localStorage['existingItemsInGuestCart'] = JSON.stringify(this.itemsInCart);
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
      let existingItemsInCart = JSON.parse(window.localStorage['existingItemsInGuestCart']);
      for (var i = 0; i < existingItemsInCart.length; i++)
        if (this.fromMoveFunction == true) {
          if (existingItemsInCart[i].productId == this.itemsInCart[i].productId) existingItemsInCart.splice(i, 1);
        }
        else this.itemsInCart.push(existingItemsInCart[i]);
      if (window.localStorage['addedInGuestCart'] != undefined) {
        newItem = JSON.parse(window.localStorage['addedInGuestCart']);
        for (var i = 0; i < this.itemsInCart.length; i++) {
          if (newItem.productId == this.itemsInCart[i].productId) {
            this.itemsInCart[i].quantity = eval(`${this.itemsInCart[i].quantity + newItem.quantity}`)
            isThere = true;
            window.localStorage['existingItemsInGuestCart'] = JSON.stringify(this.itemsInCart);
            this.confirmValidationMsg.message = "Item updated in your cart";
            this.core.openModal(this.myCartModal);
            //alert("Item updated in your cart");
            localStorage.removeItem("addedInGuestCart");
            return false
          }
          else isThere = false;
        }
      }
      if (isThere == false) {
        this.itemsInCart.push(newItem);
        window.localStorage['existingItemsInGuestCart'] = JSON.stringify(this.itemsInCart);
      }
    }
    localStorage.removeItem("addedInGuestCart");
  }

  checkItemsInCart() {
    if (window.localStorage['existingItemsInGuestCart'] == undefined) {
      if (window.localStorage['addedInCart'] != undefined) {
        this.itemsInCart.push(JSON.parse(window.localStorage['addedInCart']));
        window.localStorage['existingItemsInGuestCart'] = JSON.stringify(this.itemsInCart);
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
      let existingItemsInCart = JSON.parse(window.localStorage['existingItemsInGuestCart']);
      for (var i = 0; i < existingItemsInCart.length; i++)
        if (this.fromMoveFunction == true) {
          if (existingItemsInCart[i].productId == this.itemsInCart[i].productId) existingItemsInCart.splice(i, 1);
        }
        else this.itemsInCart.push(existingItemsInCart[i]);
      if (window.localStorage['addedInCart'] != undefined) {
        newItem = JSON.parse(window.localStorage['addedInCart']);
        for (var i = 0; i < this.itemsInCart.length; i++) {
          if (newItem.productId == this.itemsInCart[i].productId) {
            this.itemsInCart[i].quantity = eval(`${this.itemsInCart[i].quantity + newItem.quantity}`)
            isThere = true;
            window.localStorage['existingItemsInGuestCart'] = JSON.stringify(this.itemsInCart);
            this.confirmValidationMsg.message = "Item updated in your cart";
            this.core.openModal(this.myCartModal);
            //alert("Item updated in your cart");
            localStorage.removeItem("addedInCart");
            return false
          }
          else isThere = false;
        }
      }
      if (isThere == false) {
        this.itemsInCart.push(newItem);
        window.localStorage['existingItemsInGuestCart'] = JSON.stringify(this.itemsInCart);
      }
    }
    localStorage.removeItem("addedInCart");
  }

  checkItemsInWishlist() {
    if (window.localStorage['existingItemsInWishList'] == undefined) {
      if (window.localStorage['savedForLater'] != undefined) {
        this.savedForLater.push(JSON.parse(window.localStorage['savedForLater']));
        window.localStorage['existingItemsInWishList'] = JSON.stringify(this.savedForLater);
      }
    }
    else {
      let newItem;
      let isThere: boolean;
      let existingItemsInWishList = JSON.parse(window.localStorage['existingItemsInWishList']);
      for (var i = 0; i < existingItemsInWishList.length; i++)
        if (this.fromMoveFunction == true) {
          if (existingItemsInWishList[i].productId == this.savedForLater[i].productId) existingItemsInWishList.splice(i, 1);
        }
        else this.savedForLater.push(existingItemsInWishList[i]);
      if (window.localStorage['savedForLater'] != undefined) {
        newItem = JSON.parse(window.localStorage['savedForLater']);
        for (var i = 0; i < this.savedForLater.length; i++) {
          if (newItem.productId == this.savedForLater[i].productId) {
            this.savedForLater[i].quantity = eval(`${this.savedForLater[i].quantity + newItem.quantity}`)
            isThere = true;
            window.localStorage['existingItemsInWishList'] = JSON.stringify(this.savedForLater);
            this.confirmValidationMsg.message = "Item updated in your wishlist";
            this.core.openModal(this.myCartModal);
            //alert("Item updated in your wishlist");
            localStorage.removeItem("savedForLater");
            return false
          }
          else isThere = false;
        }
      }
      if (isThere == false) {
        this.savedForLater.push(newItem);
        window.localStorage['existingItemsInWishList'] = JSON.stringify(this.savedForLater);
      }
    }
    localStorage.removeItem("savedForLater");
  }

  itemTotal(price, quantity) {
    return eval(`${price * quantity}`)
  }

  totalPayableAmount() {
    let amounts = [];
    for (var i = 0; i < this.itemsInCart.length; i++) {
      let item = this.itemsInCart[i];
      amounts.push(eval(`${item.quantity * item.price}`));
    }
    // let itemPrices = document.getElementsByClassName("itemPrices");
    // for (var i = 0; i < itemPrices.length; i++) amounts.push(parseFloat(itemPrices[i].innerHTML));
    this.TotalAmountCartPayable = eval(amounts.join("+"));
    return eval(amounts.join("+"));
  }

  calculateQantity(e, action, item) {
    for (var i = 0; i < this.itemsInCart.length; i++) {
      if (this.itemsInCart[i].productId == item.productId && action === "decrease") {
        if (item.quantity == 1) return false;
        else {
          item.quantity = item.quantity - 1;
          this.itemsInCart[i].quantity = item.quantity;
        }
      }
      else if (this.itemsInCart[i].productId == item.productId && action === "increase") {
        if (item.quantity == item.inStock) return false;
        else {
          item.quantity = item.quantity + 1;
          this.itemsInCart[i].quantity = item.quantity;
        }
      }
      this.itemTotal(item.price, item.quantity);
      this.totalPayableAmount();
    }
    window.localStorage['existingItemsInGuestCart'] = JSON.stringify(this.itemsInCart);
    this.saveCartData('quantity');
  }

  move(item, to) {
    this.cartEmpty = false;
    this.fromMoveFunction = true;
    this.addToCartModal.cartId = item.cartId != undefined?item.cartId:null;
    this.addToCartModal.retailerId = item.retailerId;
    this.addToCartModal.retailerName = item.retailerName;
    this.addToCartModal.productId = item.productId;
    this.addToCartModal.productName = item.productName;
    this.addToCartModal.price = item.price;
    this.addToCartModal.offerMade = item.offerMade == undefined?false:item.offerMade;
    this.addToCartModal.offerCreatedDate = (item.offerMade == undefined|| item.offerMade == false)? null:item.offerCreatedDate;
    this.addToCartModal.quantity = item.quantity;
    this.addToCartModal.inStock = item.inStock;
    this.addToCartModal.productImage = item.productImage;
    this.addToCartModal.taxCode = item.taxCode
    this.addToCartModal.shipProfileId = item.shipProfileId;
    this.addToCartModal.productDescription = item.productDescription;
    this.addToCartModal.productSKUCode = item.productSKUCode;
    this.addToCartModal.productUPCCode = item.productUPCCode;
    this.addToCartModal.shippingWidth = item.shippingWidth;
    this.addToCartModal.shippingHeight = item.shippingHeight;
    this.addToCartModal.shippingLength = item.shippingLength;
    this.addToCartModal.shippingWeight = item.shippingWeight;
    this.addToCartModal.orderFrom = item.orderFrom;
    this.addToCartModal.productHierarchy = item.productHierarchy;
    this.addToCartModal.productAttributes = item.productAttributes;
    if (to === 'toCart') {
      this.addToCartModal.label = "cart";
      let moveToCart: boolean = false;
      let cartItems;
      if (window.localStorage['existingItemsInGuestCart'] != undefined) {
        cartItems = JSON.parse(window.localStorage['existingItemsInGuestCart'])
        for (var i = 0; i < cartItems.length; i++) {
          if (this.addToCartModal.productId == cartItems[i].productId) {
            if (eval(`${this.addToCartModal.quantity + cartItems[i].quantity}`) > cartItems[i].inStock) {
              this.confirmValidationMsg.message = "Cannot move to cart";
              this.core.openModal(this.myCartModal);
              //alert("cannot move to cart");
              moveToCart = false;
              return false;
            }
            else moveToCart = true;
          }
          else if (this.addToCartModal.quantity > this.addToCartModal.inStock) moveToCart = false;
          else moveToCart = true;
        }
      }
      else if (this.addToCartModal.quantity > this.addToCartModal.inStock) {
        this.confirmValidationMsg.message = "Cannot move to cart due to unavailability of stock";
        this.core.openModal(this.myCartModal);
        //alert("cannot move to cart due to unavailability of stock");
        moveToCart = false;
        return false;
      }
      else moveToCart = true;
      if (moveToCart == true) {
        window.localStorage['addedInCart'] = JSON.stringify(this.addToCartModal);
        for (var i = 0; i < this.savedForLater.length; i++) {
          if (this.savedForLater[i].productId == this.addToCartModal.productId) {
            this.savedForLater.splice(i, 1);
          }
        }
        window.localStorage['existingItemsInWishList'] = JSON.stringify(this.savedForLater);
        if (this.savedForLater.length == 0) {
          this.noItemsInCart = false;
          this.cartEmpty = false;
          localStorage.removeItem("existingItemsInWishList");
        }
        this.checkItemsInCart();
      }
    }
    else {
      this.addToCartModal.label = "wishlist";
      let moveToWishList: boolean = false;
      let wishListItems;
      if (window.localStorage['existingItemsInWishList'] != undefined) {
        wishListItems = JSON.parse(window.localStorage['existingItemsInWishList']);
        for (var i = 0; i < wishListItems.length; i++) {
          if (this.addToCartModal.productId == wishListItems[i].productId) {
            if (eval(`${this.addToCartModal.quantity + wishListItems[i].quantity}`) > wishListItems[i].inStock) {
              this.confirmValidationMsg.message = "Cannot move to wishlist";
              this.core.openModal(this.myCartModal);
              //alert("cannot move to wishlist");
              moveToWishList = false;
              return false;
            }
            else moveToWishList = true;
          }
          else if (this.addToCartModal.quantity > this.addToCartModal.inStock) moveToWishList = false;
          else moveToWishList = true;
        }
      }
      else if (this.addToCartModal.quantity > this.addToCartModal.inStock) {
        this.confirmValidationMsg.message = "Cannot move to wishlist due to unavailability of stock";
        this.core.openModal(this.myCartModal);
        //alert("cannot move to wishlist due to unavailability of stock");
        moveToWishList = false;
        return false;
      }
      else moveToWishList = true;
      if (moveToWishList == true) {
        window.localStorage['savedForLater'] = JSON.stringify(this.addToCartModal);
        for (var i = 0; i < this.itemsInCart.length; i++) {
          if (this.itemsInCart[i].productId == this.addToCartModal.productId) {
            this.itemsInCart.splice(i, 1);
          }
        }
        window.localStorage['existingItemsInGuestCart'] = JSON.stringify(this.itemsInCart);
        if (this.itemsInCart.length == 0) {
          this.noItemsInCart = true;
          this.cartEmpty = true;
          localStorage.removeItem("existingItemsInGuestCart");
        }
        this.checkItemsInWishlist();
      }
    }
    this.fromMoveFunction = false;
    this.saveCartData('');
  }

  saveCartData(from) {
    if (from = '') this.loader = true;
    let data; let wishlist;
    if (window.localStorage['existingItemsInGuestCart'] != undefined) data = JSON.parse(window.localStorage['existingItemsInGuestCart']);
    if (window.localStorage['existingItemsInWishList'] != undefined) wishlist = JSON.parse(window.localStorage['existingItemsInWishList']);
    //let userData = JSON.parse(window.localStorage['userInfo']);
    // if (data != undefined) {
    //   for (var i = 0; i < data.length; i++) {
    //     data[i].userId = userData.userId;
    //   }
    // }
    // if (wishlist != undefined) {
    //   for (var i = 0; i < wishlist.length; i++) {
    //     wishlist[i].userId = userData.userId;
    //   }
    // }
    // this.cartData = new Array<SaveGetCartItems>();
    // if (data == undefined && wishlist == undefined) this.cartData = [];
    // else if (data != undefined && wishlist != undefined) this.cartData = [...data, ...wishlist];
    // else if (data == undefined) this.cartData = [...wishlist];
    // else this.cartData = [...data];
    // this.mycart.saveCartItems(this.cartData).subscribe((res) => {
    //   this.loader = false;
    //   if(res.length>0)
    //   {
    //     for (var i = 0; i < res.length; i++) {
    //       let items = res[i];
    //       this.appendCartId(items);
    //     }
    //   }
    //   this.appendCartId(res);
    // }, (err) => {
    //   this.loader = false;
    //   console.log(err);
    // })
  }
 appendCartId(item:any)
 {
   for (var i = 0; i < this.itemsInCart.length; i++) {
     if (this.itemsInCart[i].productId == item.productId) {
       this.itemsInCart[i].cartId = item.cartId;
     }
   }
   for (var i = 0; i < this.savedForLater.length; i++) {
     if (this.savedForLater[i].productId == item.productId) {
       this.savedForLater[i].cartId = item.cartId;
     }
   }
 }
  deleteItem(item, from) {
    if (from === 'cart') {
      for (var i = 0; i < this.itemsInCart.length; i++) {
        if (this.itemsInCart[i].productId == item.productId) {
          this.itemsInCart.splice(i, 1);
          window.localStorage['existingItemsInGuestCart'] = JSON.stringify(this.itemsInCart);
          this.totalPayableAmount();
        }
      }
      if (this.itemsInCart.length == 0) {
        this.noItemsInCart = true;
        this.cartEmpty = true;
        localStorage.removeItem("existingItemsInGuestCart");
      }
    }
    else {
      for (var i = 0; i < this.savedForLater.length; i++) {
        if (this.savedForLater[i].productId == item.productId) {
          this.savedForLater.splice(i, 1);
          window.localStorage['existingItemsInWishList'] = JSON.stringify(this.savedForLater);
        }
      }
      if (this.savedForLater.length == 0) localStorage.removeItem("existingItemsInWishList");
    }
    // this.mycart.deleteGuestCartItem(item).subscribe((res) => {
    //   console.log(res)
    // }, (err) => {
    //   console.log(err)
    // })
  }

  confirmUser() {
    window.localStorage['tbnAfterLogin'] = window.location.href;
    this.route.navigateByUrl('/login');
  }

  guestCheckOut() {
   
      let data = JSON.parse(window.localStorage['existingItemsInGuestCart']);
      window.localStorage['existingItemsInGuestCart'] = JSON.stringify(data);
      window.localStorage['TotalAmount'] = this.TotalAmountCartPayable;
      this.route.navigateByUrl("/search-result");
      this.core.resetAllConvoFlags();
      this.core.IsCheckout = true;
      this.core.isGuestCheckout = true;
   
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
  navigateToBrowse(selectedProduct:any)
  {
    let selectedTilesData;
    if(window.localStorage['levelSelections'] != undefined)
    {
      selectedTilesData = JSON.parse(window.localStorage['levelSelections']);
    }
    if(selectedTilesData == undefined || selectedTilesData.category == undefined || selectedTilesData.category.name == undefined ||
      selectedTilesData.subcategory == undefined || selectedTilesData.subcategory.name == undefined )
    {
      this.route.navigateByUrl('/home');
    }
    else
    {
      let url = ('/browse-product?category='+ encodeURIComponent(selectedTilesData.category.name) + '&catId='+ selectedTilesData.category.id+ '&subCategory='+encodeURIComponent(selectedTilesData.subcategory.name) + '&subCatId='+ selectedTilesData.subcategory.id + '&viewAll=' + true +"&IsFilter=" + this.isFilterVal );
      this.route.navigateByUrl('/', {skipLocationChange: true})
        .then(()=>this.route.navigateByUrl(url));
    }
    
  }
}
