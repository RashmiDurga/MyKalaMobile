export class ConsumerAddress {
    constructor(
        public addID: string,
        public addressLineOne: string,
        public addressLineTwo: string,
        public city: string,
        public state: string,
        public zipcode: string,
        public addressType: string
    ) { }
}