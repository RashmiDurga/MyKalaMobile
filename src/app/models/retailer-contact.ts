import { PostalAddress } from './retailer-business-adress';

export class RetailerContact extends PostalAddress {
    public contactPersonId: string;
    public retailerId: string;
    public contactType: string;
    public status: boolean | null = true;
    constructor(obj?: any) {
        super(obj);
        if (obj) {
            this.retailerId = obj.retailerId;
            this.contactPersonId = obj.contactPersonId;
            this.contactType = obj.addressType;
            this.status = obj.status;
        } else {
            this.addressType = "Personal contact";
        }
    }
}
