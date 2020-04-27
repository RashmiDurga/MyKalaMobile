export class ConsumerSupportModal {
    public customerId: string;
    public customerName: string;
    public customerEmail: string;
    public orderId: string;
    public orderDate: Date;
    public productName: string;
    public productCost: string;
    public message: Array<ConsumerSupportConversations>;
}

export class ConsumerSupportConversations {
    constructor(
        public from: string,
        public fromText: string,
        public to: string,
        public toText: string,
    ) { }
}