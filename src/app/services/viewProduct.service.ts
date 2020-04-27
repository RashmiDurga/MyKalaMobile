import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';
import { environment } from '../../environments/environment';

@Injectable()
export class ViewProductService {
    private BASE_URL: string = environment.profileInterestPublic;
    constructor(private http: Http) { }

    getReviews(productId) {
        const url: string = `${this.BASE_URL}/${environment.apis.profileInterest.getProductReviews}?page=0&size=10&sortOrder=asc&elementType=createdDate&productId=${productId}`;
        return this.http.get(url).map((res) => res.json());
    }

    getReviewsSummary(productId) {
        const url: string = `${this.BASE_URL}/${environment.apis.profileInterest.productReviewSummary}/${productId}`;
        return this.http.get(url).map((res) => res.json());
    }

    getRetailerPolicy(retailerId) {
        const BASE_URL: string = environment.shippingMethod;
        const url: string = `${BASE_URL}/retailer/v1/public/${retailerId}/${environment.apis.shippingMethod.retailerPolicy}`;
        return this.http.get(url).map((res) => res.json());
    }

    getDynamicAttributes(selectedProduct, data, from,lastAttribute?:any,selectedData?:any) {
        const BASE_URL: string = environment.productList;
        let url: string;
        selectedProduct.product.productName = selectedProduct.product.productName.replace("&", "%26");
        selectedProduct.product.productPlaceName = selectedProduct.product.productPlaceName.replace("&", "%26");
        selectedProduct.product.productCategoryName = selectedProduct.product.productCategoryName.replace("&", "%26");
        selectedProduct.product.productSubCategoryName = selectedProduct.product.productSubCategoryName.replace("&", "%26");
        // if (from == 'color') url = `${BASE_URL}/${environment.apis.products.dynamicAttributes}?retailerName=${selectedProduct.product.retailerName}&productName=${selectedProduct.product.productName}&productPlaceName=${selectedProduct.product.productPlaceName}&productCategoryName=${selectedProduct.product.productCategoryName}&productSubCategoryName=${selectedProduct.product.productSubCategoryName}&selected=Color&value=${data}`;
        // else url = `${BASE_URL}/${environment.apis.products.dynamicAttributes}?retailerName=${selectedProduct.product.retailerName}&productName=${selectedProduct.product.productName}&productPlaceName=${selectedProduct.product.productPlaceName}&productCategoryName=${selectedProduct.product.productCategoryName}&productSubCategoryName=${selectedProduct.product.productSubCategoryName}&selected=Size&value=${data}`;
        let parameterAttributes='';
        if(selectedData != undefined)
        for (var i = 0; i < selectedData.length; i++) {
            parameterAttributes+= '&'+(selectedData[i].key +'='+selectedData[i].innerhtml);
        }

        if(from !=undefined)
        {
            url = `${BASE_URL}/${environment.apis.products.dynamicAttributes}?retailerName=${encodeURIComponent(selectedProduct.product.retailerName)}&productName=${encodeURIComponent(selectedProduct.product.productName)}&productPlaceName=${encodeURIComponent(selectedProduct.product.productPlaceName)}&productCategoryName=${encodeURIComponent(selectedProduct.product.productCategoryName)}&productSubCategoryName=${encodeURIComponent(selectedProduct.product.productSubCategoryName)}${parameterAttributes}`;
        }
        else
        {
            url = `${BASE_URL}/${environment.apis.products.dynamicAttributes}?retailerName=${encodeURIComponent(selectedProduct.product.retailerName)}&productName=${encodeURIComponent(selectedProduct.product.productName)}&productPlaceName=${encodeURIComponent(selectedProduct.product.productPlaceName)}&productCategoryName=${encodeURIComponent(selectedProduct.product.productCategoryName)}&productSubCategoryName=${encodeURIComponent(selectedProduct.product.productSubCategoryName)}`;
        }
        return this.http.get(url).toPromise().then((res) => res.json());
        //return this.http.get(url).map((res) => res.json());
    }

