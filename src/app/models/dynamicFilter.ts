export class DynamicFilters {
    constructor(
        public appendSelect: boolean,
        public level: number,
        public data: Array<any>,
        public selectedValues: Array<any>,
        public selectedString?: string,
        public pALevel?: number
    ) { }
}
export class DynamicFiltersCarousel{
    constructor(
        public fileterDataSet: DynamicFilters,
        public carouselData: Array<any>
        ){}
}
export class DynamicFilterLevelData{
    
    public categoryId: string;
    public categoryName: string;
    public subCategoryId: string;
    public subCategoryName: string;
    public taxCode: string;
    public nextLevelProductTypeStatus: boolean;
    public count:any;
    public level:any;
    public isProductAvailable:boolean;
    constructor(obj?: any) {
        if (obj) {
            this.categoryId = obj.subCategoryId;
            this.categoryName = obj.subCategoryName;
            this.subCategoryId = obj.subCategoryId;
            this.subCategoryName = obj.subCategoryName;
            this.taxCode = obj.taxCode;
            this.nextLevelProductTypeStatus = obj.nextLevelProductTypeStatus;
            this.level = obj.level;
            this.count = obj.count;
            this.isProductAvailable = obj.isProductAvailable;
        }
    }
}