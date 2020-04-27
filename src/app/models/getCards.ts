export class GetCustomerCards {
    constructor(
        public userId: string,
        public customerId: string,
        public last4Digit: string,
        public cardType: string,
        public funding: string,
        public cardId: string,
        public cardHolderName?: string,
        public defaultCard?:boolean
    ) { }
}