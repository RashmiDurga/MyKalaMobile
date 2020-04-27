import { ConsumerAddress } from "./consumer-address";

export class ConsumerProfileInfo {
    public userId: string;
    public emailId: string;
    public firstName: string;
    public lastName: string;
    public fullName: string;
    public consumerImagePath: string;
    public gender: string;
    public dateOfBirth: any;
    public address: Array<ConsumerAddress>;
    public stringDateOfBirth?: string;
}
