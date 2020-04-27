import { ConsumerAddress } from "./consumer-address";

export class PostInterest {
    public consumerInterests: Array<any>;
    public customerId: string;
    public userId: string;
    public firstName: string;
    public lastName: string;
    public fullName: string;
    public address: string;
    public consumerImagePath: string;
    public phone: string;
    public emailId: string;
    public gender: string;
    public dateOfBirth: string;
    public customerAccountStatus: string;
    public stringDateOfBirth?: string;
};

export class ConsumerInterest {
    constructor(
        public id: string,
        public consumerInterestImageName: string,
        public consumerInterestImagePath: string
    ) { }
}