    getProductDetails(selectedProduct, data, from,lastAttribute? : any, selectedData?:any) {
        const BASE_URL: string = environment.productList;
        selectedProduct.product.productName = selectedProduct.product.productName.replace("&", "%26");
        selectedProduct.product.productPlaceName = selectedProduct.product.productPlaceName.replace("&", "%26");
        selectedProduct.product.productCategoryName = selectedProduct.product.productCategoryName.replace("&", "%26");
        selectedProduct.product.productSubCategoryName = selectedProduct.product.productSubCategoryName.replace("&", "%26");
        let url: string;
        // if (sendOnlyColor) {
        //     url = `${BASE_URL}/${environment.apis.products.productDetails}?retailerName=${selectedProduct.product.retailerName}&productName=${selectedProduct.product.productName}&productPlaceName=${selectedProduct.product.productPlaceName}&productCategoryName=${selectedProduct.product.productCategoryName}&productSubCategoryName=${selectedProduct.product.productSubCategoryName}&Color=${data}`;
        // }
        // else if (sendOnlySize) {
        //     url = `${BASE_URL}/${environment.apis.products.productDetails}?retailerName=${selectedProduct.product.retailerName}&productName=${selectedProduct.product.productName}&productPlaceName=${selectedProduct.product.productPlaceName}&productCategoryName=${selectedProduct.product.productCategoryName}&productSubCategoryName=${selectedProduct.product.productSubCategoryName}&Size=${data}`;
        // }
        // else {
        //     if (from == 'color') {
        //         if (lastSize != undefined) url = `${BASE_URL}/${environment.apis.products.productDetails}?retailerName=${selectedProduct.product.retailerName}&productName=${selectedProduct.product.productName}&productPlaceName=${selectedProduct.product.productPlaceName}&productCategoryName=${selectedProduct.product.productCategoryName}&productSubCategoryName=${selectedProduct.product.productSubCategoryName}&Color=${data}&Size=${lastSize}`;
        //         else url = `${BASE_URL}/${environment.apis.products.productDetails}?retailerName=${selectedProduct.product.retailerName}&productName=${selectedProduct.product.productName}&productPlaceName=${selectedProduct.product.productPlaceName}&productCategoryName=${selectedProduct.product.productCategoryName}&productSubCategoryName=${selectedProduct.product.productSubCategoryName}&Color=${data}`;
        //     }
        //     else {
        //         if (lastColor != undefined) url = `${BASE_URL}/${environment.apis.products.productDetails}?retailerName=${selectedProduct.product.retailerName}&productName=${selectedProduct.product.productName}&productPlaceName=${selectedProduct.product.productPlaceName}&productCategoryName=${selectedProduct.product.productCategoryName}&productSubCategoryName=${selectedProduct.product.productSubCategoryName}&Size=${data}&Color=${lastColor}`;
        //         else url = `${BASE_URL}/${environment.apis.products.productDetails}?retailerName=${selectedProduct.product.retailerName}&productName=${selectedProduct.product.productName}&productPlaceName=${selectedProduct.product.productPlaceName}&productCategoryName=${selectedProduct.product.productCategoryName}&productSubCategoryName=${selectedProduct.product.productSubCategoryName}&Size=${data}`;
        //     }
        // }
        let parameterAttributes='';
        if(selectedData != undefined)
        for (var i = 0; i < selectedData.length; i++) {
            parameterAttributes+= '&'+(selectedData[i].key +'='+selectedData[i].innerhtml);
        }

        url = `${BASE_URL}/${environment.apis.products.productDetails}?retailerName=${selectedProduct.product.retailerName}&productName=${encodeURIComponent(selectedProduct.product.productName)}&productPlaceName=${encodeURIComponent(selectedProduct.product.productPlaceName)}&productCategoryName=${encodeURIComponent(selectedProduct.product.productCategoryName)}&productSubCategoryName=${encodeURIComponent(selectedProduct.product.productSubCategoryName)}${parameterAttributes}`;

        //return this.http.get(url).map((res) => res.json());
        return this.http.get(url).toPromise().then((res) => res.json());
    }

    getItBy(shippingProfileId) {
        const BASE_URL: string = environment.shippingMethod;
        const url: string = `${BASE_URL}/retailer/v1/public/${shippingProfileId}/${environment.apis.shippingMethod.latestShipMethodName}`;
        return this.http.get(url).map((res) => res.text());
    }
}