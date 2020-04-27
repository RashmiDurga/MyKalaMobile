export class CheckoutShippingAddress {
    constructor(
        public addID: string,
        public addressLine1: string,
        public addressLine2: string,
        public city: string,
        public state: string,
        public zipcode: string,
        public addressType: string,
        public defaultAddress?:boolean
    ) { }
}