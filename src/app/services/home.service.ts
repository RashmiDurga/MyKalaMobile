import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';
import { environment } from '../../environments/environment';

@Injectable()
export class HomeService {
  private BASE_URL: string = environment.productList;
  constructor(private http: Http) { }

  getTilesPlace() {
    const url: string = `${this.BASE_URL}/${environment.apis.products.getPlaces}`;
    return this.http.get(url).map((res) => res.json());
  }

  getTilesCategory(placeId) {
    const url: string = `${this.BASE_URL}/places/${placeId}/${environment.apis.products.getCategories}`;
    return this.http.get(url).map((res) => res.json());
  }

  getTilesSubCategory(categoryId) {
    const url: string = `${this.BASE_URL}/category/${categoryId}/${environment.apis.products.getSubCategories}`;
    return this.http.get(url).map((res) => res.json());
  }

  getProductList(placeName, categoryName, page, size, subCategory?: any) {
    if (subCategory != undefined) var url: string = `${this.BASE_URL}/browseProduct?page=${page}&size=${size}&sortOrder=asc&elementType=createdDate&productPlaceName=${placeName}&productCategoryName=${categoryName}&productSubCategoryName=${subCategory}`;
    else var url: string = `${this.BASE_URL}/browseProduct?page=${page}&size=${size}&sortOrder=asc&elementType=createdDate&productPlaceName=${placeName}&productCategoryName=${categoryName}`;

    return this.http.get(url).map((res) => res.json());
  }
  getProductListAsync(placeName, categoryName, page, size, subCategory?: any) {
    if (subCategory != undefined) var url: string = `${this.BASE_URL}/browseProduct?page=${page}&size=${size}&sortOrder=asc&elementType=createdDate&productPlaceName=${placeName}&productCategoryName=${categoryName}&productSubCategoryName=${subCategory}`;
    else var url: string = `${this.BASE_URL}/browseProduct?page=${page}&size=${size}&sortOrder=asc&elementType=createdDate&productPlaceName=${placeName}&productCategoryName=${categoryName}`;

    return this.http.get(url).toPromise().then((res) => res.json());
  }

  getTilesType(subCategoryId) {
    const url: string = `${this.BASE_URL}/subCategory/${subCategoryId}/${environment.apis.products.getTypes}`;
    return this.http.get(url).map((res) => res.json());
  }

  productAvailability(data) {
    const url: string = `${this.BASE_URL}/${environment.apis.products.comingSoon}`;
    return this.http.post(url, data).map((res) => res.json());
  }

  checkProductAvailability(data) {
    const url: string = `${this.BASE_URL}/${environment.apis.products.comingSoon}`;
    return this.http.post(url, data).toPromise().then((res) => res.json());
  }

  checkProductAvailabilityES(data) {
    const url: string = `${this.BASE_URL}/${environment.apis.products.searchCommingSoon}`;
    return this.http.post(url, data).toPromise().then((res) => res.json());
  }

  filterLoadSubcategoryAsync(data) {
    const url: string = `${this.BASE_URL}/subCategoriesList`;
    return this.http.post(url, data).toPromise().then((res) => res.json());
  }

  filterLoadCategories(data) {
    const url: string = `${this.BASE_URL}/categoriesList`;
    return this.http.post(url, data).toPromise().then((res) => res.json());
  }

  filterLoadSubcategory(data) {
    const url: string = `${this.BASE_URL}/subCategoriesList`;
    return this.http.post(url, data).map((res) => res.json());
  }

