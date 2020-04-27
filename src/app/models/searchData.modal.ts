export class SearchDataModal {
    constructor(
        public id: string,
        public name: string,
        public text: string,
        public level?: string,
        public imgUrl?: string,
        public iconUrl?: string,
        public selection?: any,
        public expanded?: boolean,
        public isProductAvailable?: boolean
    ) { }
}