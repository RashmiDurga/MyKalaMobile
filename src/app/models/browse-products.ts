import { ProductsInfo } from './products-info';

export class BrowseProductsModal {
    public product = new ProductsInfo();
    constructor(obj?: any) {
        if (obj) {
            this.product = new ProductsInfo(obj);
        }
    }
}
export class PromotionalBannerModel{
    public bannerName: string;
    public bannerImg: string;
    constructor(obj?: any) {
        if (obj) {
            this.bannerName = obj.bannerName;
            this.bannerImg = obj.bannerImg;
        }
    }
}

