export class RetailerProductInfo {
    public retailerId: string;
    public productPreferenceId: string;
    public places: Array<RetailerProductPlace>;
    public status: boolean | null = false;
    constructor(obj?: any) {
        this.places = new Array<RetailerProductPlace>();
        if (obj) {
            this.retailerId = obj.retailerId;
            this.productPreferenceId = obj.productPreferenceId;
            this.places = new Array<RetailerProductPlace>();
            if (obj.places && obj.places.length > 0) {
                this.places = obj.places.map(p => new RetailerProductPlace(p));
            }
            this.status = true;
        }
    }
}
export class RetailerProductPlace {
    public placeId: string;
    public placeName: string;
    public categories: Array<RetailerProductCategory>;
    constructor(obj?: any) {
        this.categories = new Array<RetailerProductCategory>();
        if (obj) {
            this.placeId = obj.placeId;
            this.placeName = obj.placeName;
            if (obj.categories && obj.categories.length > 0) {
                this.categories = obj.categories.map(p => new RetailerProductCategory(p));
            }
        }
    }
}
export class RetailerProductCategory {
    public categoryId: string;
    public categoryName: string;
    public subCategories: Array<RetailerProductSubCategory>;
    constructor(obj?: any) {
        this.subCategories = new Array<RetailerProductSubCategory>();
        if (obj) {
            this.categoryId = obj.categoryId;
            this.categoryName = obj.categoryName;
            if (obj.subCategories && obj.subCategories.length > 0) {
                this.subCategories = obj.subCategories.map(p => new RetailerProductSubCategory(p));
            }
        }
    }
} export class RetailerProductSubCategory {
    public subCategoryId: string;
    public subCategoryName: string;
    public types: Array<RetailerProductType>;
    constructor(obj?: any) {
        this.types = new Array<RetailerProductType>();
        if (obj) {
            this.subCategoryId = obj.subCategoryId;
            this.subCategoryName = obj.subCategoryName;
            if (obj.types && obj.types.length > 0) {
                this.types = obj.types.map(p => new RetailerProductType(p));
            }
        }
    }
} export class RetailerProductType {
    public typeId: string;
    public typeName: string;
    constructor(obj?: any) {
        if (obj) {
            this.typeId = obj.typeId;
            this.typeName = obj.typeName;
        } else {
        }
    }
}
