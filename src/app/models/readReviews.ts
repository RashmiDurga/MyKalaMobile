export class ReadReviewModel {
    constructor(
        public consumerId: string,
        public consumerReviewId: string,
        public productName: string,
        public rating: number,
        public retailerName: string,
        public reviewDescription: string,
        public reviewImages: string,
        public firstName: string,
        public lastName: string
    ) { }
}