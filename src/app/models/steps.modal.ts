export class OfferInfo1 {
    constructor(
        public place: string,
        public category: string,
        public subCategory: string,
        public type: Array<any>,
        public placeId?: string,
        public categoryId?: string,
        public subCategoryId?: string
    ) { }
}
export class OfferInfo2 {
    constructor(
        public place: string,
        public category: string,
        public subCategory: string,
        public type: Array<any>) { }
}
export class OfferInfo3 {
    constructor(
        public priceRange: any,
        public delivery: string,
        public instruction: string,
        public location: Array<any>) { }
}
export class OfferInfo4 {
    public placeName: string;
    public categoryName: string;
    public subCategoryName: string;
    public typeName: Array<any>;
    public deliveryMethod: string;
    public deliveryLocation: Array<any>;
    public price = new PriceRange();
    public emailId: string;
    public userId: string;
    public endDate: Date;
    public startDate: Date;
    public consumerExist?: boolean;
    public offerId?: string;
    public attributes: any;
    public productType: string;
    public placeId?: string;
    public categoryId?: string;
    public subCategoryId?: string;
}
export class PriceRange {
    public minPrice: number;
    public maxPrice: number
}