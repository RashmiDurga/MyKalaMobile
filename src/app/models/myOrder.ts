export class MyOrders {
    public customerOrderStatus: string;
    public customerId: string;
    public userId: string;
    public source: string;
    public paymentSource: string;
    public paymentFunding: string;
    public last4Digits: string;
    public customerName: string;
    public address = new Address();
    public purchasedDate: Date;
    public orderItems = Array<OrderItems>();
    public purchasedPrice: number;
    public totalTaxCost: number;
    public totalShipCost: number;
    public orderId: string;
    public payment = new Payment();
    public leaveReview?: boolean;
    public contactSupport?: boolean;
    public cancelOrder?: boolean;
    public trackOrder?: boolean;
    public consumerEmail?: string;
    public reviewMailSent?:boolean;
    public sellerOrderMail?:string;
    public deliveryDate?:string;
    public trackUrl?:string;
    public reviewAlertSent?:string;
    public cardId?:string;
    public firstName?:string;
    public lastName?:string;
    public catureAttempt?:string;
    constructor(obj?: any) {
        if (obj) {
            this.customerOrderStatus = obj.customerOrderStatus;
            this.customerId = obj.customerId;
            this.userId = obj.userId;
            this.source = obj.source;
            this.paymentSource = obj.paymentSource;
            this.paymentFunding = obj.paymentFunding;
            this.last4Digits = obj.last4Digits;
            this.customerName = obj.customerName;
            this.address = obj.address;
            this.purchasedDate = obj.purchasedDate;
            this.orderItems = new Array<OrderItems>(); // obj.orderItems;
            if (obj.orderItems) {
                this.orderItems = obj.orderItems.map(p => new OrderItems(p));
            }
            this.purchasedPrice = obj.purchasedPrice;
            this.totalTaxCost = obj.totalTaxCost;
            this.totalShipCost = obj.totalShipCost;
            this.orderId = obj.orderId;
            this.payment = obj.payment;
            this.leaveReview = obj.leaveReview;
            this.contactSupport = obj.contactSupport;
            this.cancelOrder = obj.cancelOrder;
            this.trackOrder = obj.trackOrder;
            this.consumerEmail = obj.consumerEmail;
            this.reviewMailSent= obj.reviewMailSent;
            this.sellerOrderMail = obj.sellerOrderMail;
            this.deliveryDate = obj.deliveryDate;
            this.trackUrl = obj.trackUrl;
            this.reviewAlertSent = obj.reviewAlertSent;
            this.cardId = obj.cardId;
            this.firstName = obj.firstName;
            this.lastName = obj.lastName;
            this.catureAttempt = obj.catureAttempt;
        }
        this.refineMyorderModal();
    }
    refineMyorderModal() {
        for (let j = 0; j < this.orderItems.length; j++) {
            const order = this.orderItems[j];
            if (order.productItemStatus === 'ORDERPROCESSED') {
                this.orderItems[j].productItemStatus = 'ORDER PROCESSED';
                this.orderItems[j].leaveReview = true;
                this.orderItems[j].cancelOrder = true;
                this.orderItems[j].contactSupport = false;
                this.orderItems[j].trackOrder = true;
                this.orderItems[j].showCustomerSupport = false;
            } else if (order.productItemStatus === 'ORDERSHIPPED') {
                this.orderItems[j].productItemStatus = 'ORDER SHIPPED';
                this.orderItems[j].leaveReview = true;
                this.orderItems[j].cancelOrder = true;
                this.orderItems[j].contactSupport = false;
                this.orderItems[j].trackOrder = false;
                this.orderItems[j].showCustomerSupport = false;
            } else if (order.productItemStatus === 'ORDERCANCELLED') {
                this.orderItems[j].productItemStatus = 'ORDER CANCELLED';
                this.orderItems[j].leaveReview = true;
                this.orderItems[j].cancelOrder = true;
                this.orderItems[j].contactSupport = true;
                this.orderItems[j].trackOrder = true;
                this.orderItems[j].showCustomerSupport = false;
            } else if (order.productItemStatus === 'ORDERDELIVERED') {
                this.orderItems[j].productItemStatus = 'ORDER DELIVERED';
                this.orderItems[j].leaveReview = false;
                this.orderItems[j].cancelOrder = true;
                this.orderItems[j].contactSupport = false;
                this.orderItems[j].trackOrder = true;
                this.orderItems[j].showCustomerSupport = false;
            }else if (order.productItemStatus === 'ACKNOWLEDGEDBYSELLER') {
                this.orderItems[j].productItemStatus = 'ORDER PROCESSED';
                this.orderItems[j].leaveReview = true;
                this.orderItems[j].cancelOrder = true;
                this.orderItems[j].contactSupport = false;
                this.orderItems[j].trackOrder = true;
                this.orderItems[j].showCustomerSupport = false;
            } else {
                //Order Pending
                this.orderItems[j].productItemStatus = 'ORDER PENDING';
                this.orderItems[j].leaveReview = true;
                this.orderItems[j].cancelOrder = false;
                this.orderItems[j].contactSupport = true;
                this.orderItems[j].trackOrder = true;
                this.orderItems[j].showCustomerSupport = false;
            }
        }
    }
}

