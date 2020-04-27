export class OrderListing {
    public retailerId: string;
    public retailerName: string;
    public differentShippingMethod: boolean;
    public orderItems = new Array<Orders>()
    public isSMSelected?: boolean;
}

export class Orders {
    constructor(
        public inStock: number,
        public price: number,
        public productDescription: string,
        public productId: string,
        public productImage: string,
        public productName: string,
        public quantity: number,
        public shipProfileId: string,
        public taxCost: number,
        public taxCode: string,
        public isSMSelected?: boolean
    ) { }
}
export class OrderCheckout{
    locationName:string;
    shippingProfileId : string;
    productDimention = Array<ProduDimention>();
}
export class ProduDimention{
    productQuantity:number;
    productWeight:number;
    productPrice : number;
    productLength : number;
    productHeight : number;
    productWidth : number;
}