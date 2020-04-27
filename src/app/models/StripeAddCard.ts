export class StripeAddCardModel {
    public userId: string;
    public customer = new stripeCustomer();
};

export class stripeCustomer {
    public email: string;
    public source: string;
    public customerId?: string;
    public defaultCard?:boolean;
}