import { Component, OnInit, ViewEncapsulation, Input, Output, EventEmitter, ChangeDetectorRef, HostListener } from '@angular/core';
import { HomeService } from '../../services/home.service';
import { CoreService } from '../../services/core.service';
import { Router, RouterOutlet, ActivatedRoute } from '@angular/router';
import { SearchDataModal } from '../../models/searchData.modal';
import { BrowseProductsModal } from '../../models/browse-products';
import { environment } from '../../../environments/environment';
import { element } from 'protractor';
import { DynamicFilters, DynamicFilterLevelData } from '../../models/dynamicFilter';
import { FilterMapPlaceData, FilterMapCategoryData } from '../../models/filterMapData';
import { async } from 'q';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { Location } from '@angular/common';


@Component({
  selector: 'app-browse-product',
  templateUrl: './browse-product.component.html',
  styleUrls: ['./browse-product.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class BrowseProductComponent implements OnInit {
  s3 = environment.s3
  @Input() selectedTilesData: any;
  placeData: any;
  tilesData = [];
  subCategory = [];
  categoryList = [];
  showmoreFrom: any;
  loader: boolean = false;
  loaderCategory: boolean;
  loadersubCategory: boolean;
  @Output() selectTile = new EventEmitter<any>();
  headerMessage: string;
  showSubMenu: boolean;
  selectedCategoryData: any;
  getOffersData;
  productListingModal = new BrowseProductsModal();
  showMorePageCounter = 0;
  showMoreSizeCounter = 30;
  showMoreBtn: boolean = false;
  showFilterPanel: boolean = false;
  filterModalAPI = { "fieldValues": [] };
  filteredData: Array<DynamicFilters>;
  toStr = JSON.stringify;
  ids: Array<any> = new Array;
  increaseLevel: number = 0;
  newData: Array<any> = new Array;
  lastParentLevel: number;
  nextItemArr: Array<any> = [];
  productAvailabilityModal = {};
  productAvailabilityResponse = [];
  productAvailabilityCategoryIC = [];
  defaultProductLevel: number = 3;
  placett: any;
  cat: any;
  catId: any;
  placeName: any;
  categoryName: any;
  placeId: any;
  isFilterValue: any = '0';
  isrefreshsubCat: boolean = false;
  selectFixBool: boolean = false;
  prevSelectionData: any;
  prevSelectionParent: any;
  selectedDatavalue: any;
  SubCategoryStr = "Sub Category";
  typeStr = "Type";
  subCategoryName: any;
  subCatId: any;
  viewAll: any;
  searchPlaceData = [];
  availableProducts = [];
  selectionLevel: number = 1;
  tilesPlaces = []
  placeIconsUrl: string = "mykala-dev-images/product/Places/icon_";
  placeImageUrl: string = "mykala-dev-images/product/Places/";
  categoryImageUrl: string = "mykala-dev-images/product/Places/";
  searchData = [];
  tiles: any;
  subCatDataToSend = new DynamicFilterLevelData();
  filteredDataCarousel: Array<DynamicFilters>;
  userResponse = { place: {}, type: {}, category: [], subcategory: {}, subType: {} };
  maxPrice = 5000;
  minPrice = 0;
  priceValue: any;
  startValue = 50;
  endValue = 10;
  fromBanner:any;
  getOffer_orderInfo: FormGroup;
  columns = [{
    name: "first",
    start: 1,
    end: 99
  }, {
    name: "second",
    start: 10,
    end: 90
  }, {
    name: "third",
    start: 20,
    end: 80
  }];
  minValuePrice = 0;
  maxValuePrice = 0;
  showCategoryFilterBar: boolean = false;
  showCategoryPanel: boolean = false;
  afterFilter: boolean = false;
  isFilterUsed: boolean = false;
  textAsSearchedTerm: string;
  parentNameAsCategoryName: string;
  parentIdAsCategoryId: string;
  levelId:string;
  showMoreReqWithFilter: Array<string[]>;
  esSizeCounter = 30;
  esFromCounter = 0;
  constructor(private homeService: HomeService, private cd: ChangeDetectorRef, private formBuilder: FormBuilder, public core: CoreService, private router: ActivatedRoute, private route: Router, private routerOutlet: RouterOutlet, private location: Location) {
    this.cat = router.snapshot.queryParams['category'];
    this.catId = router.snapshot.queryParams['catId'];
    this.isFilterValue = router.snapshot.queryParams['IsFilter'];
    this.subCategoryName = router.snapshot.queryParams['subCategory'];
    this.subCatId = router.snapshot.queryParams['subCatId'];
    this.viewAll = router.snapshot.queryParams['viewAll'];
  }

  async ngOnInit() {
    this.core.checkIfLoggedOut(); /*** If User Logged Out*/
    localStorage.removeItem('GetOfferStep_1');
    localStorage.removeItem('GetOfferStep_2');
    localStorage.removeItem('GetOfferStep_3');
    localStorage.removeItem('GetOfferStep_4');
    localStorage.removeItem('changeBackFn');
    localStorage.removeItem('GetOfferPrice');
    this.core.headerScroll();
    localStorage.removeItem("selectedProduct");
    this.loader = true;
    this.getPlace();
    this.getOffer_orderInfo = this.formBuilder.group({
      "minPrice": 0,
      "maxPrice": [this.maxPrice]
    });
    if (this.viewAll) {
      this.getCarouselFilterData(this.subCatId);
      this.productAvailabilityModal = { levelName: this.cat, levelId: this.catId, levelCount: 3 };
      this.productAvailabilityResponse = await this.homeService.checkProductAvailability(this.productAvailabilityModal);
      this.productAvailabilityResponse = this.productAvailabilityResponse.filter(item => item.level = 3);

    }
    else {

      await this.loadTypes(undefined);
      this.productAvailabilityResponse = await this.homeService.checkProductAvailability(this.productAvailabilityModal);
      this.productAvailabilityResponse = this.productAvailabilityResponse.filter(item => item.level = this.defaultProductLevel);

    }
    this.core.pageLabel();
    this.loadTypeData();
    await this.getMinMaxPrice();
   
  }
  async getMinMaxPrice()
  {
    
      var response = await this.core.getPriceRange(this.subCatId);
      this.minPrice = response.minPrice;
      this.maxPrice = response.maxPrice;
      this.maxValuePrice =  response.maxPrice;
     
  
}
  onScroll() {
    console.log('scrolled!!');
    this.loadTypes('loadMore');
  }
  async ngAfterViewInit() {
    setTimeout(async () => {
      var homePageHeader = document.getElementsByClassName("homePageHeader");
      if (homePageHeader != undefined)
        homePageHeader.length != 0 ? homePageHeader[0].classList.remove("homePageHeader") : {};


      var hdScrl = document.getElementsByClassName('header_Scroll');
      if (hdScrl.length != 0) {
        if (window.localStorage['userInfo'] == undefined)
          hdScrl[0].classList.add("withoutLog");
      }
      this.selectedTilesData = JSON.parse(window.localStorage['levelSelections']);
      if (window.localStorage['filterdataStorage'] != undefined) {
        this.filteredData = JSON.parse(window.localStorage['filterdataStorage']);
        //this.showFilterPanel = true;
        this.ids = JSON.parse(window.localStorage['filterIDs']);
        //this.subCategory = JSON.parse(window.localStorage['filterSubCategory'] );
      }
      else {
        localStorage.removeItem('filterdataStorage');
        this.showFilterPanel = false;
      }

      if (window.localStorage['filterdataSubCat'] != undefined) {
        await this.refreshSubcategory(JSON.parse(window.localStorage['filterdataSubCat']));
      }

    }, 500);
  }

  /*Sequential Search Result*/
  async loadTypes(from?: any) {
    this.loader = true;
    this.showmoreFrom = from;
    if (from == undefined) this.tilesData = [];
    else this.showMorePageCounter++;
      if(this.showMorePageCounter > 0 && this.ids.length > 0)
      {
        this.loadShowMoreIfFilterselected();
        
      }
      else
      {
      if(this.catId != undefined && !this.isrefreshsubCat)
      {
       let placett = await this.homeService.getPlaceByCatId(this.catId);
        this.placeData = placett;
        this.categoryName = placett.categoryName;
        this.placeName = placett.placeName;
        this.placeId = placett.placeId;

        this.selectedTilesData={};
        this.selectedTilesData.category ={};
        this.selectedTilesData.category.name = this.categoryName;
        this.selectedTilesData.category.id = this.catId;
        this.selectedTilesData.category.text = this.categoryName;
        this.selectedTilesData.place={};
        this.selectedTilesData.place.name = this.placeName;
        this.selectedTilesData.place.id = this.placeId;
        this.selectedTilesData.subcategory = [];
        this.selectedTilesData.subType ={};
        window.localStorage['levelSelections'] = JSON.stringify(this.selectedTilesData);
        this.productAvailabilityModal = { levelName:this.categoryName, levelId: this.catId, levelCount: this.defaultProductLevel };

        if(window.localStorage['filterdataStorage'] == undefined)
        {
         
          if(window.localStorage['filterdataSubCat'] == undefined)
          {
            let resp = await this.homeService.getProductList(this.placeName,  this.categoryName, this.showMorePageCounter, this.showMoreSizeCounter, undefined);
          
            this.filterResponse(resp);
           
          }
        }
        // else
        // {
        //   this.homeService.getProductList(this.placeName,  this.categoryName, this.showMorePageCounter, this.showMoreSizeCounter, undefined).subscribe(res => {
          
        //     this.filterResponse(res);
        //   });
        // }
      
    }
    else{
      this.selectedTilesData = JSON.parse(window.localStorage['levelSelections']);
     
        if( window.localStorage['filterdataStorage'] == undefined)
        {
           let respons = await this.homeService.getProductList(this.selectedTilesData.place.name, this.selectedTilesData.category.name, this.showMorePageCounter, this.showMoreSizeCounter, this.selectedTilesData.subcategory.name);
            this.filterResponse(respons);
          
          this.productAvailabilityModal = { levelName: this.selectedTilesData.category.name, levelId: this.selectedTilesData.category.id, levelCount: this.defaultProductLevel };
        
        }

      // }
      // else{
      //   await this.homeService.getProductList(this.selectedTilesData.place.name, this.selectedTilesData.category.name, this.showMorePageCounter, this.showMoreSizeCounter, this.selectedTilesData.subcategory.name).subscribe(res => {
      //     this.filterResponse(res);
      //   });
      //   this.productAvailabilityModal = { levelName: this.selectedTilesData.category.name, levelId: this.selectedTilesData.category.id, levelCount: this.defaultProductLevel };
      
      // }
    }
  }
    
  }
  getCarouselFilterData(ids: any) {
    return new Promise(async (respo, rej) => {
      this.homeService.loadProductFromFilterSync(ids, this.getOffer_orderInfo.controls.minPrice.value, this.getOffer_orderInfo.controls.maxPrice.value, 0, 30).subscribe((response) => {
        this.tilesData = [];
        if (response.content.length > 0) {
          this.filterResponse(response);
          //this.lastParentLevel = parent.level;
        }
        else {
          this.headerMessage = 'Sorry, but we don\'t have product matches for you';
          this.core.show(this.headerMessage);
          window.localStorage['browseProductSearch'] = this.headerMessage;
        }
        // if(response.content.length > 0)
        //   this.filteredDataCarousel.push(new DynamicFiltersCarousel(new DynamicFilters(false, this.increaseLevel, res, [], "", this.defaultProductLevel),response.content));
        // //  this.homeService.filterLoadTypeSync(fileter).subscribe((resp) => {

        //     this.filteredDataCarousel.push(new DynamicFiltersCarousel(new DynamicFilters(false, this.increaseLevel, res, [], "", this.defaultProductLevel),resp));
        respo();
      }, (err) => {
        console.log("Error From Product Availability");
        rej();
      });
    });
  }
  filterResponse(res) {
    if (res.content.length < 30) this.showMoreBtn = false;
    else this.showMoreBtn = true;
    if (this.showmoreFrom != 'loadMore') {
      this.tilesData = [];
    }
    for (var i = 0; i < res.content.length; i++) {
      let content = res.content[i];
      this.productListingModal = new BrowseProductsModal(content);

      if (this.productListingModal.product.productStatus != false) this.tilesData.push(this.productListingModal);
    }
    this.loader = false;
    this.filterIamgeURL();
    this.getMainImage();
    if (this.tilesData.length > 0) {
      if (this.tilesData.length == 1) this.headerMessage = 'Nice! We matched' + ' ' + this.tilesData.length + ' product for you';
      else this.headerMessage = 'Nice! We matched' + ' ' + this.tilesData.length + ' products for you';
    }
    else this.headerMessage = 'Sorry, but we don\'t have product matches for you';
    if (this.selectedTilesData != undefined && this.selectedTilesData.subcategory.length == undefined) {
      if (this.tilesData.length > 0) {
        if (this.tilesData.length == 1) this.headerMessage = 'Nice! We matched' + ' ' + this.tilesData.length + ' product for you';
        else this.headerMessage = 'Nice! We matched' + ' ' + this.tilesData.length + ' products for you';
      }
      else this.headerMessage = 'Sorry, but we don\'t have product matches for you';
    }
    this.core.show(this.headerMessage);
    this.core.searchMsgToggle();
    window.localStorage['browseProductSearch'] = this.headerMessage;
  }

  filterIamgeURL() {
    for (var i = 0; i < this.tilesData.length; i++) {
      if (this.tilesData[i].product.productImages) {
        for (var j = 0; j < this.tilesData[i].product.productImages.length; j++) {
          let product = this.tilesData[i].product.productImages[j];
          if (product.location.indexOf('data:') === -1 && product.location.indexOf('https:') === -1 && product.location.indexOf('http:') === -1) {
            this.tilesData[i].product.productImages[j].location = this.s3 + product.location;
          }
          if (product.location.indexOf('maxHeight') > -1) {
            this.tilesData[i].product.productImages[j].location = product.location.split(";")[0];
          }
        }
      }
    }
  }

  getMainImage() {
    for (var i = 0; i < this.tilesData.length; i++) {
      if (this.tilesData[i].product.productImages) {
        for (var j = 0; j < this.tilesData[i].product.productImages.length; j++) {
          let product = this.tilesData[i].product.productImages[j]
          if (product.mainImage == true) {
            this.tilesData[i].product.mainImageSrc = product.location
          }
        }
      }
    }
  }

  openNav() {
    this.categoryList = [];
    this.loaderCategory = true;
    document.getElementById("mySidenav").style.width = "300px";
    this.homeService.getTilesCategory(this.selectedTilesData.place.id).subscribe(res => {
      this.loaderCategory = false;
      for (var i = 0; i < res.length; i++) this.categoryList.push(new SearchDataModal(res[i].categoryId, res[i].categoryName, res[i].categoryName, "2", "", "", "", false));
      if (this.categoryList.length > 0)
        this.categoryList.sort((a, b): number => {
          if (a.name < b.name) return -1;
          if (a.name > b.name) return 1;
          return 0;

        });
      let data = { levelName: this.selectedTilesData.place.name, levelId: this.selectedTilesData.place.id, levelCount: 2 };
      this.productAvailability(data, 'c', 2);
    });
  };

  closeNav() {
    document.getElementById("mySidenav").style.width = "0px";
  };

  loadSubcategory(e, object) {
    this.loadersubCategory = true;
    this.selectedCategoryData = object;
    window.localStorage['filterdataCat'] = JSON.stringify(this.selectedCategoryData);
    this.subCategory = [];
    for (var i = 0; i < this.categoryList.length; i++) this.categoryList[i].expanded = false;
    object.expanded = true;
    this.homeService.getTilesSubCategory(object.id).subscribe(res => {
      this.loadersubCategory = false;
      for (var i = 0; i < res.length; i++) this.subCategory.push(new SearchDataModal(res[i].subCategoryId, res[i].subCategoryName, res[i].subCategoryName, "3"));
      if (this.subCategory.length > 0)
        this.subCategory.sort((a, b): number => {
          if (a.name < b.name) return -1;
          if (a.name > b.name) return 1;
          return 0;

        });
      let data = { levelName: this.selectedCategoryData.name, levelId: this.selectedCategoryData.id, levelCount: 3 };
      this.productAvailability(data, 'sc', 3);
    });
  };

  refreshSubcategory(subcategory) {
    this.isrefreshsubCat = true;
    let updateStorage = JSON.parse(window.localStorage['levelSelections']);
    if (window.localStorage['filterdataCat'] != undefined) {
      let dataCategory = JSON.parse(window.localStorage['filterdataCat']);
      this.selectedCategoryData = dataCategory;
    }
    updateStorage.subcategory = subcategory;
    updateStorage.category.id = this.selectedCategoryData.id;
    updateStorage.category.name = this.selectedCategoryData.name;
    updateStorage.category.text = this.selectedCategoryData.text;
    this.selectedTilesData.category.name = this.selectedCategoryData.name;
    this.selectedTilesData.category.id = this.selectedCategoryData.id;
    this.selectedTilesData.category.text = this.selectedCategoryData.text;
    window.localStorage['levelSelections'] = JSON.stringify(updateStorage);
    window.localStorage['filterdataSubCat'] = JSON.stringify(subcategory);


    this.subCategory = [];
    this.closeNav();
    this.clearAllFilters();
    //this.loadsubcategoryFromFilter();
    this.showFilterPanel = false;
  };

  async loadsubcategoryFromFilter() {
    this.defaultProductLevel = 3;
    this.filteredData = [];
    this.increaseLevel = 0;
    this.ids = [];
    this.newData = [];
    this.nextItemArr = [];
    this.isFilterValue = '0';
    localStorage.removeItem('filterdataStorage');
    localStorage.removeItem('filterIDs');
    this.productAvailabilityModal = { levelName: this.selectedTilesData.category.name, levelId: this.selectedTilesData.category.id, levelCount: this.defaultProductLevel };
    this.checkProductAvailability();
    this.enableFilterPanel();
    //this.loadTypes();
    await this.loadFilterData();

  }

  viewDetails(tile) {
    let updateStorage = JSON.parse(window.localStorage['levelSelections']);
    updateStorage.subType.id = tile.product.kalaUniqueId;
    updateStorage.subType.name = tile.product.productName;
    updateStorage.subType.text = tile.product.productName;
    updateStorage.subType.level = "5";
    updateStorage.subType.imgUrl = tile.product.mainImageSrc;
    window.localStorage['levelSelections'] = JSON.stringify(updateStorage);
    window.localStorage['selectedProduct'] = JSON.stringify(tile);
    if (this.ids.length == 0) {
      this.filteredData = [];
    }
    else {
      window.localStorage['filterdataStorage'] = JSON.stringify(this.filteredData);
      window.localStorage['filterIDs'] = JSON.stringify(this.ids);
    }
    let url = '';
    if (tile.product.attributes != undefined) {
      if (tile.product.attributes.Brand == undefined)
        url = '/view-product?productName=' + tile.product.productName.replace(/ /g, "-") + '&productId=' + tile.product.kalaUniqueId + '&Isfilter=' + ((this.filteredData != undefined && this.filteredData.length > 0) ? '1' : '0');
      else
        url = '/view-product?brandName=' + tile.product.attributes.Brand.replace(/ /g, "-") + '&productName=' + tile.product.productName.replace(/ /g, "-") + '&productId=' + tile.product.kalaUniqueId + '&Isfilter=' + ((this.filteredData != undefined && this.filteredData.length > 0) ? '1' : '0');

    }
    else {
      url = '/view-product?brandName=' + tile.product.attributes.Brand.replace(/ /g, "-") + '&productName=' + tile.product.productName.replace(/ /g, "-") + '&productId=' + tile.product.kalaUniqueId + '&Isfilter=' + ((this.filteredData != undefined && this.filteredData.length > 0) ? '1' : '0');
    }
    this.route.navigateByUrl(url);
  }

  enableFilterPanel() {
    this.showFilterPanel = true;
    this.showCategoryPanel = false;
  }

  async clearAllFilters() {
    this.isFilterUsed = false;
    this.defaultProductLevel = 3;
    this.filteredData = [];
    this.increaseLevel = 0;
    this.ids = [];
    this.newData = [];
    this.nextItemArr = [];
    this.isFilterValue = '0';
    this.getOffer_orderInfo.controls['minPrice'].setValue(0)
    this.getOffer_orderInfo.controls['maxPrice'].setValue(this.maxPrice)
    localStorage.removeItem('filterdataStorage');
    localStorage.removeItem('filterIDs');
    this.productAvailabilityModal = { levelName: this.textAsSearchedTerm, levelId: this.selectedTilesData.category.id, levelCount: this.defaultProductLevel };
    this.checkProductAvailability();
    this.enableFilterPanel();
    //this.loadTypes();
    //await this.loadFilterData();

    if (this.viewAll) {
      this.getCarouselFilterData(this.subCatId);
      this.productAvailabilityModal = { levelName: this.cat, levelId: this.catId, levelCount: 3 };
      this.productAvailabilityResponse = await this.homeService.checkProductAvailability(this.productAvailabilityModal);
      this.productAvailabilityResponse = this.productAvailabilityResponse.filter(item => item.level = 3);

    }
    else {

      await this.loadTypes(undefined);
      this.productAvailabilityResponse = await this.homeService.checkProductAvailability(this.productAvailabilityModal);
      this.productAvailabilityResponse = this.productAvailabilityResponse.filter(item => item.level = this.defaultProductLevel);

    }
    this.core.pageLabel();
    this.loadTypeData();

  }
  async loadTypeData() {
    let placett = await this.homeService.getPlaceByCatId(this.catId);
    this.placeData = placett;
    this.categoryName = placett.categoryName;
    this.placeName = placett.placeName;
    this.placeId = placett.placeId;

    this.getTilesCategory(this.placeId);
    this.subCatDataToSend.categoryId = this.catId;
    this.subCatDataToSend.categoryName = this.cat;
    this.subCatDataToSend.subCategoryId = this.subCatId;
    this.subCatDataToSend.subCategoryName = this.subCategoryName;
    this.subCatDataToSend.nextLevelProductTypeStatus = true;
    this.subCatDataToSend.taxCode = null;
    this.subCatDataToSend.count = 0;
    this.subCatDataToSend.level = 0;
    this.subCatDataToSend.isProductAvailable = true;
    await this.loadFilterData();
    if (this.filteredData.length > 0)
      this.changeFilter(this.subCatDataToSend, this.filteredData[0]);
  }
  loadFilterData() {
    return new Promise(async (respo, rej) => {
      // if(this.selectedTilesData !=undefined)
      //   this.filterModalAPI.fieldValues = [this.selectedTilesData.subcategory.id];
      // else
      this.filterModalAPI.fieldValues = [this.catId];

      if (window.localStorage['filterdataStorage'] != undefined) {
        //this.modifyData();
        //this.sortListData();
        this.tilesData = [];
        this.loadFilterDataViewProduct();
        console.log(this.filteredData);

      }
      else {
        this.homeService.filterLoadSubcategory(this.filterModalAPI).subscribe((res) => {
          if (res.length > 0) {
            for (let i = 0; i < res.length; i++) res[i].level = this.increaseLevel;
            this.filteredData = new Array<DynamicFilters>();
            this.filteredData.push(new DynamicFilters(false, this.increaseLevel, res, [], "", this.defaultProductLevel));
            this.filteredDataCarousel = new Array<DynamicFilters>();
            this.filteredDataCarousel.push(new DynamicFilters(false, this.increaseLevel, res, [], "", this.defaultProductLevel));


            this.modifyData();
            this.sortListData();
            console.log(this.filteredData);
            // setTimeout(() => {
            //   let redSubCat = document.getElementsByClassName(this.subCategoryName.replace(' ','-'));
            //   redSubCat.length > 0?redSubCat[0].classList.add('categ_outline_red'):{};
            // }, 500);
          }
          respo();
        }, (err) => {
          console.log(err);
          rej();
        })


      }
    });
  }

  getId(data, parent) {
    let id;
    if (parent.level == 1) id = data.placeId;
    else if (parent.level == 2) id = data.categoryId;
    else if (parent.level == 3) id = data.subCategoryId
    else id = data.productTypeId;
    return id;
  }

  getLabel(data, parent) {
    let label;
    if (parent.level == 1) label = data.placeName;
    else if (parent.level == 2) label = data.categoryName;
    else if (parent.level == 3) label = data.subCategoryName
    else label = data.productTypeName;
    return label;
  }
  
  async changeFilter(event, parent) {
    let data = event;//  event.target.value;
    
    if(data == 'Sub Category' || data == 'Type')
    {
      //parent.selectedValues = this.prevSelectionData
      //data = this.prevSelectionData;
      //parent = this.prevSelectionParent;
      //this.selectedDatavalue = data.selectedValues[data.selectedValues.length - 1];

      //this.cd.detectChanges();
      if(this.prevSelectionData != undefined)
        this.filteredData =[];
      setTimeout(() => {
        if(this.prevSelectionData != undefined)
          this.filteredData = this.prevSelectionData ;
      }, 1);
      return false;
    }
    localStorage.removeItem("filterdataSubCat");
    localStorage.removeItem("filterdataCat");

    
    if(typeof data === 'string')
      data = JSON.parse(data);
   
    //parent.selectedValues.push(data);
    this.prevSelectionData = this.filteredData
    this.prevSelectionParent = parent;
    

    if(!data.isProductAvailable)
    {
      return;
    }
    /*Load Types*/
    this.showMorePageCounter = 0;
    this.nextItemArr = this.nextItemArr.filter(item => item.level <= parent.level);
    this.filterModalAPI.fieldValues = [parent.level == 0 ? data.subCategoryId : data.productTypeId];
    var res = await this.homeService.filterLoadType(this.filterModalAPI);

    parent.selectedValues.push(data);
    let hashTable = {};
    let deduped = parent.selectedValues.filter(function (el) {
      var key = JSON.stringify(el);
      var match = Boolean(hashTable[key]);
      return (match ? false : hashTable[key] = true);
    });
    parent.selectedValues = deduped;

    if (res.length > 0) {
      this.defaultProductLevel = parent.pALevel + 1;
      if (this.increaseLevel == parent.level) this.increaseLevel = this.increaseLevel + 1;
      else {
        this.increaseLevel = parent.level + 1;
        // this.commonToFilterData();
      }
      for (let i = 0; i < res.length; i++) res[i].level = this.increaseLevel;
      var getExisting = this.filteredData.filter(item => item.level == this.increaseLevel);
      if (getExisting.length > 0) {
        getExisting[0].data.push({ level: this.increaseLevel, label: parent.level == 0 ? data.subCategoryName : data.productTypeName, data: res })
        // getExisting[0].selectedValues = [];
        getExisting[0].data = getExisting[0].data.filter((elem, index, self) => self.findIndex((item) => {
          return (item.level === elem.level && item.label === elem.label)
        }) === index);
        
      }
      else {
        this.newData.push({ level: this.increaseLevel, label: parent.level == 0 ? data.subCategoryName : data.productTypeName, data: res });
        var newDataFiltered = this.newData.filter(item => item.level != parent.level && item.level > parent.level);
        newDataFiltered = newDataFiltered.filter((elem, index, self) => self.findIndex((item) => {
          return (item.level === elem.level && item.label === elem.label)
        }) === index);
        this.filteredData.push(new DynamicFilters(true, this.increaseLevel, newDataFiltered, [], parent.level == 0 ? data.subCategoryName : data.productTypeName, this.defaultProductLevel));
        // newDataFiltered = [];
        // this.newData = [];
        console.log(this.filteredData)
      }
    }
    else {
      if (!data.nextLevelProductTypeStatus) {
        this.nextItemArr.push({ level: parent.level, id: parent.level == 0 ? data.subCategoryId : data.productTypeId });
        this.nextItemArr = this.nextItemArr.filter((elem, index, self) => self.findIndex((item) => {
          return (item.id === elem.id && item.level === elem.level)
        }) === index);
      }
    }
    /*Check product Availability*/
    this.productAvailabilityModal = {
      levelName: parent.level == 0 ? data.subCategoryName : data.productTypeName,
      levelId: parent.level == 0 ? data.subCategoryId : data.productTypeId,
      levelCount: this.defaultProductLevel
    };
    this.checkProductAvailability();
    this.sortFilter();
    /*Check product Availability*/
    setTimeout(() => {
      this.loadProducts(data, parent); /*Load Products*/
    }, 500);
    this.selectFixBool = true;
  }
  sortFilter() {
    for (let i = 0; i < this.filteredData.length; i++) {
      this.filteredData[i].data.sort((a, b): number => {
        if (a.label < b.label) return -1;
        if (a.label > b.label) return 1;
        return 0;
      });

    }

  }
  commonToFilterData() {
    for (let i = 0; i < this.filteredData.length; i++) {
      if (this.filteredData[i].level > 0 && this.filteredData[i].level > this.increaseLevel) {
        this.filteredData.splice(i, 1);
        i--;
      }
    }
  }

  clearingDataArr() {
    for (let i = 0; i < this.filteredData.length; i++) {
      let level = this.filteredData[i].level;
      for (let j = 0; j < this.filteredData[i].data.length; j++) {
        if (level > 0 && level != this.filteredData[i].data[j].level) {
          this.filteredData[i].data.splice(j, 1);
          j--;
        }
      }
    }
  }

  async loadShowMoreIfFilterselected() {
    var ids = Array.from(new Set(this.ids));
    var response = await this.homeService.loadProductFromFilter(ids, this.getOffer_orderInfo.controls.minPrice.value, this.getOffer_orderInfo.controls.maxPrice.value, this.showMorePageCounter, this.showMoreSizeCounter);

    //this.tilesData = [];
    // if (response.content.length > 0) {
    this.filterResponse(response);
    //this.lastParentLevel = parent.level;
    // }
    //  else
    //   {
    //    this.loader = false;
    //   }
    // else {
    //   this.headerMessage = 'Sorry, but we don\'t have product matches for you';
    //   this.core.show(this.headerMessage);
    //   window.localStorage['browseProductSearch'] = this.headerMessage;
    // }
  }
  async loadFilterDataViewProduct() {
    this.ids = [this.subCatId];//  JSON.parse(window.localStorage['filterIDs']);
    var ids = Array.from(new Set(this.ids));
    this.tilesData = [];
    var response = await this.homeService.loadProductFromFilter(ids, this.getOffer_orderInfo.controls.minPrice.value, this.getOffer_orderInfo.controls.maxPrice.value, this.showMorePageCounter, this.showMoreSizeCounter);

    this.loader = true;
    //this.tilesData = [];
    // if (response.content.length > 0) {
    this.filterResponse(response);
  }
  async loadProducts(data, parent) {
    this.ids = [];
    for (let i = 0; i < parent.selectedValues.length; i++) {
      let filterId = parent.selectedValues[i].subCategoryId != undefined ? parent.selectedValues[i].subCategoryId : parent.selectedValues[i].productTypeId;
      this.ids.push(filterId);
    }
    if (this.nextItemArr.length > 0) {
      for (let i = 0; i < this.nextItemArr.length; i++) {
        this.ids.push(this.nextItemArr[i].id);
      }
    }
    var ids = Array.from(new Set(this.ids));
    var response = await this.homeService.loadProductFromFilter(ids, this.getOffer_orderInfo.controls.minPrice.value, this.getOffer_orderInfo.controls.maxPrice.value, 0, 30);
    this.tilesData = [];
    if (response.content.length > 0) {
      this.filterResponse(response);
      this.lastParentLevel = parent.level;
    }
    else {
      this.headerMessage = 'Sorry, but we don\'t have product matches for you';
      this.core.show(this.headerMessage);
      window.localStorage['browseProductSearch'] = this.headerMessage;
    }
  }

  loaderPlaces() {
    let data = [];
    for (let i = 0; i < this.tilesData.length; i++) {
      for (let j = 0; j < this.tilesData[i].product.productHierarchyWithIds.length; j++) {
        let item = this.tilesData[i].product.productHierarchyWithIds[j];
        if (item.levelCount == 1) data.push(item);
      }
    }
    data = data.filter((elem, index, self) => self.findIndex((item) => {
      return (item.levelCount === elem.levelCount && item.levelName === elem.levelName)
    }) === index);
    this.increaseLevel = 1;
    let placeList = new Array<FilterMapPlaceData>();
    for (let i = 0; i < data.length; i++) placeList.push(new FilterMapPlaceData(1, data[i].levelName, data[i].levelId))
    this.filteredData = new Array<DynamicFilters>();
    this.filteredData.push(new DynamicFilters(false, this.increaseLevel, placeList, [], "", this.defaultProductLevel));
    this.modifyData();
    this.sortListData();
    this.sortListLevelData();
  }

  sortListLevelData()
  {
    for (let i = 0; i < this.productAvailabilityResponse.length; i++) {
      for (let j = 0; j < this.filteredData.length; j++) {
      
        if (this.productAvailabilityResponse[i].level == this.filteredData[j].pALevel) {
          for (let k = 0; k < this.filteredData[j].data.length; k++) {
            /*If Level 0 (Subcategory)*/
            if (this.filteredData[j].data[k].level == 0) {
             
              this.filteredData[j].data.sort((a,b):number => {
                if(a.subCategoryName<b.subCategoryName) return -1;
                if(a.subCategoryName>b.subCategoryName) return 1;
                return 0;
              });
            }
            /*If Level > 0 (Types)*/
            else {
              if(this.filteredData[j].data[k].data != undefined)
              for (let l = 0; l < this.filteredData[j].data[k].data.length; l++) {
                this.filteredData[j].data[k].data.sort((a,b):number => {
                  if(a.productTypeName<b.productTypeName) return -1;
                  if(a.productTypeName>b.productTypeName) return 1;
                  return 0;
                });
               
              }
            }
          }
        }
      }
    }
  }

  // async loadType() {
  //   this.core.isSearchWithoutSuggestion ? this.defaultProductLevel = 1 : this.defaultProductLevel = 3;
  //     if( window.localStorage['filterdataStorage'] == undefined)
  //     {
  //       var response = await this.core.searchProduct(this.textAsSearchedTerm, this.parentNameAsCategoryName,this.parentIdAsCategoryId,this.levelId, this.esSizeCounter, this.esFromCounter,this.core.lastSearch,this.core.highestScore);
  //       if (response.products.length > 0) {
  //         this.filterResponse(response);
  //         this.core.lastSearch = response.lastSearch;
  //         this.core.highestScore = response.highestScore;
  //       }
  //       this.productAvailabilityModal = { levelName: this.textAsSearchedTerm, levelId: this.parentIdAsCategoryId, levelCount: this.defaultProductLevel };
  //       this.productAvailabilityResponse = await this.homeService.checkProductAvailabilityES(this.productAvailabilityModal);
  //       this.productAvailabilityResponse = this.productAvailabilityResponse.filter(item => item.level = this.defaultProductLevel);
  //       if (this.core.isSearchWithoutSuggestion) this.loaderPlaces()
  //       else this.loadFilterData();
  //     }
  //     else
  //     {
  //       this.loadProductsFromFilter({}, {}); /*Load Products*/
  //     }
  //   // }
  //   // else
  //   // {
  //   //   var response = await this.core.searchProduct(this.textAsSearchedTerm, this.parentNameAsCategoryName, this.esSizeCounter, this.esFromCounter);
  //   //   if (response.products.length > 0) this.filterResponse(response);
  //   //   this.productAvailabilityModal = { levelName: this.textAsSearchedTerm, levelId: this.parentIdAsCategoryId, levelCount: this.defaultProductLevel };
  //   //   this.productAvailabilityResponse = await this.homeService.checkProductAvailabilityES(this.productAvailabilityModal);
  //   //   this.productAvailabilityResponse = this.productAvailabilityResponse.filter(item => item.level = this.defaultProductLevel);
  //   //   if (this.core.isSearchWithoutSuggestion) this.loaderPlaces()
  //   //   else this.loadFilterData();
  //   // }
  //   // var response = await this.core.searchProduct(this.textAsSearchedTerm, this.parentNameAsCategoryName, this.esSizeCounter, this.esFromCounter);
  //   // if (response.products.length > 0) this.filterResponse(response);
  //   // this.productAvailabilityModal = { levelName: this.textAsSearchedTerm, levelId: this.parentIdAsCategoryId, levelCount: this.defaultProductLevel };
  //   // this.productAvailabilityResponse = await this.homeService.checkProductAvailabilityES(this.productAvailabilityModal);
  //   // this.productAvailabilityResponse = this.productAvailabilityResponse.filter(item => item.level = this.defaultProductLevel);
  //   // if (this.core.isSearchWithoutSuggestion) this.loaderPlaces()
  //   // else this.loadFilterData();
  // }

  async loadProductsFromFilter(data, parent) {
    //this.ids = [];
    let filterId;
   
    
    if (this.nextItemArr.length > 0) {
      for (let i = 0; i < this.nextItemArr.length; i++) {
        this.ids.push(this.nextItemArr[i].id);
      }
    }
    this.ids =  JSON.parse(window.localStorage['filterIDs']);
    var ids = Array.from(new Set(this.ids));
    this.showMoreReqWithFilter = ids;
    this.showMorePageCounter = 0;
    var response = await this.homeService.loadProductFromFilterES(ids,this.getOffer_orderInfo.controls.minPrice.value,this.getOffer_orderInfo.controls.maxPrice.value, this.showMorePageCounter, 30, this.textAsSearchedTerm, this.parentNameAsCategoryName,this.core.lastSearch,this.core.highestScore);
    this.tilesData = [];
    if (response.products.length > 0) {
      this.filterResponse(response);
      this.lastParentLevel = parent.level;
    }
    else {
      this.headerMessage = 'Sorry, but we don\'t have product matches for you';
      this.core.show(this.headerMessage);
      window.localStorage['browseProductSearch'] = this.headerMessage;
    }
  }

  deleteFilter(data, e) {
    e.currentTarget.parentElement.parentElement.children[0].selectedIndex = 0;
    let dataId = data.subCategoryId != undefined ? data.subCategoryId : data.productTypeId;
    this.ids = this.ids.filter(item => item != dataId);
    this.newData = this.newData.filter(item => item.level == data.level);
    this.filteredData = this.filteredData.filter(item => item.level <= data.level);
    this.nextItemArr = this.nextItemArr.filter(item => item.level <= data.level);
    for (let i = 0; i < this.nextItemArr.length; i++) {
      if (this.nextItemArr[i].id == dataId) {
        this.nextItemArr.splice(i, 1);
        i--;
      }
    }
    for (let i = 0; i < this.filteredData.length; i++) {
      if (data.level == this.filteredData[i].level) {
        for (let j = 0; j < this.filteredData[i].selectedValues.length; j++) {
          let filterId = this.filteredData[i].selectedValues[j].subCategoryId != undefined ? this.filteredData[i].selectedValues[j].subCategoryId : this.filteredData[i].selectedValues[j].productTypeId;
          if (dataId == filterId) {
            this.filteredData[i].selectedValues.splice(j, 1);
            if (this.filteredData[i].selectedValues.length == 0) {
              this.filteredData.splice(i, 1);
              break;
            }
          }
        }
      }
    }

    for (let i = 0; i < this.filteredData.length; i++) {
      var ifDataPresent = this.filteredData.filter(item => item.level === data.level);
      if (ifDataPresent.length > 0) {
        if (data.level == this.filteredData[i].level) {
          for (let j = 0; j < this.filteredData[i].selectedValues.length; j++) {
            this.changeFilter(this.toStr(this.filteredData[i].selectedValues[j]), this.filteredData[i]);
          }
        }
      }
      else {
        if (this.filteredData[i].level == (data.level - 1)) {
          for (let j = 0; j < this.filteredData[i].selectedValues.length; j++) {
            this.changeFilter(this.toStr(this.filteredData[i].selectedValues[j]), this.filteredData[i]);
          }
        }
      }
    }

    if (this.filteredData.length == 0) this.clearAllFilters();
  }

  async checkProductAvailability() {
    this.productAvailabilityResponse = await this.homeService.checkProductAvailability(this.productAvailabilityModal);
    this.productAvailabilityResponse = this.productAvailabilityResponse.filter(item => item.level = this.defaultProductLevel);
    if (this.productAvailabilityResponse.length > 0)
      this.productAvailabilityResponse.sort((a, b): number => {
        if (a.name < b.name) return -1;
        if (a.name > b.name) return 1;
        return 0;

      });
    this.modifyData();
    this.sortListData();
  }

  sortListData() {
    for (let i = 0; i < this.productAvailabilityResponse.length; i++) {
      for (let j = 0; j < this.filteredData.length; j++) {

        if (this.productAvailabilityResponse[i].level == this.filteredData[j].pALevel) {
          for (let k = 0; k < this.filteredData[j].data.length; k++) {
            /*If Level 0 (Subcategory)*/
            if (this.filteredData[j].data[k].level == 0) {

              this.filteredData[j].data.sort((a, b): number => {
                if (a.subCategoryName < b.subCategoryName) return -1;
                if (a.subCategoryName > b.subCategoryName) return 1;
                return 0;
              });
            }
            /*If Level > 0 (Types)*/
            else {
              for (let l = 0; l < this.filteredData[j].data[k].data.length; l++) {
                this.filteredData[j].data[k].data.sort((a, b): number => {
                  if (a.productTypeName < b.productTypeName) return -1;
                  if (a.productTypeName > b.productTypeName) return 1;
                  return 0;
                });

              }
            }
          }
        }
      }
    }
  }
  modifyData() {
    if (this.core.isSearchWithoutSuggestion) {
      for (let i = 0; i < this.productAvailabilityResponse.length; i++) {
        for (let j = 0; j < this.filteredData.length; j++) {
          if (this.productAvailabilityResponse[i].level == this.filteredData[j].pALevel) {
            for (let k = 0; k < this.filteredData[j].data.length; k++) {
              if (this.filteredData[j].data[k].level == 1) {
                let name = this.filteredData[j].data[k].placeName;
                if (this.productAvailabilityResponse[i].name == name && (this.filteredData[j].data[k].isProductAvailable == undefined)) {
                  this.filteredData[j].data[k].isProductAvailable = true;
                  break;
                }
                // this.filteredData[j].data.sort((a,b):number => {
                //   if(a.subCategoryName<b.subCategoryName) return -1;
                //   if(a.subCategoryName>b.subCategoryName) return 1;
                //   return 0;
                // });
              }
              else if (this.filteredData[j].data[k].level == 2) {
                for (let l = 0; l < this.filteredData[j].data[k].data.length; l++) {
                  let name = this.filteredData[j].data[k].data[l].categoryName;
                  if (this.productAvailabilityResponse[i].name == name && (this.filteredData[j].data[k].data[l].isProductAvailable == undefined)) {
                    this.filteredData[j].data[k].data[l].isProductAvailable = true;
                    break;
                  }
                }
              }
              else if (this.filteredData[j].data[k].level == 3) {
                for (let l = 0; l < this.filteredData[j].data[k].data.length; l++) {
                  let name = this.filteredData[j].data[k].data[l].subCategoryName;
                  // this.filteredData[j].data.sort((a,b):number => {
                  //   if(a.subCategoryName<b.subCategoryName) return -1;
                  //   if(a.subCategoryName>b.subCategoryName) return 1;
                  //   return 0;
                  // });
                  if (this.productAvailabilityResponse[i].name == name && (this.filteredData[j].data[k].data[l].isProductAvailable == undefined)) {
                    this.filteredData[j].data[k].data[l].isProductAvailable = true;
                    break;
                  }
                }
              }
              else {
                for (let l = 0; l < this.filteredData[j].data[k].data.length; l++) {
                  let name = this.filteredData[j].data[k].data[l].productTypeName;
                  // this.filteredData[j].data.sort((a,b):number => {
                  //   if(a.productTypeName<b.productTypeName) return -1;
                  //   if(a.productTypeName>b.productTypeName) return 1;
                  //   return 0;
                  // });
                  if (this.productAvailabilityResponse[i].name == name && (this.filteredData[j].data[k].data[l].isProductAvailable == undefined)) {
                    this.filteredData[j].data[k].data[l].isProductAvailable = true;
                    break;
                  }
                }
              }
            }
          }
        }
      }
    }
    else {
      for (let i = 0; i < this.productAvailabilityResponse.length; i++) {
        for (let j = 0; j < this.filteredData.length; j++) {
          if (this.productAvailabilityResponse[i].level == this.filteredData[j].pALevel) {
            for (let k = 0; k < this.filteredData[j].data.length; k++) {
              /*If Level 0 (Subcategory)*/
              if (this.filteredData[j].data[k].level == 0) {
                let name = this.filteredData[j].data[k].subCategoryName;
                if (this.productAvailabilityResponse[i].name == name && (this.filteredData[j].data[k].isProductAvailable == undefined)) {
                  this.filteredData[j].data[k].isProductAvailable = true;
                  break;
                }
                // this.filteredData[j].data.sort((a,b):number => {
                //   if(a.subCategoryName<b.subCategoryName) return -1;
                //   if(a.subCategoryName>b.subCategoryName) return 1;
                //   return 0;
                // });
              }
              /*If Level > 0 (Types)*/
              else {
                for (let l = 0; l < this.filteredData[j].data[k].data.length; l++) {
                  // this.filteredData[j].data[k].data.sort((a,b):number => {
                  //   if(a.productTypeName<b.productTypeName) return -1;
                  //   if(a.productTypeName>b.productTypeName) return 1;
                  //   return 0;
                  // });
                  let name = this.filteredData[j].data[k].data[l].productTypeName;
                  if (this.productAvailabilityResponse[i].name == name && (this.filteredData[j].data[k].data[l].isProductAvailable == undefined)) {
                    this.filteredData[j].data[k].data[l].isProductAvailable = true;
                    break;
                  }
                }
              }
            }
          }
        }
      }
    }
    console.log(this.filteredData);
  }

  productAvailability(data, from, level) {
    this.homeService.productAvailability(data).subscribe((res) => {
      this.productAvailabilityCategoryIC = res.filter(item => item.level = level);
      if (this.productAvailabilityCategoryIC.length > 0)
        this.productAvailabilityCategoryIC.sort((a, b): number => {
          if (a.name < b.name) return -1;
          if (a.name > b.name) return 1;
          return 0;

        });
      this.modifyCatSubData(from);
    }, (err) => {
      console.log("Error from Product Availability");
    })
  }

  modifyCatSubData(from) {
    for (let i = 0; i < this.productAvailabilityCategoryIC.length; i++) {
      if (from == 'c') {
        for (let j = 0; j < this.categoryList.length; j++) {
          if (this.productAvailabilityCategoryIC[i].name == this.categoryList[j].name) {
            this.categoryList[j].isProductAvailable = true;
          }
        }
      }
      else {
        for (let j = 0; j < this.subCategory.length; j++) {
          if (this.productAvailabilityCategoryIC[i].name == this.subCategory[j].name) {
            this.subCategory[j].isProductAvailable = true;
          }
        }
      }
    }
  }
  routeToBrowseCatGroup() {

    if (this.routerOutlet.isActivated) this.routerOutlet.deactivate();
    this.route.navigateByUrl('/browse-subcatgroup?placeId=' + this.placeId + '&placeName=' + encodeURIComponent(this.placeName) + '&category=' + encodeURIComponent(this.cat) + '&catId=' + this.catId);
  }
  getPlace() {
    this.loader = true;
    this.homeService.getTilesPlace().subscribe(res => {
      //this.loader = false;
      for (var i = 0; i < res.length; i++) this.searchPlaceData.push(new SearchDataModal(res[i].placeId, res[i].placeName, res[i].placeName, "1", `${this.s3}${this.placeImageUrl}${res[i].placeName}.png`, `${this.s3}${this.placeIconsUrl}${res[i].placeName}.png`));
      // let carosal = document.getElementsByClassName('carousel-item');
      // carosal[0].classList.add("active");
      // carosal[1].classList.remove("active");

      //this.carousalItems = this.searchPlaceData;
      this.tilesPlaces = this.searchPlaceData;
      this.tilesPlaces = this.tilesPlaces.filter(tileDt => tileDt.name != this.placeName);


      //this.tilesPlaces.removeAll(p => this.tilesPlaces.filter(q => q.name === this.placeName).length === 0);
      this.searchPlaceData.forEach((item) => {
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
      this.searchPlaceData.sort((a, b) => a.orderNo - b.orderNo);
      /*Product Availability*/
      this.productAvailabilityModal = { levelName: null, levelId: null, levelCount: 1 };
      this.homeService.productAvailability(this.productAvailabilityModal).subscribe((res) => {
        this.availableProducts = res.filter(item => item.level = 1);
        this.modifySearchPlaceData();

      }, (err) => {
        console.log("Error From Product Availability");
      });
      /*Product Availability*/
      // this.core.checkIfLoggedOut();
    });
  }
  modifySearchPlaceData() {
    let getLevelBasedData = this.availableProducts.filter(item => item.level == 1);
    console.log("getLevelBasedData", getLevelBasedData);
    console.log("searchPlaceData", this.searchPlaceData);

    for (let i = 0; i < getLevelBasedData.length; i++) {
      for (let j = 0; j < this.searchPlaceData.length; j++) {
        if (getLevelBasedData[i].name == this.searchPlaceData[j].name && getLevelBasedData[i].level === parseInt(this.searchPlaceData[j].level)) {
          this.searchPlaceData[j].isProductAvailable = true;
          break;
        }
      }
    }
    window.localStorage['placesFetched'] = JSON.stringify(this.searchPlaceData);
    this.tilesPlaces = this.tilesPlaces.filter(tileDt => tileDt.name != this.placeName);
    console.log("this.tilesPlaces", this.tilesPlaces)

  }
  getTilesCategory(tileId) {
    this.selectionLevel = 2;
    this.homeService.getTilesCategory(tileId).subscribe((res) => {
      //this.loader = false;
      for (var i = 0; i < res.length; i++)
        this.searchData.push(new SearchDataModal(res[i].categoryId, res[i].categoryName, res[i].categoryName, "2", `${this.s3}${this.categoryImageUrl}${this.placeName}/${res[i].categoryName}.jpg`));
      this.tiles = this.searchData;

      this.tiles = this.tiles.filter(tileDt => tileDt.name !== this.cat);
      console.log(this.searchData);
      /*order Products*/
      this.orderProducts(this.placeName);
      /*order Products*/

      /*Product Availability*/
      this.productAvailabilityModal = { levelName: this.placeName, levelId: this.placeId, levelCount: 2 };
      this.homeService.productAvailability(this.productAvailabilityModal).subscribe((res) => {
        this.availableProducts = res.filter(item => item.level = this.selectionLevel);
        this.modifySearchData();
      }, (err) => {
        console.log("Error From Product Availability");
      });
      /*Product Availability*/
    });


  }
  orderProducts(selectedTileName) {
    switch (selectedTileName) {
      case 'Home & Garden':
        this.searchData.forEach((item) => {
          if (item.name == 'Accents & Décor') item.orderNo = 1;
          else if (item.name == 'Supplies') item.orderNo = 2;
          else if (item.name == 'Bathroom') item.orderNo = 3;
          else if (item.name == 'Lighting') item.orderNo = 4;
          else if (item.name == 'Furniture & Patio') item.orderNo = 5;
          else if (item.name == 'Pest Control') item.orderNo = 6;
          else if (item.name == 'Lawn & Garden') item.orderNo = 7;
          else if (item.name == 'Bedding & Linens') item.orderNo = 8;
          else if (item.name == 'Kitchen & Dining') item.orderNo = 9;
          else if (item.name == 'Pool & Spa') item.orderNo = 10;
          else if (item.name == 'Safety & Security') item.orderNo = 11;
          else if (item.name == 'Appliances') item.orderNo = 12;
          else if (item.name == 'Garage') item.orderNo = 13;
          else item.orderNo = 14;
        });
        this.searchData.sort((a, b) => a.orderNo - b.orderNo);
        break;
      case 'Fashion & Apparel':
        this.searchData.forEach((item) => {
          if (item.name == 'Juniors - Boys Apparel') item.orderNo = 1;
          else if (item.name == 'Mens Apparel') item.orderNo = 4;
          else if (item.name == 'Womens Apparel') item.orderNo = 3;
          else if (item.name == 'Juniors - Girls Apparel') item.orderNo = 5;
          else if (item.name == 'Mens Accessories') item.orderNo = 6;
          else if (item.name == 'Womens Accessories') item.orderNo = 2;
          else item.orderNo = 5;
        });
        this.searchData.sort((a, b) => a.orderNo - b.orderNo);
        break;
      case 'Pets':
        this.searchData.forEach((item) => {
          if (item.name == 'Dogs') item.orderNo = 1;
          else if (item.name == 'Cats') item.orderNo = 7;
          else if (item.name == 'Small Animals') item.orderNo = 3;
          else if (item.name == 'Birds') item.orderNo = 4;
          else if (item.name == 'Aquatic') item.orderNo = 5;
          else if (item.name == 'Reptiles & Amphibians') item.orderNo = 8;
          else item.orderNo = 9;
        });
        this.searchData.sort((a, b) => a.orderNo - b.orderNo);
        break;
      case 'Sports & Fitness':
        this.searchData.forEach((item) => {
          if (item.name == 'Indoor Games') item.orderNo = 1;
          else if (item.name == 'Jumping') item.orderNo = 2;
          else if (item.name == 'Outdoor Recreation') item.orderNo = 3;
          else if (item.name == 'Team Sports') item.orderNo = 4;
          else if (item.name == 'Sports Accessories') item.orderNo = 5;
          else if (item.name == 'Exercise & Fitness') item.orderNo = 6;
          else if (item.name == 'Shooting Games') item.orderNo = 7;
          else if (item.name == 'Water Sports') item.orderNo = 8;
          else if (item.name == 'Winter Sports') item.orderNo = 9;
          else if (item.name == 'Air Sports') item.orderNo = 10;
          else if (item.name == 'Combat Sports') item.orderNo = 11;
          else if (item.name == 'Racquet Sports') item.orderNo = 12;
          else item.orderNo = 13;
        });
        this.searchData.sort((a, b) => a.orderNo - b.orderNo);
        break;
      case 'Health & Beauty':
        this.searchData.forEach((item) => {
          if (item.name == 'Cosmetics') item.orderNo = 1;
          else if (item.name == 'Health Care') item.orderNo = 2;
          else if (item.name == 'Nail Care') item.orderNo = 3;
          else if (item.name == 'Fragrances') item.orderNo = 4;
          // else if (item.name == 'Jewelry Care') item.orderNo = 5;
          else if (item.name == 'Personal Care') item.orderNo = 5;
          else if (item.name == 'Hair Care') item.orderNo = 6;
          else if (item.name == 'Vision Care') item.orderNo = 7;
          //else if (item.name == 'Foot Care') item.orderNo = 6;
          else if (item.name == 'Oral Care') item.orderNo = 8;

          else if (item.name == 'Skin Care') item.orderNo = 9;

          else item.orderNo = 10;
        });
        this.searchData.sort((a, b) => a.orderNo - b.orderNo);
        break;
      case 'Travel':
        this.searchData.forEach((item) => {
          if (item.name == 'Luggage') item.orderNo = 1;
          else if (item.name == 'Kids') item.orderNo = 2;
          else if (item.name == 'Health & Hygiene') item.orderNo = 3;
          else if (item.name == 'Sleeping & Comfort') item.orderNo = 4;
          else if (item.name == 'Bags & Briefcases') item.orderNo = 5;
          else if (item.name == 'Travel Accessories') item.orderNo = 6;
          else item.orderNo = 7;
        });
        this.searchData.sort((a, b) => a.orderNo - b.orderNo);
        break;

      default:
        break;
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
    window.localStorage['categFetched'] = JSON.stringify(this.searchData);
    this.tiles = this.tiles.filter(tileDt => tileDt.name !== this.cat);
  }

  tileSelected(tile, IsBc) {
    if (tile.hasOwnProperty("tile") == true) var tile = tile['tile'];
    else var tile = tile;

    this.searchData = [];
    this.cat = tile.name;
    //Get Category
    if (tile && tile.level == "1") {
      this.selectionLevel = 2;
      this.loader = true;
      this.userResponse.place = tile;
      this.homeService.getTilesCategory(tile.id).subscribe((res) => {
        for (var i = 0; i < res.length; i++) this.searchData.push(new SearchDataModal(res[i].categoryId, res[i].categoryName, res[i].categoryName, "2", `${this.s3}${this.categoryImageUrl}${tile.name}/${res[i].categoryName}.jpg`));
        this.tiles = this.searchData;
        console.log(this.searchData);
        /*order Products*/
        this.orderProducts(tile);
        /*order Products*/

        /*Product Availability*/
        this.productAvailabilityModal = { levelName: tile.name, levelId: tile.id, levelCount: this.selectionLevel };
        this.homeService.productAvailability(this.productAvailabilityModal).subscribe((res) => {
          this.availableProducts = res.filter(item => item.level = this.selectionLevel);
          this.modifySearchData();
        }, (err) => {
          console.log("Error From Product Availability");
        });
        /*Product Availability*/
      });
    }
    //Get Sub Category
    else if (tile && tile.level == "2") {
      this.userResponse.category = tile;
      this.catId = tile.id;
      this.location.go('/browse-subcatgroup?placeName=' + encodeURIComponent(this.placeName) + '&placeId=' + this.placeId + '&category=' + tile.name + '&catId=' + tile.id);
      this.loadCarousData();
      window.localStorage['levelSelections'] = JSON.stringify(this.userResponse);
      this.tiles = JSON.parse(window.localStorage['categFetched']);
      this.tiles = this.tiles.filter(tileDt => tileDt.name !== this.cat);
      // if (this.routerOutlet.isActivated) this.routerOutlet.deactivate();
      // this.route.navigateByUrl('/browse-product?category='+tile.name.replace(/ /g, "-") + '&catId='+ tile.id);
    }
    //Get Type
    else if (tile && tile.level == "3") {
      this.userResponse.subcategory = tile;
      window.localStorage['levelSelections'] = JSON.stringify(this.userResponse);
      if (this.routerOutlet.isActivated) this.routerOutlet.deactivate();
      this.route.navigateByUrl('/browse-product?category=' + tile.name.replace(/ /g, "-") + '&catId=' + tile.id);
    }
    //Get Place
    else {
      this.selectionLevel = 1;
      this.getPlace();
    }
  }
  loadCarousData() {
    this.homeService.subCategoriesCount(this.catId).subscribe((res) => {
      if (res.length > 0) {
        for (let i = 0; i < res.length; i++) res[i].level = this.increaseLevel;
        this.filteredData = new Array<DynamicFilters>();
        this.filteredData.push(new DynamicFilters(false, this.increaseLevel, res, [], "", this.defaultProductLevel));
        this.modifyData();
        this.sortListData();
        //this.appendCarouselData(res);
        console.log(this.filteredData);
      }
    }, (err) => {
      console.log(err);
    })
  }
  getSelectedTile(tile: any) {
    this.location.go('/browse-product?placeName=' + encodeURIComponent(tile.name) + '&placeId=' + tile.id);
    this.tiles = [];
    this.searchData = [];
    this.cat = "Categories";
    this.filteredDataCarousel = [];
    //this.getPlace();
    this.homeService.getTilesCategory(tile.id).subscribe((res) => {
      //this.loader = false;
      for (var i = 0; i < res.length; i++) this.searchData.push(new SearchDataModal(res[i].categoryId, res[i].categoryName, res[i].categoryName, "2", `${this.s3}${this.categoryImageUrl}${tile.name}/${res[i].categoryName}.jpg`));
      this.tiles = this.searchData;
      console.log(this.searchData);
      /*order Products*/
      this.orderProducts(tile);
      /*order Products*/
      this.placeName = tile.name;
      this.placeId = tile.id;
      this.tilesPlaces = JSON.parse(window.localStorage['placesFetched']);
      this.tilesPlaces = this.tilesPlaces.filter(tileDt => tileDt.name !== this.placeName);
      this.userResponse.place = tile;
      window.localStorage['levelSelections'] = JSON.stringify(this.userResponse);
      if (this.placeName != undefined) {
        this.selectedTilesData.place.name = tile.name;
        this.core.headerImgCateg = "\"" + environment.catImagePath + this.placeName + '_Banner.png' + "\"";
      }
      /*Product Availability*/
      this.productAvailabilityModal = { levelName: tile.name, levelId: tile.id, levelCount: this.selectionLevel };
      this.homeService.productAvailability(this.productAvailabilityModal).subscribe((res) => {
        this.availableProducts = res.filter(item => item.level = this.selectionLevel);
        this.modifySearchData();
      }, (err) => {
        console.log("Error From Product Availability");
      });
      /*Product Availability*/
      var submenuList = document.getElementsByClassName("submenu");
      if (submenuList != undefined)
        submenuList.length != 0 ? submenuList[0].classList.add("d-none") : {};
    });
  }
  navigateToCat(tile: any) {
    this.selectionLevel = 2;
    this.loader = true;
    this.userResponse.place = tile;
    window.localStorage['levelSelections'] = JSON.stringify(this.userResponse);
    if (this.routerOutlet.isActivated) this.routerOutlet.deactivate();
    this.route.navigateByUrl('/browse-subcat?place=' + encodeURIComponent(tile.name) + '&placeId=' + tile.id);
  }
  navigateToSubCat(tile: any) {
    this.selectedTilesData = JSON.parse(window.localStorage['levelSelections']);
    this.userResponse = this.selectedTilesData;
    this.userResponse.category = tile;
    window.localStorage['levelSelections'] = JSON.stringify(this.userResponse);
    if (this.routerOutlet.isActivated) this.routerOutlet.deactivate();
    this.route.navigateByUrl('/browse-subcatgroup?placeId=' + this.placeId + '&placeName=' + encodeURIComponent(this.placeName) + '&category=' + encodeURIComponent(tile.name) + '&catId=' + tile.id);
  }
  fetchDataOnPriceRange()
  {
    console.log("change set");
    //this.minValuePrice != this.getOffer_orderInfo.controls.minPrice.value? this.minValuePrice = this.getOffer_orderInfo.controls.minPrice.value:{};
    //this.maxValuePrice != this.getOffer_orderInfo.controls.maxPrice.value?this.maxValuePrice = this.getOffer_orderInfo.controls.maxPrice.value:{};
    this.filteredData != undefined? this.changeFilter(this.subCatDataToSend,this.filteredData[0]):{};
    // this.changeFilter(this.subCatDataToSend,this.filteredData[0]);
    console.log("max range slider 2"+this.maxValuePrice);

  }
  fetchDataOnPriceRangeDxNum()
  {
    this.minValuePrice != this.getOffer_orderInfo.controls.minPrice.value? this.minValuePrice = this.getOffer_orderInfo.controls.minPrice.value:{};
    this.maxValuePrice != this.getOffer_orderInfo.controls.maxPrice.value?this.maxValuePrice = this.getOffer_orderInfo.controls.maxPrice.value:{};
    console.log("max range slider 3"+this.maxValuePrice);

   this.changeFilter(this.subCatDataToSend,this.filteredData[0]);
    console.log("max range slider 4"+this.maxValuePrice);

  }

  toggleCFPanel() {
    this.showCategoryFilterBar = !this.showCategoryFilterBar;
    this.afterFilter = !this.afterFilter;
    if (this.showCategoryFilterBar) {
      this.showCategoryPanel = true;
    }
    else this.showCategoryPanel = false;
    this.showFilterPanel = false;
  }

  applyFilters() {
    this.showCategoryFilterBar = false;
    this.afterFilter = false;
  }
  setArea() {
    this.showCategoryPanel = true;
    this.showFilterPanel = false;
  }
  setCategory(category) {
    this.userResponse = JSON.parse(window.localStorage['levelSelections']);
    this.userResponse.category = category;
    window.localStorage['levelSelections'] = JSON.stringify(this.userResponse);
    let catTiles = document.getElementsByClassName("catTiles")[0];
    catTiles.classList.add("d-none");
    catTiles.classList.remove("d-block");
  }
  menuClicked() {
    let elements = document.getElementsByClassName("main-menu");
    if (elements != undefined && elements[0].classList.contains("invisible") == true) {
      elements[0].classList.remove("invisible")
    }
  }
  ClickOutsideModule(e: Event) {
    let elements = document.getElementsByClassName("main-menu");
    if (elements != undefined) {
      elements[0].classList.add("invisible");
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
  
}

