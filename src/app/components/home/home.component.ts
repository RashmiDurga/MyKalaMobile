import { Component, OnInit, ViewEncapsulation, Output, EventEmitter, HostListener, OnDestroy } from '@angular/core';
import { HomeService } from '../../services/home.service';
import { CoreService } from '../../services/core.service';
import { SearchDataModal } from '../../models/searchData.modal';
import { Router, RouterOutlet } from '@angular/router';
import { environment } from '../../../environments/environment';
import { LoaderData, LoaderService } from '../../services/loader.service';
import { Ng4LoadingSpinnerModule, Ng4LoadingSpinnerService, Ng4LoadingSpinnerComponent } from 'ng4-loading-spinner';

import { PromotionalBannerModel } from '../../models/browse-products';
import { DeviceDetectorService } from 'ngx-device-detector';
import { NgbCarouselConfig } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class HomeComponent implements OnInit, OnDestroy {
  loader: boolean;
  tiles: any;
  carousalItems = [];
  searchData = [];
  s3 = environment.s3;
  placeIconsUrl: string = "mykala-dev-images/product/Places/icon_";
  placeImageUrl: string = "mykala-dev-images/product/Places/";
  categoryImageUrl: string = "mykala-dev-images/product/Places/";
  userResponse = { place: {}, type: {}, category: [], subcategory: [], subType: {} };
  response: any;
  breadCrums = [];
  customers: any = [];
  template: string = `<img src="./assets/images/kalaLoader.svg" class="custom-spinner-template" alt="Kala Loader">`;
  productAvailabilityModal = {};
  availableProducts = [];
  selectionLevel: number = 1;
  navigateToPlace: boolean = false;
  eskey : any;
  isFilterVal:any = '0';

  @Output() selectTile = new EventEmitter<any>();
  dealBanners: Array<PromotionalBannerModel> = [];
  dealBanner: any;
  bannerImgUrl: string = "mykala-dev-images/product/promotional_banners";
  carouselData: any;
  slideConfig = {
    "slidesToShow": 3,
    "slidesToScroll": 3,
    "nextArrow": "<div class='nav-btn next-slide'> > </div>",
    "prevArrow": "<div class='nav-btn prev-slide'> < </div>",
    "infinite": true
  };


  constructor(private routerOutlet: RouterOutlet, private router: Router, private homeService: HomeService, public core: CoreService, public loaderService: LoaderService, private ng4LoadingSpinnerService: Ng4LoadingSpinnerService) {
        this.slideConfig = {
          "slidesToShow": 3, 
          "slidesToScroll": 3,
          "nextArrow":"<div class='nav-btn next-slide'> > </div>",
          "prevArrow":"<div class='nav-btn prev-slide'> < </div>",
          "infinite": true
        };
      
   }

  ngOnInit() {
    this.ng4LoadingSpinnerService.show();
    this.core.searchMsgToggle();
    this.core.checkIfLoggedOut(); /*** If User Logged Out*/
    localStorage.removeItem('GetOfferStep_1');
    localStorage.removeItem('GetOfferStep_2');
    localStorage.removeItem('GetOfferStep_3');
    localStorage.removeItem('GetOfferStep_4');
    localStorage.removeItem('esKeyword');
    localStorage.removeItem('GetOfferStep_2Request');
    localStorage.removeItem("getOffers");
    localStorage.removeItem("filterdataStorage");
    localStorage.removeItem("filterdataSubCat");
    localStorage.removeItem("levelSelections");

    this.core.hide();
    this.core.pageLabel();
    this.getPlace();
    this.core.LoungeShowHide();
    document.getElementsByClassName("optionalFooter")[0] != undefined ? document.getElementsByClassName("optionalFooter")[0].classList.remove("optionalFooter") : {};
    this.core.footerSwap();
    this.core.resetAllConvoFlags();
    this.core.resetSignInOutFlags();
    this.core.searchBar = "";
    this.core.IsElasticSearch = false;
    this.ng4LoadingSpinnerService.hide();
    this.core.isSearchWithoutSuggestion = false;
    setTimeout(() => {
      document.getElementsByTagName('body')[0].style.backgroundColor = '#23130f';
    }, 100);

    this.dealBanner = environment.promotionalBanner['Home'];
    if (this.dealBanner != undefined && this.dealBanner != '') {
      let dealsArray = this.dealBanner.split(',');
      for (let i = 0; i < dealsArray.length; i++) {
        let bannerImg = `${this.s3}${this.bannerImgUrl}/${dealsArray[i]}_mobile.png`;
        let pmBanner = new PromotionalBannerModel();
        pmBanner.bannerName = dealsArray[i];
        pmBanner.bannerImg = bannerImg;
        this.dealBanners.push(pmBanner);
        console.log(this.dealBanners);
      }
    }
    this.getCarouselData();

  }

  

  ngOnDestroy() {
    document.getElementsByTagName('body')[0].style.backgroundColor = '';
  }

  afterChange(e) {
    console.log('afterChange');
  }
  
  beforeChange(e) {
    console.log('beforeChange');
  }

  //Get All Places
  getPlace() {
    this.homeService.getTilesPlace().subscribe(res => {
      for (var i = 0; i < res.length; i++) this.searchData.push(new SearchDataModal(res[i].placeId, res[i].placeName, res[i].placeName, "1", `${this.s3}${this.placeImageUrl}${res[i].placeName}.png`, `${this.s3}${this.placeIconsUrl}${res[i].placeName}.png`));
      this.tiles = this.searchData;
      this.searchData.sort((a, b) => a.orderNo - b.orderNo);
      /*Product Availability*/
      this.productAvailabilityModal = { levelName: null, levelId: null, levelCount: this.selectionLevel };
      this.homeService.productAvailability(this.productAvailabilityModal).subscribe((res) => {
        this.availableProducts = res.filter(item => item.level = this.selectionLevel);
        this.modifySearchData();
      }, (err) => {
        console.log("Error From Product Availability");
      });
      /*Product Availability*/
      this.searchData.forEach((item) => {
        if (item.name == 'Home & Garden') item.orderNo = 1;
        else if (item.name == 'Tools & Hardware') item.orderNo = 2;
        else if (item.name == 'Fashion & Apparel') item.orderNo = 3;
        else if (item.name == 'Kids') item.orderNo = 4;
        else if (item.name == 'Pets') item.orderNo = 5;
        else if (item.name == 'Electronics') item.orderNo = 6;
        else if (item.name == 'Automotive') item.orderNo = 7;
        else if (item.name == 'Sports & Fitness') item.orderNo = 8;
        else if (item.name == 'Health & Beauty') item.orderNo = 9;
        else if (item.name == 'Travel') item.orderNo = 10;
        else item.orderNo = 11;
      });
      // this.processArray(this.searchData);
      this.core.checkIfLoggedOut();
    });

    this.homeService.loadHorizontalMenuData().subscribe(res => {

      //this.horizontalMmenuDataArray = res;
      var filtered = res.filter(function (el) {
        return el.count > 0;
      });
      this.core.placeCategDataArrayGeneric = filtered;
      //this.checkProductExists();
    }, (err) => {
      console.log("Error From Product Availability");
    });


  }

  tileSelected(tile, IsBc) {
    if (tile.hasOwnProperty("tile") == true) var tile = tile['tile'];
    else var tile = tile;
    if (tile == undefined) this.breadCrums = [];
    for (var i = 0; i < this.breadCrums.length; i++) {
      let bc = this.breadCrums[i];
      if (bc.id == tile.id) this.breadCrums.splice(i + 1, 1);
    }
    if (IsBc == undefined) this.breadCrums.push(tile);
    this.searchData = [];

    //Get Category
    if (tile && tile.level == "1") {
      this.selectionLevel = 2;
      this.loader = true;
      this.userResponse.place = tile;
      window.localStorage['levelSelections'] = JSON.stringify(this.userResponse);
      if (this.routerOutlet.isActivated) this.routerOutlet.deactivate();
      this.router.navigateByUrl('/browse-subcat?place='+encodeURIComponent(tile.name) + '&placeId='+ tile.id);
      // this.homeService.getTilesCategory(tile.id).subscribe((res) => {
      //   this.loader = false;
      //   for (var i = 0; i < res.length; i++) this.searchData.push(new SearchDataModal(res[i].categoryId, res[i].categoryName, res[i].categoryName, "2", `${this.s3}${this.categoryImageUrl}${tile.name}/${res[i].categoryName}.jpg`));
      //   this.tiles = this.searchData;
      //   console.log(this.searchData);
      //   /*order Products*/
      //   this.orderProducts(tile);
      //   /*order Products*/
        
      //   /*Product Availability*/
      //   this.productAvailabilityModal = { levelName: tile.name, levelId: tile.id, levelCount: this.selectionLevel };
      //   this.homeService.productAvailability(this.productAvailabilityModal).subscribe((res) => {
      //     this.availableProducts = res.filter(item => item.level = this.selectionLevel);
      //     this.modifySearchData();
      //   }, (err) => {
      //     console.log("Error From Product Availability");
      //   });
      //   /*Product Availability*/
      // });
    }
    //Get Sub Category
    else if (tile && tile.level == "2") {
      this.userResponse.category = tile;
      window.localStorage['levelSelections'] = JSON.stringify(this.userResponse);
      if (this.routerOutlet.isActivated) this.routerOutlet.deactivate();
      this.router.navigateByUrl('/browse-product?category='+tile.name.replace(/ /g, "-") + '&catId='+ tile.id);
    }
    //Get Type
    else if (tile && tile.level == "3") {
      this.userResponse.subcategory = tile;
      window.localStorage['levelSelections'] = JSON.stringify(this.userResponse);
      if (this.routerOutlet.isActivated) this.routerOutlet.deactivate();
      this.router.navigateByUrl('/browse-product?category='+tile.name.replace(/ /g, "-") + '&catId='+ tile.id);
    }
    //Get Place
    else {
      this.selectionLevel = 1;
      this.getPlace();
    }
  }

  modifySearchData() {
    let getLevelBasedData = this.availableProducts.filter(item => item.level == this.selectionLevel);
    for (let i = 0; i < getLevelBasedData.length; i++) {
      for (let j = 0; j < this.searchData.length; j++) {
        if (getLevelBasedData[i].name == this.searchData[j].name && getLevelBasedData[i].level === parseInt(this.searchData[j].level)) {
          this.searchData[j].isProductAvailable = true;
          break;
        }
      }
    }
  }

  reloadPlaces() {
    this.navigateToPlace = false;
    this.selectionLevel = 1;
    this.searchData = [];
    this.getPlace();
  }


  async getCarouselData() {
    var response = await this.core.searchProductCarousel("https://api.mykala.com/api/products/public/saleProduct");
    this.carouselData = response;
    console.log(this.carouselData);
  }

  slickInit(e) {
    console.log('slick initialized');
  }

  prevSlide() {
    var carosal = document.getElementsByClassName('carousel-item');
    carosal[1].setAttribute("class", "carousel-item")
    carosal[0].setAttribute("class", "carousel-item active");
  }

  nextSlide() {
    var carosal = document.getElementsByClassName('carousel-item');
    carosal[0].setAttribute("class", "carousel-item");
    carosal[1].setAttribute("class", "carousel-item active");
  }

  viewBestDealsDetails(tile) {
    if (window.localStorage['levelSelections'] != undefined) {

      let updateStorage = JSON.parse(window.localStorage['levelSelections']);
      updateStorage.subType.id = tile.kalaUniqueId;
      updateStorage.subType.name = tile.productName;
      updateStorage.subType.text = tile.productName;
      updateStorage.subType.level = "5";
      updateStorage.subType.imgUrl = tile.productImages.length > 0 ? tile.productImages[0].location : {};
      window.localStorage['levelSelections'] = JSON.stringify(updateStorage);
    }
    window.localStorage['selectedProduct'] = JSON.stringify(tile);
    // if(this.ids.length ==0)
    // {
    //   this.filteredData = [];
    // }
    // else
    // {
    //   window.localStorage['filterdataStorage'] = JSON.stringify(this.filteredData);
    //   window.localStorage['filterIDs'] = JSON.stringify(this.ids);
    // }
    let url = '';
    if (tile.attributes != undefined) {
      if (tile.attributes.Brand == undefined)
        url = '/view-product?productName=' + encodeURIComponent(tile.productName) + '&productId=' + tile.kalaUniqueId + '&Isfilter=0';
      else
        url = '/view-product?brandName=' + encodeURIComponent(tile.attributes.Brand) + '&productName=' + encodeURIComponent(tile.productName) + '&productId=' + tile.kalaUniqueId + '&Isfilter=0';

    }
    else {
      url = '/view-product?brandName=' + encodeURIComponent(tile.attributes.Brand) + '&productName=' + encodeURIComponent(tile.productName) + '&productId=' + tile.kalaUniqueId + '&Isfilter=0';
    }
    this.router.navigateByUrl(url);
  }

  resetOverlay(e) {
    let elements = document.querySelectorAll('.overlay_CS');
    if (elements) {
      for (let i = 0; i < elements.length; i++) {
        let elem = elements[i] as HTMLElement;
        elem.classList.add('d-none');
      }
    }
    if (e.currentTarget.querySelectorAll('.overlay_CS')[0]) e.currentTarget.querySelectorAll('.overlay_CS')[0].classList.remove('d-none');
  }

  getSelectedTile(tile) {
    this.selectTile.emit({ tile })
  }

  viewAllPlaceProducts(place: any) {
    this.selectionLevel = 2;
    let placeToSend = new SearchDataModal(place.placeId, place.placeName, place.placeName, "1", `${this.s3}${this.placeImageUrl}${place.placeName}.png`, `${this.s3}${this.placeIconsUrl}${place.placeName}.png`, '', false, true);
    this.userResponse = { place: {}, type: {}, category: [], subcategory: [], subType: {} };
    this.userResponse.place = placeToSend;
    window.localStorage['levelSelections'] = JSON.stringify(this.userResponse);
    let url = ('/browse-subcat?place=' + encodeURIComponent(place.placeName) + '&placeId=' + place.placeId);
    setTimeout(() => {
      let elements = document.getElementsByClassName("main-menu");
      if (elements != undefined) {
        elements[0].classList.add("invisible");
      }
    }, 500);
    this.router.navigateByUrl('/', { skipLocationChange: true })
      .then(() => this.router.navigateByUrl(url));
  }

  viewAllCategProducts(place: any, categ: any) {
    this.userResponse = { place: {}, type: {}, category: [], subcategory: [], subType: {} };
    let placeToSend = new SearchDataModal(place.placeId, place.placeName, place.placeName, "1", `${this.s3}${this.placeImageUrl}${place.placeName}.png`, `${this.s3}${this.placeIconsUrl}${place.placeName}.png`, '', false, true);
    this.userResponse.place = placeToSend;
    let CategToSend = new SearchDataModal(categ.categoryId, categ.categoryName, categ.categoryName, "2", `${this.s3}${this.categoryImageUrl}${place.placeName}/${categ.categoryName}.jpg`, '', '', false, true);
    this.userResponse.category = CategToSend as any;
    setTimeout(() => {
      let elements = document.getElementsByClassName("main-menu");
      if (elements != undefined) {
        elements[0].classList.add("invisible");
      }
    }, 500);
    window.localStorage['levelSelections'] = JSON.stringify(this.userResponse);
    let url = ('/browse-subcatgroup?placeId=' + place.placeId + '&placeName=' + encodeURIComponent(place.placeName) + '&category=' + encodeURIComponent(categ.categoryName) + '&catId=' + categ.categoryId);
    this.router.navigateByUrl('/', { skipLocationChange: true })
      .then(() => this.router.navigateByUrl(url));
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
    this.router.navigateByUrl('/', {skipLocationChange: true})
      .then(()=>this.router.navigateByUrl(url));
    //this.router.navigateByUrl(url);
    //this.router.navigateByUrl('/browse-product?subCategory='+encodeURIComponent(subcat.subCategoryName) + '&subCatId='+ subcat.subCategoryId + '&viewAll=' + true);
  }

  checkProductExists() {
    for (let i = 0; i < this.core.placeCategDataArrayGeneric.length; i++) {
      if (this.core.placeCategDataArrayGeneric[i].count == 0) {
        this.core.placeCategDataArrayGeneric[i].remove(this.core.placeCategDataArrayGeneric[i]);
        continue;
      }
      for (let j = 0; j < this.core.placeCategDataArrayGeneric[i].categoryList.length; j++) {
        if (this.core.placeCategDataArrayGeneric[i].categoryList[j].count == 0) {
          this.core.placeCategDataArrayGeneric[i].categoryList.remove(this.core.placeCategDataArrayGeneric[i].categoryList[j]);
          continue;
        }
        for (let k = 0; k < this.core.placeCategDataArrayGeneric[i].categoryList[j].subCategoryList.length; k++) {
          if (this.core.placeCategDataArrayGeneric[i].categoryList[j].subCategoryList[k].count == 0) {
            this.core.placeCategDataArrayGeneric[i].categoryList[j].subCategoryList.remove(this.core.placeCategDataArrayGeneric[i].categoryList[j].subCategoryList[k]);
          }
        }
      }
    }

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

  viewBannerResult(banner:any)
  {
    if (window.localStorage['esKeyword'] != undefined) {
      this.eskey = JSON.parse(window.localStorage['esKeyword']).text;
      this.router.navigateByUrl('/promo-banner-product?search=' + this.eskey +"&IsFilter=" + this.isFilterVal  +"&fromBanner=" + encodeURIComponent(banner.bannerName) +"&promotionalIds="+ environment.promotionalBannerIds[banner.bannerName]);
    }
    else
    {
      //this.eskey = JSON.parse(window.localStorage['searchKeyword']).text;
      this.router.navigateByUrl('/promo-banner-product?search=' +encodeURIComponent(banner.bannerName.replace('_',' '))  +"&fromBanner=" + encodeURIComponent(banner.bannerName) +"&promotionalIds="+ environment.promotionalBannerIds[banner.bannerName]);

      //this.router.navigateByUrl("/promo-banner-product?search=Furniture&IsFilter=" + this.isFilterVal  +"&fromBanner=" + encodeURIComponent('Home & Garden_Furniture') +"&promotionalIds="+ environment.promotionalBannerIds['Home & Garden_Furniture']);
    }
    // let url ='/browse-product?category='+ encodeURIComponent(categ.categoryName) + '&catId='+ categ.categoryId+ '&subCategory='+encodeURIComponent(subcat.subCategoryName) + '&subCatId='+ subcat.subCategoryId + '&viewAll=' + true;
    // this.router.navigateByUrl('/', {skipLocationChange: true})
    //   .then(()=>this.router.navigateByUrl(url));
  }


}