export class FilterMapPlaceData {
    constructor(
        public level: number,
        public placeName: string,
        public placeId: string
    ) { }
}

export class FilterMapCategoryData {
    constructor(
        public level: number,
        public categoryName: string,
        public categoryId: string,
        public placeName: string,
        public placeId: string
    ) { }
}