export class Pagination {
    constructor(obj?: any) {
        if (obj) {
            this.last = obj.last;
            this.totalElements = obj.totalElements;
            this.totalPages = obj.totalPages;
            this.size = obj.size;
            this.number = obj.number;
            this.first = obj.first;
        }
    }
    public last: boolean;
    public totalElements: number;
    public totalPages: number;
    public size: number;
    public number: number;
    public first: boolean;
}
