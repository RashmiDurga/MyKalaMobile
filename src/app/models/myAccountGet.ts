export class MyAccountGetModel {
    userId: string;
    userData = new MyAccountUserData();
    profileInfo = new MyaccountProfileInfo();
}

export class MyAccountUserData {
    emailId: string;
    password: string;
}

export class MyaccountProfileInfo {
    firstName: string;
    lastName: string;
    consumerImagePath: string;
    gender: string;
    dob: Date;
    birthDate: string;
    birthMonth: string;
    birthYear: string;
    address: Array<MyAccountAddress>;
    consumerInterests: Array<MyAccountConsumerInterest>;
    stringDateOfBirth?: string;
}

export class MyAccountConsumerInterest {
    constructor(
        public id: string,
        public consumerInterestImageName: string,
        public consumerInterestImagePath: string,
        public selectImg?: boolean
    ) { }
}

export class MyAccountAddress {
    constructor(
        public addID: string,
        public addressLine1: string,
        public addressLine2: string,
        public city: string,
        public state: string,
        public zipcode: string,
        public addressType: string,
        public defaultAddress?:boolean
    ) { }
}