  filterLoadType(data) {
    const url: string = `${this.BASE_URL}/typesList`;
    return this.http.post(url, data).toPromise().then((res) => res.json());
  }

  

  
  subCategoriesCount(categoryId:any) {
    var url: string = `${this.BASE_URL}/subCategoriesCount/${categoryId}`;
    return this.http.get(url).map((res) => res.json());
  }
  loadHorizontalMenuData()
  {
    const url: string = `${this.BASE_URL}/${environment.apis.products.getTaxonomies}`;
    return this.http.get(url).map((res) => res.json());
  }
  getPlaceByCatId(categoryId)
  {
    var url: string = `${this.BASE_URL}/category/${categoryId}/place`;
    return this.http.get(url).toPromise().then((res) => res.json());
  }
  loadProductFromFilter(ids,minValuePrice?:number,maxValuePrice?:number, page?: number, size?: number) {
    let url:string;
    if(maxValuePrice != 0)
    {
      url = `${this.BASE_URL}/dynamicSearch/${ids}?page=${page}&size=${size}&priceFilter=true&lowestPrice=${minValuePrice}&highestPrice=${maxValuePrice}&sort=kalaPrice`;
    }
    else
    {
      url = `${this.BASE_URL}/dynamicSearch/${ids}?page=${page}&size=${size}`;
    }
    return this.http.get(url).toPromise().then((res) => res.json());
  }
  loadProductFromFilterSync(ids,minValuePrice?:number,maxValuePrice?:number, page?: number, size?: number) {
    let url:string;
    if(maxValuePrice != 0)
    {
      url = `${this.BASE_URL}/dynamicSearch/${ids}?page=${page}&size=${size}&priceFilter=true&lowestPrice=${minValuePrice}&highestPrice=${maxValuePrice}&sort=kalaPrice`;
    }
    else
    {
      url = `${this.BASE_URL}/dynamicSearch/${ids}?page=${page}&size=${size}`;
    }
    return this.http.get(url).map((res) => res.json());
  }
  // loadProductFromFilterES(ids,minValuePrice?:number,maxValuePrice?:number, page?: number, size?: number, type?: string, parentName?: string) {
  //   let url:string;
  //   if(maxValuePrice != 0)
  //   {
  //     if(ids == null)
  //     {
  //       url = `${this.BASE_URL}/textSearch?type=${type}&parentName=${encodeURIComponent(parentName)}&size=${size}&priceFilter=true&lowestPrice=${minValuePrice}&highestPrice=${maxValuePrice}&from=${page}`;
  //     }
  //     else
  //     {
  //       url = `${this.BASE_URL}/textSearch/${ids}?type=${type}&parentName=${encodeURIComponent(parentName)}&size=${size}&priceFilter=true&lowestPrice=${minValuePrice}&highestPrice=${maxValuePrice}&from=${page}`;
  //     }
  //   }
  //   else
  //   {
  //     if(ids == null)
  //     {
  //       url = `${this.BASE_URL}/textSearch?type=${type}&parentName=${encodeURIComponent(parentName)}&size=${size}&from=${page}`;
  //     }
  //     else
  //     {
  //       url = `${this.BASE_URL}/textSearch/${ids}/?type=${type}&parentName=${encodeURIComponent(parentName)}&size=${size}&from=${page}`;
  //     }
  //   }
  //   return this.http.get(url).toPromise().then((res) => res.json());
  // }
  loadProductFromFilterES(ids,minValuePrice?:number,maxValuePrice?:number, page?: number, size?: number, type?: string, parentName?: string,lastSearch?:any,highestScore?:any) {
    let url:string;
    if(maxValuePrice != 0)
    {
      if(ids == null)
      {
        if(parentName == null || parentName == undefined)
        {
          url = `${this.BASE_URL}/textSearch?type=${type}&size=${size}&priceFilter=true&lowestPrice=${minValuePrice}&highestPrice=${maxValuePrice}&from=${page}&lastSearch=${lastSearch}&highestScore=${highestScore}`;
        }
        else
        {
          url = `${this.BASE_URL}/textSearch?type=${type}&parentName=${encodeURIComponent(parentName)}&size=${size}&priceFilter=true&lowestPrice=${minValuePrice}&highestPrice=${maxValuePrice}&from=${page}&lastSearch=${lastSearch}&highestScore=${highestScore}`;
        }
      }
      else
      {
        if(parentName == null || parentName == undefined)
        {
          url = `${this.BASE_URL}/textSearch/${ids}?type=${type}&size=${size}&priceFilter=true&lowestPrice=${minValuePrice}&highestPrice=${maxValuePrice}&from=${page}&lastSearch=${lastSearch}&highestScore=${highestScore}`;
        }
        else
        {
          url = `${this.BASE_URL}/textSearch/${ids}?type=${type}&parentName=${encodeURIComponent(parentName)}&size=${size}&priceFilter=true&lowestPrice=${minValuePrice}&highestPrice=${maxValuePrice}&from=${page}&lastSearch=${lastSearch}&highestScore=${highestScore}`;
        }
      }
    }
    else
    {
      if(ids == null)
      {
        url = `${this.BASE_URL}/textSearch?type=${type}&parentName=${encodeURIComponent(parentName)}&size=${size}&from=${page}&lastSearch=${lastSearch}&highestScore=${highestScore}`;
      }
      else
      {
        url = `${this.BASE_URL}/textSearch/${ids}/?type=${type}&parentName=${encodeURIComponent(parentName)}&size=${size}&from=${page}&lastSearch=${lastSearch}&highestScore=${highestScore}`;
      }
    }
    return this.http.get(url).toPromise().then((res) => res.json());
  }
}
