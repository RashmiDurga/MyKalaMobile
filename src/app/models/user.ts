export class User {
  public firstName: string;
  public lastName: string;
  constructor(public email?: string, public username?: string, public password?: string) { }
}

export class BasicAuth {
  public grant_type = 'password';
  public client_id = 'mykala';
  private password = 'secret';
  public encoded: string;
  constructor() {
    this.encoded = btoa(`${this.client_id}:${this.password}`);
  }

}

export class UserProfile {

  public userId: string;
  public password: string;
  public firstName: string;
  public lastName: string;
  public emailId: string;
  public phone: string;
  public fullName: string;
  public roleName: Array<string>;
  public role: string;
  public userCreateStatus: boolean;
  public user_status: string;
  public show: boolean;

  constructor(obj?: any) {
    this.roleName = ['admin'];
    if (obj) {
      this.userId = obj.userId;
      this.password = obj.password;
      this.firstName = obj.firstName;
      this.lastName = obj.lastName;
      this.fullName = obj.fullName;
      this.emailId = obj.emailId;
      this.phone = obj.phone;
      this.roleName = obj.roleName;
      this.role = obj.role;
      this.userCreateStatus = obj.userCreateStatus;
      this.user_status = obj.user_status;
      this.show = false;
    }
  }
  get username(): string {
    return this.firstName + ' ' + this.lastName;
  }
}
