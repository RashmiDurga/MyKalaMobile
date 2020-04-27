export class ReportReviewSummary {
    public avg: number;
    public avgReviewCount: ReviewItem[];
    public reviewOrderAggregation: ReviewItem[];
    constructor(obj?: any) {
        if (obj) {
            this.avg = obj.avg;
            this.avgReviewCount = obj.avgReviewCount.map(p => new ReviewItem(p));
            this.reviewOrderAggregation = obj.reviewOrderAggregation.map(p => new ReviewItem(p));
        }
    }
}
export class ReviewItem {
    public year: number;
    public month: number;
    public total: number;
    public completed: number;
    public avg: number;
    constructor(obj?: any) {
        if (obj) {
            this.year = obj.year;
            this.month = obj.month;
            this.total = obj.total;
            this.completed = obj.completed;
            this.avg = obj.avg;
        }
    }
}