import { Component, OnInit, ViewEncapsulation, ViewChild, ElementRef } from '@angular/core';
import { CoreService } from '../../services/core.service';
import { AddToCart } from '../../models/addToCart';
import { Router } from '@angular/router';
import { MyCartService } from '../../services/mycart.service';
import { SaveGetCartItems } from '../../models/save-get-cart';

@Component({
  selector: 'app-mycart',
  templateUrl: './mycart.component.html',
  styleUrls: ['./mycart.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class MycartComponent implements OnInit {
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
  IsUserLoggedIn: boolean = false;
  fromES: boolean = false;

  constructor(
    public core: CoreService,
    private route: Router,
    private mycart: MyCartService
  ) { }

   ngOnInit() {
    this.core.checkIfLoggedOut(); /*** If User Logged Out*/
    this.core.hide();
    this.core.searchMsgToggle();
    this.core.LoungeShowHide();
    this.core.footerSwap();
    window.localStorage['esKeyword'] != undefined ? this.fromES = true : this.fromES = false;
    let appFooter = document.getElementsByClassName("footer")[0];
    appFooter.classList.remove("hideFooter");
    localStorage.removeItem('existingItemsInCart');
    localStorage.removeItem('existingItemsInWishList');
    if (window.localStorage['userInfo'] != undefined) {
      this.userData = JSON.parse(window.localStorage['userInfo']);
      this.IsUserLoggedIn = true;
      this.getCartItems(this.userData.userId);
    }
    else this.IsUserLoggedIn = false;
  }

  getCartItems(userId) {
    this.loader = true;
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
          cartItems.push(this.cartData[i]);
          window.localStorage['existingItemsInCart'] = JSON.stringify(cartItems);
        }
        else {
          wishListItems.push(this.cartData[i]);
          window.localStorage['existingItemsInWishList'] = JSON.stringify(wishListItems);
        }
      }
      this.checkItemsInCart();
      this.checkItemsInWishlist();
      this.loader = false;
      if (window.localStorage['callSaveCart'] != undefined) {
        localStorage.removeItem('callSaveCart');
        this.saveCartData();
      }
    }, (err) => {
      console.log(err);
    })
  }

  checkItemsInCart() {
    if (window.localStorage['existingItemsInCart'] == undefined) {
      if (window.localStorage['addedInCart'] != undefined) {
        this.itemsInCart.push(JSON.parse(window.localStorage['addedInCart']));
        window.localStorage['existingItemsInCart'] = JSON.stringify(this.itemsInCart);
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
          if (existingItemsInCart[i].productId == this.itemsInCart[i].productId) existingItemsInCart.splice(i, 1);
        }
        else this.itemsInCart.push(existingItemsInCart[i]);
      if (window.localStorage['addedInCart'] != undefined) {
        newItem = JSON.parse(window.localStorage['addedInCart']);
        for (var i = 0; i < this.itemsInCart.length; i++) {
          if (newItem.productId == this.itemsInCart[i].productId) {
            this.itemsInCart[i].quantity = eval(`${this.itemsInCart[i].quantity + newItem.quantity}`)
            isThere = true;
            window.localStorage['existingItemsInCart'] = JSON.stringify(this.itemsInCart);
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
        window.localStorage['existingItemsInCart'] = JSON.stringify(this.itemsInCart);
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
    window.localStorage['existingItemsInCart'] = JSON.stringify(this.itemsInCart);
    this.saveCartData('quantity');
  }

  move(item, to) {
    this.cartEmpty = false;
    this.fromMoveFunction = true;
    this.addToCartModal.cartId = item.cartId != undefined? item.cartId : null;
    this.addToCartModal.retailerId = item.retailerId;
    this.addToCartModal.retailerName = item.retailerName;
    this.addToCartModal.productId = item.productId;
    this.addToCartModal.productName = item.productName;
    this.addToCartModal.price = item.price;
    this.addToCartModal.offerMade = item.offerMade == undefined?false:item.offerMade;
    this.addToCartModal.offerCreatedDate =(item.offerMade == undefined || item.offerMade == false)?null: item.offerCreatedDate;
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
      if (window.localStorage['existingItemsInCart'] != undefined) {
        cartItems = JSON.parse(window.localStorage['existingItemsInCart'])
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
        window.localStorage['existingItemsInCart'] = JSON.stringify(this.itemsInCart);
        if (this.itemsInCart.length == 0) {
          this.noItemsInCart = true;
          this.cartEmpty = true;
          localStorage.removeItem("existingItemsInCart");
        }
        this.checkItemsInWishlist();
      }
    }
    this.fromMoveFunction = false;
    this.saveCartData();
  }

  saveCartData(from?: string) {
    if (from == undefined) this.loader = true;
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
      if(res.length>0)
      {
        for(var i=0;i<res.length;i++)
        {
          let items = res[i];
          this.appendCartId(items);
        }
      }
      console.log(res);
    }, (err) => {
      this.loader = false;
      console.log(err);
    })
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
          window.localStorage['existingItemsInCart'] = JSON.stringify(this.itemsInCart);
          this.totalPayableAmount();
        }
      }
      if (this.itemsInCart.length == 0) {
        this.noItemsInCart = true;
        this.cartEmpty = true;
        localStorage.removeItem("existingItemsInCart");
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
    this.mycart.deleteCartItem(item).subscribe((res) => {
      console.log(res)
    }, (err) => {
      console.log(err)
    })
  }

  confirmUser() {
    window.localStorage['tbnAfterLogin'] = window.location.hash.split("#")[1];
    this.route.navigateByUrl('/login');
  }

  checkOut() {
    if (window.localStorage['token'] == undefined) {
      let action = confirm("You must be logged in to checkout your cart items!\n\nDo you want to login now ?");
      if (action == true) {
        window.localStorage['tbnAfterLogin'] = window.location.hash.split("#")[1];
        this.route.navigateByUrl('/login')
      }
      else return false;
    }
    else {
      let data = JSON.parse(window.localStorage['existingItemsInCart']);
      window.localStorage['existingItemsInCart'] = JSON.stringify(data);
      window.localStorage['TotalAmount'] = this.TotalAmountCartPayable;
      this.core.resetAllConvoFlags();
      this.core.IsCheckout = true;
      this.route.navigateByUrl("/search-result");
    }
  }
}
