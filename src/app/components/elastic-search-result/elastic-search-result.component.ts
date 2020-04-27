import { Component, OnInit, ViewEncapsulation, AfterViewInit } from '@angular/core';
import { HomeService } from '../../services/home.service';
import { CoreService } from '../../services/core.service';
import { Router, RouterOutlet, ActivatedRoute} from '@angular/router';
import { SearchDataModal } from '../../models/searchData.modal';
import { BrowseProductsModal } from '../../models/browse-products';
import { environment } from '../../../environments/environment';
import { DynamicFilters } from '../../models/dynamicFilter';
import { FilterMapPlaceData, FilterMapCategoryData } from '../../models/filterMapData';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-browse-product',
  templateUrl: './elastic-search-result.component.html',
  styleUrls: ['./elastic-search-result.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class ElasticSearchResult implements OnInit, AfterViewInit {
  selectedTilesData: any;
  s3 = environment.s3
  tilesData = [];
  loader: boolean = false;
  loaderShowMore: boolean = false;
  productListingModal = new BrowseProductsModal();
  headerMessage: string;
  showMoreBtn: boolean = true;
  callAPILoop: number = 1;
  esSizeCounter = 30;
  esFromCounter = 0;
  showFilterPanel: boolean = false;
  filterModalAPI = { "fieldValues": [] };
  filteredData: Array<DynamicFilters>;
  increaseLevel: number = 0;
  defaultProductLevel: number = 3;
  nextItemArr: Array<any> = [];
  ids: Array<any> = new Array;
  newData: Array<any> = new Array;
  productAvailabilityModal = {};
  productAvailabilityResponse = [];
  lastParentLevel: number;
  toStr = JSON.stringify;
  textAsSearchedTerm: string;
  parentNameAsCategoryName: string;
  parentIdAsCategoryId: string;
  levelId:string;
  isFilterUsed: boolean = false;
  showMoreReqWithFilter: Array<string[]>;
  showMorePageCounter: number = 0;
  showMoreSizeCounter: number = 30;
  searchText : any;
  isFilterValue:any='0';
  getOffer_orderInfo: FormGroup;
  minValuePrice=0;
  maxValuePrice = 9000;
  maxPrice=9000;
  minPrice = 0;
  priceValue:any;
  startValue=50;
  endValue=10;
  fromBanner:any;
  bannerIds:any;
  showCategoryFilterBar: boolean = false;
  afterFilter: boolean = false;
  showCategoryPanel: boolean = false;
  lastSearch:boolean=false;
  highestScore:any=0;
  freeFormText:boolean = true;
  localFilteredData:any;
  constructor(
    private homeService: HomeService,
    public core: CoreService,
    private router: ActivatedRoute,
    private route: Router,
    private formBuilder: FormBuilder
  ) {
    this.searchText = router.snapshot.queryParams['search'];
    this.isFilterValue = router.snapshot.queryParams['IsFilter'];
    this.fromBanner =  router.snapshot.queryParams['fromBanner'];
    this.bannerIds =  router.snapshot.queryParams['promotionalIds'];
   }

  ngOnInit() {
    this.core.checkIfLoggedOut(); /*** If User Logged Out*/
    localStorage.removeItem('GetOfferStep_1');
    localStorage.removeItem('GetOfferStep_2');
    localStorage.removeItem('GetOfferStep_3');
    localStorage.removeItem('GetOfferStep_4');
    this.core.headerScroll();
    this.core.pageLabel();
    this.core.lastSearch = false;
    this.core.highestScore =0;
    this.getOffer_orderInfo = this.formBuilder.group({
      "minPrice": [this.minPrice],
      "maxPrice": [this.maxPrice]
    });
    localStorage.removeItem("selectedProduct");
    this.loader = true;
    if(window.localStorage['esKeyword'] != undefined && this.searchText != undefined)
    {
      if(JSON.parse(window.localStorage['esKeyword']).text.toLowerCase().replace(/ /g, "-").replace(/%20/g, "-") != this.searchText.toLowerCase())
      {
        localStorage.removeItem('esKeyword');
      }
    }

   
    if (window.localStorage['searchedWithoutSuggestion'] != undefined || window.localStorage['esKeyword'] == undefined) this.core.isSearchWithoutSuggestion = true;
    
    if(this.fromBanner != undefined && this.bannerIds != undefined)
    {
      this.freeFormText = true
      this.textAsSearchedTerm = this.fromBanner.replace('_',' ');
      this.loadBannerResult(this.fromBanner,this.bannerIds);
     
    }
    else if(this.searchText != undefined)
     {
      if(window.localStorage['esKeyword'] != undefined && JSON.parse(window.localStorage['esKeyword']).parentId != null)
      {
        this.textAsSearchedTerm = JSON.parse(window.localStorage['esKeyword']).text;
        this.parentNameAsCategoryName = JSON.parse(window.localStorage['esKeyword']).parentName;
        this.parentIdAsCategoryId = JSON.parse(window.localStorage['esKeyword']).parentId;
        this.levelId = JSON.parse(window.localStorage['esKeyword']).levelId;
        this.freeFormText = false;
        window.localStorage['searchKeyword'] = JSON.stringify({ text: this.textAsSearchedTerm, parentName: {}, parentId: {}, levelId:{} });
        this.loadType();
      }
      else
      {
        this.textAsSearchedTerm = this.searchText.replace(/-/g, "%20");
        this.parentNameAsCategoryName = null;
        this.parentIdAsCategoryId = null;
        this.levelId = null;
        this.freeFormText = true;
        this.loadType();
        window.localStorage['searchKeyword'] = JSON.stringify({ text: this.searchText, parentName: {}, parentId: {}, levelId:{} });
      }
    }
    else if (window.localStorage['esKeyword'] != undefined) {
      this.textAsSearchedTerm = JSON.parse(window.localStorage['esKeyword']).text;
      this.parentNameAsCategoryName = JSON.parse(window.localStorage['esKeyword']).parentName;
      this.parentIdAsCategoryId = JSON.parse(window.localStorage['esKeyword']).parentId;
      this.levelId = JSON.parse(window.localStorage['esKeyword']).levelId;
      this.freeFormText = false;
      this.loadType();
    }
    setTimeout(function () {
      // var headerSearch = document.getElementsByClassName("headerSearch");
      // if (headerSearch != undefined)  headerSearch[0].classList.remove("invisible");
      var mob_searchBox = document.getElementsByClassName("mob_searchBox")[0];
      var menuHdr_mobile = document.getElementsByClassName("menuHdr_mobile")[0];
      if(mob_searchBox != undefined){mob_searchBox.classList.remove("invisible");mob_searchBox.classList.remove("d-none")};
      if(menuHdr_mobile != undefined){menuHdr_mobile.classList.remove("invisible");menuHdr_mobile.classList.remove("d-none")};
     
    }, 100);
    this.getMinMaxPrice();
  }
  async getMinMaxPrice()
  {
   if(this.textAsSearchedTerm != undefined || this.levelId != undefined) 
   {
      var response = await this.core.getPriceRange(this.levelId,this.textAsSearchedTerm,this.parentNameAsCategoryName,this.parentIdAsCategoryId, this.freeFormText);
      this.minPrice = response.minPrice;
      this.maxPrice = response.maxPrice;
      this.maxValuePrice =  response.maxPrice;
   }
    
  }
  async loadBannerResult(from,bannerIds)
  {
    this.parentNameAsCategoryName = null;
    this.parentIdAsCategoryId = null;
    this.levelId = null;

    var response = await this.core.getBannerProducts(from, bannerIds, this.esSizeCounter, this.esFromCounter);
    if (response.products.length > 0) this.filterResponse(response);

    this.productAvailabilityModal = { levelName: this.textAsSearchedTerm, levelId: this.parentIdAsCategoryId, levelCount: 1, freeFormText : this.freeFormText };
    this.productAvailabilityResponse = await this.homeService.checkProductAvailabilityES(this.productAvailabilityModal);
    this.productAvailabilityResponse = this.productAvailabilityResponse.filter(item => item.level = this.defaultProductLevel);
    if (this.core.isSearchWithoutSuggestion) this.loaderPlaces();
    else this.loadFilterData();
  }
  async loadType() {
    this.core.isSearchWithoutSuggestion ? this.defaultProductLevel = 1 : this.defaultProductLevel = 3;
      if( window.localStorage['filterdataStorage'] == undefined)
      {
        var response = await this.core.searchProduct(this.textAsSearchedTerm, this.parentNameAsCategoryName,this.parentIdAsCategoryId,this.levelId, this.esSizeCounter, this.esFromCounter,this.core.lastSearch,this.core.highestScore);
        if (response.products.length > 0) {
          this.filterResponse(response);
          this.core.lastSearch = response.lastSearch;
          this.core.highestScore = response.highestScore;
        }
        this.productAvailabilityModal = { levelName: this.textAsSearchedTerm, levelId: this.parentIdAsCategoryId, levelCount: this.defaultProductLevel, freeFormText : this.freeFormText};
        this.productAvailabilityResponse = await this.homeService.checkProductAvailabilityES(this.productAvailabilityModal);
        this.productAvailabilityResponse = this.productAvailabilityResponse.filter(item => item.level = this.defaultProductLevel);
        if (this.core.isSearchWithoutSuggestion) this.loaderPlaces()
        else this.loadFilterData();
      }
      else
      {
        this.loadProductsFromFilter({}, {}); /*Load Products*/
      }
    // }
    // else
    // {
    //   var response = await this.core.searchProduct(this.textAsSearchedTerm, this.parentNameAsCategoryName, this.esSizeCounter, this.esFromCounter);
    //   if (response.products.length > 0) this.filterResponse(response);
    //   this.productAvailabilityModal = { levelName: this.textAsSearchedTerm, levelId: this.parentIdAsCategoryId, levelCount: this.defaultProductLevel };
    //   this.productAvailabilityResponse = await this.homeService.checkProductAvailabilityES(this.productAvailabilityModal);
    //   this.productAvailabilityResponse = this.productAvailabilityResponse.filter(item => item.level = this.defaultProductLevel);
    //   if (this.core.isSearchWithoutSuggestion) this.loaderPlaces()
    //   else this.loadFilterData();
    // }
    // var response = await this.core.searchProduct(this.textAsSearchedTerm, this.parentNameAsCategoryName, this.esSizeCounter, this.esFromCounter);
    // if (response.products.length > 0) this.filterResponse(response);
    // this.productAvailabilityModal = { levelName: this.textAsSearchedTerm, levelId: this.parentIdAsCategoryId, levelCount: this.defaultProductLevel };
    // this.productAvailabilityResponse = await this.homeService.checkProductAvailabilityES(this.productAvailabilityModal);
    // this.productAvailabilityResponse = this.productAvailabilityResponse.filter(item => item.level = this.defaultProductLevel);
    // if (this.core.isSearchWithoutSuggestion) this.loaderPlaces()
    // else this.loadFilterData();
  }
 
  ngAfterViewInit() {
    this.core.searchBar = '';
    setTimeout(() => {
      var homePageHeader = document.getElementsByClassName("homePageHeader");
      if(homePageHeader != undefined)
        homePageHeader.length!=0? homePageHeader[0].classList.remove("homePageHeader"):{};
      
        var hdScrl = document.getElementsByClassName('header_Scroll');
      if(hdScrl.length != 0 )
      {
        if (window.localStorage['userInfo'] == undefined)
          hdScrl[0].classList.add("withoutLog");
      }
      if (window.localStorage['userInfo'] != undefined)
      {
        this.core.removeWithoutLogClass();
      }   
      var horizontalMenu = document.getElementsByClassName("menu_horizontal")[0];
      if (horizontalMenu != undefined){horizontalMenu.classList.remove("invisible"); horizontalMenu.classList.remove("d-none")} 
      
      if(window.localStorage['filterdataStorage'] != undefined)
      {
        this.filteredData = JSON.parse(window.localStorage['filterdataStorage']);
        //this.showFilterPanel = true;
        this.ids =  JSON.parse(window.localStorage['filterIDs']);
        //this.subCategory = JSON.parse(window.localStorage['filterSubCategory'] );
      }
      else
      {
        localStorage.removeItem('filterdataStorage');
        this.showFilterPanel = false;
      }
    }, 1000);
  }

  filterResponse(res) {
    this.loader = false;
    if (res.content) res = res.content.map((item) => new BrowseProductsModal(item));
    if (res.products) res = res.products.map((item) => new BrowseProductsModal(item));
    this.tilesData = res.filter(item => {
      if (item.product.productStatus) return new BrowseProductsModal(item.product)
    });
    this.filterIamgeURL();
    this.getMainImage();
    if (this.tilesData.length > 0) {
      if (this.tilesData.length == 1) this.headerMessage = 'Nice! We matched' + ' ' + this.tilesData.length + ' product for you';
      else this.headerMessage = 'Nice! We matched' + ' ' + this.tilesData.length + ' products for you';
    }
    else this.headerMessage = 'Sorry, but we don\'t have product matches for you';
    this.tilesData.length < 30 ? this.showMoreBtn = false : this.showMoreBtn = true;
    this.core.show(this.headerMessage);
    //this.core.searchMsgToggle('get offers');
    window.localStorage['browseProductSearch'] = this.headerMessage;
    return false;
  }

  filterIamgeURL() {
    for (var i = 0; i < this.tilesData.length; i++) {
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

  getMainImage() {
    for (var i = 0; i < this.tilesData.length; i++) {
      for (var j = 0; j < this.tilesData[i].product.productImages.length; j++) {
        let product = this.tilesData[i].product.productImages[j]
        if (product.mainImage == true) {
          this.tilesData[i].product.mainImageSrc = product.location
        }
      }
    }
  }

  viewDetails(tile) {
    window.localStorage['selectedProduct'] = JSON.stringify(tile);
    if(this.ids.length ==0)
    {
     
      this.filteredData = [];
    }
    else
    {
      window.localStorage['filterdataStorage'] = JSON.stringify(this.filteredData);
      window.localStorage['filterIDs'] = JSON.stringify(this.ids);
    }
   //this.route.navigateByUrl('/view-product?productId='+tile.product.kalaUniqueId);
   // this.route.navigateByUrl('/view-product?brandName='+ tile.product.retailerName.replace(/ /g, "-") + '&productName='+ tile.product.productName.replace(/ /g, "-") + '&productId='+tile.product.kalaUniqueId +'&Isfilter='+ ((this.filteredData != undefined && this.filteredData.length > 0)?'1':'0'));

    let url = '';
    if( tile.product.attributes != undefined)
    {
      if( tile.product.attributes.Brand ==  undefined)
    {
      url = '/view-product?productName='+ tile.product.productName.replace(/ /g, "-") + '&productId='+tile.product.kalaUniqueId +'&Isfilter='+ ((this.filteredData != undefined && this.filteredData.length > 0)?'1':'0');
    }
    else
    {
      url ='/view-product?brandName='+ tile.product.attributes.Brand.replace(/ /g, "-") + '&productName='+ tile.product.productName.replace(/ /g, "-") + '&productId='+tile.product.kalaUniqueId +'&Isfilter='+ ((this.filteredData != undefined && this.filteredData.length > 0)?'1':'0');

    }
  }
    else
    {
      url ='/view-product?brandName='+ tile.product.attributes.Brand.replace(/ /g, "-") + '&productName='+ tile.product.productName.replace(/ /g, "-") + '&productId='+tile.product.kalaUniqueId +'&Isfilter='+ ((this.filteredData != undefined && this.filteredData.length > 0)?'1':'0');
    }
    this.route.navigateByUrl(url);
    window.localStorage['fromES'] = true;
  }

  async showMore() {
    this.loaderShowMore = true;
    this.esFromCounter = this.esFromCounter + 30;
    if (this.isFilterUsed) {
      this.showMorePageCounter = this.showMorePageCounter + 30;
      var response = await this.homeService.loadProductFromFilterES(this.showMoreReqWithFilter,this.getOffer_orderInfo.controls.minPrice.value,this.getOffer_orderInfo.controls.maxPrice.value, this.showMorePageCounter, this.showMoreSizeCounter, this.textAsSearchedTerm, this.parentNameAsCategoryName,this.core.lastSearch,this.core.highestScore);
      if (response.products.length > 0) {
        this.core.lastSearch = response.lastSearch;
        this.core.highestScore = response.highestScore;
        this.loaderShowMore = false;
        response = response.products.map((item) => new BrowseProductsModal(item));
        if (response.length < 30) this.showMoreBtn = false;
        this.tilesData = [...this.tilesData, ...response];
        this.filterResponse(this.tilesData);
      }
      else {
        this.showMoreBtn = false;
        this.loaderShowMore = false;
      }
    }
    else {
      let text = '';
      let parentName = null;
      let parentId = null;
      let levelId =null;
      if(window.localStorage['esKeyword'] == undefined)
      {
        text = this.searchText;
      }
      else{
        text = JSON.parse(window.localStorage['esKeyword']).text;
        parentName = JSON.parse(window.localStorage['esKeyword']).parentName;
        parentId = JSON.parse(window.localStorage['esKeyword']).parentId;
        levelId = JSON.parse(window.localStorage['esKeyword']).levelId;
      }
     
      
      var response = await this.core.searchProduct(text, parentName,parentId,levelId, this.esSizeCounter, this.esFromCounter,this.core.lastSearch,this.core.highestScore);
      if (response.products.length > 0) {
        this.loaderShowMore = false;
        this.core.lastSearch = response.lastSearch;
        this.core.highestScore = response.highestScore;
        response = response.products.map(p => new BrowseProductsModal(p));
        if (response.length < 30) this.showMoreBtn = false;
        this.tilesData = [...this.tilesData, ...response];
        this.filterResponse(this.tilesData);
      }
      else {
        this.showMoreBtn = false;
        this.loaderShowMore = false;
      }
    }
  }

  enableFilterPanel() {
    this.showFilterPanel = !this.showFilterPanel;
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

   async loadFilterData() {
    this.filterModalAPI.fieldValues = [this.parentIdAsCategoryId];
    let res = await this.homeService.filterLoadSubcategoryAsync(this.filterModalAPI);
    //this.homeService.filterLoadSubcategory(this.filterModalAPI).subscribe((res) => {
      if (res.length > 0) {
        for (let i = 0; i < res.length; i++) res[i].level = this.increaseLevel;
        this.filteredData = new Array<DynamicFilters>();
        this.filteredData.push(new DynamicFilters(false, this.increaseLevel, res, [], "", this.defaultProductLevel));
        this.modifyData();
        this.sortListData();
        this.sortListLevelData();

      }
   // }, (err) => {
   //   console.log(err);
   // })
  }

  async changeFilter(data, parent,fromFilter?) {
    if(typeof data === 'string') {
      data = JSON.parse(data);
    }

    if(!data.isProductAvailable)
    {
      return;
    }
    this.isFilterUsed = true;
    this.esSizeCounter = 30;
    this.esFromCounter = 0;
    
    this.nextItemArr = this.nextItemArr.filter(item => item.level <= parent.level);
    var res;
    if (this.core.isSearchWithoutSuggestion) {
      this.filterModalAPI.fieldValues = [this.getId(data, parent)];
      if (parent.level == 1) {
        this.defaultProductLevel = 2;
        res = await this.homeService.filterLoadCategories(this.filterModalAPI);
        let categoryList = new Array<FilterMapCategoryData>();
        for (let i = 0; i < res.length; i++) categoryList.push(new FilterMapCategoryData(0, res[i].categoryName, res[i].categoryId, res[i].placeName, res[i].placeId));
      }
      else if (parent.level == 2) {
        this.defaultProductLevel = 3;
        res = await this.homeService.filterLoadSubcategoryAsync(this.filterModalAPI);
      }
      else {
        res = await this.homeService.filterLoadType(this.filterModalAPI);
      }
    }
    else {
      this.nextItemArr = this.nextItemArr.filter(item => item.level <= parent.level);
      this.filterModalAPI.fieldValues = [parent.level == 0 ? data.subCategoryId : data.productTypeId];
      var res = await this.homeService.filterLoadType(this.filterModalAPI);
    }

    if(fromFilter !='priceFilter')
    {
      parent.selectedValues.push(data);
      let hashTable = {};
      let deduped = parent.selectedValues.filter(function (el) {
        var key = JSON.stringify(el);
        var match = Boolean(hashTable[key]);
        return (match ? false : hashTable[key] = true);
      });
      parent.selectedValues = deduped;
    }
    if (res.length > 0) {
      this.defaultProductLevel = parent.pALevel + 1;
      if (this.increaseLevel == parent.level) this.increaseLevel = this.increaseLevel + 1;
      else {
        this.increaseLevel = parent.level + 1;
        //this.commonToFilterData();
      }
      
      for (let i = 0; i < res.length; i++) res[i].level = this.increaseLevel;
      if(res[0].level == 3)
      {
        res.sort((a,b):number => {
          if(a.subCategoryName<b.subCategoryName) return -1;
          if(a.subCategoryName>b.subCategoryName) return 1;
          return 0;
        });  
      }
      else if(res[0].level == 2)
      {
        res.sort((a,b):number => {
          if(a.categoryName<b.categoryName) return -1;
          if(a.categoryName>b.categoryName) return 1;
          return 0;
        });  
      }
      

      var getExisting = this.filteredData.filter(item => item.level == this.increaseLevel);
      if (getExisting.length > 0) {
        if (this.core.isSearchWithoutSuggestion) {
          getExisting[0].data.push({ level: this.increaseLevel, label: this.getLabel(data, parent), data: res })
        }
        else {
          getExisting[0].data.push({ level: this.increaseLevel, label: parent.level == 0 ? data.subCategoryName : data.productTypeName, data: res })
        }
        // getExisting[0].selectedValues = this.filteredData;
        getExisting[0].data = getExisting[0].data.filter((elem, index, self) => self.findIndex((item) => {
          return (item.level === elem.level && item.label === elem.label)
        }) === index);
      }
      else {
        if (this.core.isSearchWithoutSuggestion) {
          this.newData.push({ level: this.increaseLevel, label: this.getLabel(data, parent), data: res });
        }
        else {
          this.newData.push({ level: this.increaseLevel, label: parent.level == 0 ? data.subCategoryName : data.productTypeName, data: res });
        }
        var newDataFiltered = this.newData.filter(item => item.level != parent.level && item.level > parent.level);
        newDataFiltered = newDataFiltered.filter((elem, index, self) => self.findIndex((item) => {
          return (item.level === elem.level && item.label === elem.label)
        }) === index);
        if (this.core.isSearchWithoutSuggestion && fromFilter != 'priceFilter') {
          this.filteredData.push(new DynamicFilters(true, this.increaseLevel, newDataFiltered, [], this.getLabel(data, parent), this.defaultProductLevel));
        }
        else if(fromFilter != 'priceFilter') {
          this.filteredData.push(new DynamicFilters(true, this.increaseLevel, newDataFiltered, [], parent.level == 0 ? data.subCategoryName : data.productTypeName, this.defaultProductLevel));
        }
        //newDataFiltered = [];
        //this.newData = [];
      }
    }
    else {
      if (!data.nextLevelProductTypeStatus) {
        if (this.core.isSearchWithoutSuggestion) {
          this.nextItemArr.push({ level: parent.level, id: this.getId(data, parent) });
        }
        else {
          this.nextItemArr.push({ level: parent.level, id: parent.level == 0 ? data.subCategoryId : data.productTypeId });
        }
        this.nextItemArr = this.nextItemArr.filter((elem, index, self) => self.findIndex((item) => {
          return (item.id === elem.id && item.level === elem.level)
        }) === index);
      }
    }
    /*Check product Availability*/
    if (this.core.isSearchWithoutSuggestion) {
      this.productAvailabilityModal = {
        levelName: this.textAsSearchedTerm,
        levelId: this.getId(data, parent),
        levelCount: this.defaultProductLevel,
        freeFormText: true
      };
    }
    else {
      this.productAvailabilityModal = {
        levelName: this.textAsSearchedTerm,
        levelId: parent.level == 0 ? data.subCategoryId : data.productTypeId,
        levelCount: this.defaultProductLevel,
        freeFormText: false
      };
    }
    this.checkProductAvailability();
    this.sortFilter();
    /*Check product Availability*/
    if(this.fromBanner != undefined)
    {
      
    }
    this.loadProducts(data, parent); /*Load Products*/
  }

  sortFilter()
  {
    for (let i = 0; i < this.filteredData.length; i++) {
      this.filteredData[i].data.sort((a,b):number => {
        if(a.label<b.label) return -1;
        if(a.label>b.label) return 1;
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

  async loadProducts(data, parent) {
    this.ids = [];
    let filterId;
    for (let i = 0; i < parent.selectedValues.length; i++) {
      if (this.core.isSearchWithoutSuggestion) {
        if (parent.level == 1) this.ids.push(parent.selectedValues[i].placeId)
        else if (parent.level == 2) this.ids.push(parent.selectedValues[i].categoryId)
        else if (parent.level == 3) this.ids.push(parent.selectedValues[i].subCategoryId)
        else this.ids.push(parent.selectedValues[i].productTypeId)
      }
      else {
        filterId = parent.selectedValues[i].subCategoryId != undefined ? parent.selectedValues[i].subCategoryId : parent.selectedValues[i].productTypeId;
        this.ids.push(filterId);
      }
    }
    if (this.nextItemArr.length > 0) {
      for (let i = 0; i < this.nextItemArr.length; i++) {
        this.ids.push(this.nextItemArr[i].id);
      }
    }
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
    let dataId;
    if (this.core.isSearchWithoutSuggestion) {
      if (data.level == 1) dataId = data.placeId;
      else if (data.level == 2) dataId = data.categoryId;
      else if (data.level == 3) dataId = data.subCategoryId;
      else dataId = data.productTypeId;
    }
    else dataId = data.subCategoryId != undefined ? data.subCategoryId : data.productTypeId;
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
        if (this.core.isSearchWithoutSuggestion) {
          for (let j = 0; j < this.filteredData[i].selectedValues.length; j++) {
            let filterId;
            if (this.filteredData[i].selectedValues[j].level == 1) filterId = this.filteredData[i].selectedValues[j].placeId;
            else if (this.filteredData[i].selectedValues[j].level == 2) filterId = this.filteredData[i].selectedValues[j].categoryId;
            else if (this.filteredData[i].selectedValues[j].level == 3) filterId = this.filteredData[i].selectedValues[j].subCategoryId;
            else filterId = this.filteredData[i].selectedValues[j].productTypeId;
            this.filteredData[i].selectedValues[j].subCategoryId != undefined ? this.filteredData[i].selectedValues[j].subCategoryId : this.filteredData[i].selectedValues[j].productTypeId;
            if (dataId == filterId) {
              this.filteredData[i].selectedValues.splice(j, 1);
              if (this.filteredData[i].selectedValues.length == 0) {
                this.filteredData.splice(i, 1);
                break;
              }
            }
          }
        }
        else {
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
    this.productAvailabilityResponse = await this.homeService.checkProductAvailabilityES(this.productAvailabilityModal);
    this.productAvailabilityResponse = this.productAvailabilityResponse.filter(item => item.level = this.defaultProductLevel);
   
    if(this.productAvailabilityResponse.length >0)
    this.productAvailabilityResponse.sort((a,b):number => {
     if(a.name<b.name) return -1;
     if(a.name>b.name) return 1;
     return 0;
     
   });

    this.modifyData();
    this.sortListData();
    this.sortListLevelData();

  }

  clearAllFilters() {
    this.loader = true;
    this.isFilterUsed = false;
    this.defaultProductLevel = 3;
    this.filteredData = [];
    this.increaseLevel = 0;
    this.ids = [];
    this.newData = [];
    this.nextItemArr = [];
    this.esSizeCounter = 30;
    this.esFromCounter = 0;
    this.getOffer_orderInfo.controls['minPrice'].setValue(0)
    this.getOffer_orderInfo.controls['maxPrice'].setValue(this.maxPrice)
    this.isFilterValue = '0';
    this.freeFormText = true;
    localStorage.removeItem('filterdataStorage');
    localStorage.removeItem('filterIDs');

    this.productAvailabilityModal = { levelName: this.textAsSearchedTerm, levelId: this.parentIdAsCategoryId, levelCount: this.defaultProductLevel };
    this.checkProductAvailability();
    this.enableFilterPanel();
    this.loadType();
    this.filteredData = [];
    this.ids = [];

  }
sortListData()
{
  if (this.core.isSearchWithoutSuggestion) {
    for (let i = 0; i < this.productAvailabilityResponse.length; i++) {
      for (let j = 0; j < this.filteredData.length; j++) {
        if (this.productAvailabilityResponse[i].level == this.filteredData[j].pALevel) {
          for (let k = 0; k < this.filteredData[j].data.length; k++) {
            if (this.filteredData[j].data[k].level == 1) {
             
              
              this.filteredData[j].data.sort((a,b):number => {
                if(a.subCategoryName<b.subCategoryName) return -1;
                if(a.subCategoryName>b.subCategoryName) return 1;
                return 0;
              });
              break;
            }
            else if (this.filteredData[j].data[k].level == 2) {
              for (let l = 0; l < this.filteredData[j].data[k].data.length; l++) {
                let name = this.filteredData[j].data[k].data[l].categoryName;
              
                this.filteredData[j].data.sort((a,b):number => {
                  if(a.categoryName<b.categoryName) return -1;
                  if(a.categoryName>b.categoryName) return 1;
                  return 0;
                });
                break;
              }
            }
            else if (this.filteredData[j].data[k].level == 3) {
              for (let l = 0; l < this.filteredData[j].data[k].data.length; l++) {
                let name = this.filteredData[j].data[k].data[l].subCategoryName;
                this.filteredData[j].data.sort((a,b):number => {
                  if(a.subCategoryName<b.subCategoryName) return -1;
                  if(a.subCategoryName>b.subCategoryName) return 1;
                  return 0;
                });
               break;
              }
            }
            else {
              for (let l = 0; l < this.filteredData[j].data[k].data.length; l++) {
                let name = this.filteredData[j].data[k].data[l].productTypeName;
                this.filteredData[j].data.sort((a,b):number => {
                  if(a.productTypeName<b.productTypeName) return -1;
                  if(a.productTypeName>b.productTypeName) return 1;
                  return 0;
                });
                break;
               
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
             
              
              this.filteredData[j].data.sort((a,b):number => {
                if(a.subCategoryName<b.subCategoryName) return -1;
                if(a.subCategoryName>b.subCategoryName) return 1;
                return 0;
              });
              break;
            }
            /*If Level > 0 (Types)*/
            else {
              for (let l = 0; l < this.filteredData[j].data[k].data.length; l++) {
                this.filteredData[j].data[k].data.sort((a,b):number => {
                  if(a.productTypeName<b.productTypeName) return -1;
                  if(a.productTypeName>b.productTypeName) return 1;
                  return 0;
                });
               break;
              }
            }
          }
        }
      }
    }
  }
  
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
    console.log(this.filteredData)
  }
  onScroll() {
    console.log('scrolled!!');
      this.showMore();
  }
  fetchDataOnPriceRange()
  {
    console.log("change set");
    if(this.filteredData != undefined && this.filteredData.length>0 && this.filteredData[0].data != undefined && this.filteredData[0].data.length>0 && this.filteredData[this.filteredData.length - 1].selectedValues.length > 0) {
      this.changeFilter( JSON.stringify(this.filteredData[this.filteredData.length - 1].selectedValues[0]),this.filteredData[this.filteredData.length - 1],'priceFilter');
    }
    else if(this.filteredData != undefined && this.filteredData.length>0 && this.filteredData[0].data != undefined && this.filteredData[0].data.length>0){
      this.changeFilter( JSON.stringify(this.filteredData[0].data[this.filteredData[0].data.length - 1]),this.filteredData[0],'priceFilter');
    }
  }

  fetchDataOnPriceRangeDxNum()
  {
    this.minValuePrice != this.getOffer_orderInfo.controls.minPrice.value? this.minValuePrice = this.getOffer_orderInfo.controls.minPrice.value:{};
    this.maxValuePrice != this.getOffer_orderInfo.controls.maxPrice.value?this.maxValuePrice = this.getOffer_orderInfo.controls.maxPrice.value:{};
     if(this.filteredData != undefined && this.filteredData.length>0 && this.filteredData[0].data != undefined && this.filteredData[0].data.length>0 && this.filteredData[this.filteredData.length - 1].selectedValues.length > 0) {
      this.changeFilter( JSON.stringify(this.filteredData[this.filteredData.length - 1].selectedValues[0]),this.filteredData[this.filteredData.length - 1],'priceFilter');
    }
    else if(this.filteredData != undefined && this.filteredData.length>0 && this.filteredData[0].data != undefined && this.filteredData[0].data.length>0){
      this.changeFilter( JSON.stringify(this.filteredData[0].data[this.filteredData[0].data.length - 1]),this.filteredData[0],'priceFilter');
    }
  }
  toggleCFPanel() {
    this.showCategoryFilterBar = !this.showCategoryFilterBar;
    this.afterFilter = !this.afterFilter;
    if (this.showCategoryFilterBar) {
      this.showCategoryPanel = true;
      // setTimeout(() => {
      //   let elem = document.querySelector('.categoryFilterBtnBarWrapper');
      //   elem.scrollIntoView(true);
      // }, 10)
    }
    else this.showCategoryPanel = false;
    this.showFilterPanel = false;
  }
  applyFilters() {
    this.showCategoryFilterBar = false;
    this.afterFilter = false;
  }
}
