export class MyAccountProfileModel {
    public emailId: string;
    public profilePic: string;
    public userId: string;
}

export class MyAccountEmailModel {
    public oldEmailId: string;
    public newEmailId: string;
    public userId: string;

}

export class MyAccountPasswordModel {
    public emailId: string;
    public password: string;
    public userId: string;
}

export class MyAccountAddressModel {
    public emailId: string;
    public address: Array<any>;
    public userId: string;
    public zipcode?:string;
}

export class MyAccountDOBModel {
    public emailId: string;
    public dateOfBirth: Date;
    public stringDateOfBirth: string;
    public userId: string;
}

export class MyAccountInterestModel {
    public emailId: string;
    public consumerInterests: Array<any>;
    public userId: string;
}