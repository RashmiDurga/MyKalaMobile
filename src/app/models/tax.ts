export class AvalaraTaxModel {
    public deliveryLocation: string;
    public shipToAddress: shippingAddress;
    public customerCode: string;
    public date: string;
    public itemTax = new ItemsTaxModel();
}

export class ItemsTaxModel {

}

export class shippingAddress {
    public addressLine1: string;
    public addressLine2: string;
    public city: string;
    public state: string;
    public zipcode: string;
}

export class ItemsTaxList {
    constructor(
        public number: number,
        public quantity: number,
        public amount: number,
        public itemCode: string,
        public taxCode: string,
        public description: string,
        public orderNumber: string,
        public isTaxNexus: string,
        public shippingProfileId?: string,
        public shippingOriginAddress?: shippingAddress
    ) { }
}