export class OrderItems {
    public productId: string;
    public productName: string;
    public retailerName: string;
    public retailerId: string;
    public productDescription: string;
    public productImage: string;
    public productQuantity: number;
    public productPrice: number;
    public productTaxCost: number;
    public shippingCost: number;
    public totalProductPrice: number;
    public deliveryMethod: string;
    public productItemStatus: string;
    public productUPCCode: number;
    public productSKUCode: string;
    public shipTrackingId: string;
    public carrier: string;
    public orderDeliveredDate: Date;
    public productHierarchy: string;
    public orderFrom: string;
    public productAttributes: string;
    public leaveReview?: boolean;
    public contactSupport?: boolean;
    public cancelOrder?: boolean;
    public trackOrder?: boolean;
    public showCustomerSupport?: boolean;
    public showToggleButtons?: boolean;



    
    public retailerIntegrationMethod: string;
   
    public deliveryDate?:string;
    public orderCancelledDate?:Date;
    public orderProcessedDate?:Date;
    public orderShippedDate?:Date;
    public productReviewed?: boolean;
    public shipmentRead?:boolean;
    public reviewRead?:boolean;
    public reviewMailSent?:boolean;
    public stringShipmentDate?:Date;
    public channelAdviosorRetailerSku?:string;
    public channelAdviosorProductSku?:string;
    public message?:string;
    public totalCanceledAmount: number;
    public totalQuantityCanceled: number;
    public updatedShippingCost : number;
    public updatedTaxCost :number;
    public refundedStatus : boolean;
    public shipmentClass : string;
    public leadTimeToShip : number;
    constructor(obj?: any) {
        if (obj) {
            this.productId = obj.productId;
            this.productName = obj.productName;
            this.retailerName = obj.retailerName;
            this.retailerId = obj.retailerId;
            this.productDescription = obj.productDescription;
            this.productImage = obj.productImage;
            this.productQuantity = obj.productQuantity;
            this.productPrice = obj.productPrice;
            this.productTaxCost = obj.productTaxCost;
            this.shippingCost = obj.shippingCost;
            this.totalProductPrice = obj.totalProductPrice;
            this.deliveryMethod = obj.deliveryMethod;
            this.productItemStatus = obj.productItemStatus;
            this.productUPCCode = obj.productUPCCode;
            this.productSKUCode = obj.productSKUCode;
            this.shipTrackingId = obj.shipTrackingId;
            this.carrier = obj.carrier;
            this.orderDeliveredDate = obj.orderDeliveredDate;
            this.productHierarchy = obj.productHierarchy;
            this.orderFrom = obj.orderFrom;
            this.productAttributes = obj.productAttributes;
            this.leaveReview = obj.leaveReview;
            this.contactSupport = obj.contactSupport;
            this.cancelOrder = obj.cancelOrder;
            this.trackOrder = obj.trackOrder;
            this.showCustomerSupport = obj.showCustomerSupport;
            this.showToggleButtons = obj.showToggleButtons;
            this.retailerIntegrationMethod = obj.retailerIntegrationMethod;
            this.orderCancelledDate  = obj.orderCancelledDate;
            this.orderProcessedDate  = obj.orderProcessedDate;
            this.orderShippedDate  = obj.orderShippedDate;
            this.productReviewed = obj.productReviewed;
            this.shipmentRead = obj.shipmentRead;
            this.reviewRead = obj.reviewRead;
            this.reviewMailSent = obj.reviewMailSent;
            this.stringShipmentDate = obj.stringShipmentDate;
            this.channelAdviosorRetailerSku = obj.channelAdviosorRetailerSku;
            this.channelAdviosorProductSku = obj.channelAdviosorProductSku;
            this.message = obj.message;
            this.totalCanceledAmount = obj.totalCanceledAmount;
            this.totalQuantityCanceled = obj.totalQuantityCanceled;
            this.updatedShippingCost = obj.updatedShippingCost;
            this.updatedTaxCost = obj.updatedTaxCost;
            this.refundedStatus = obj.refundedStatus;
            this.shipmentClass = obj.shipmentClass;
            this.leadTimeToShip = parseInt(obj.leadTimeToShip);
        }
    }
}

export class Payment {
    public paymentAmount: number;
    public paymentDate: Date;
    public paymentNumber: string;
    public paymentStatus: string;
    public transactionNumber: string;
}

export class Address {
    public addID: string;
    public addressLineOne: string;
    public addressLineTwo: string;
    public city: string;
    public state: string;
    public zipcode: string;
    public addressType: string
}