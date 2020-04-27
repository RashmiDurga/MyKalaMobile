import { Pagination } from './pagination';

export class Inquiry {
  public supportId: string;
  public customerId: string;
  public customerName: string;
  public orderId: string;
  public orderDate: string;
  public productName: string;
  public productCost: number;
  public productsCount: number;
  public inquiryType: string;
  // public inquiryTypeOther: string;
  public otherTypeDesc: string;
  public inquiryDate: string;
  public inquiryCategory: string;
  // public inquiryCategoryOther: string;
  public otherCategoryDesc: string;
  public description: string;
  public priority: string;
  public assignedTo: string;
  public inquiryStatus: string;
  public notes: string[];
  public resolvedInquiryStatus: string;
  public resolutionDate: string;
  public resolutionType: string;
  public resolutionDescription: string;
  public retailerId: string;
  public retailerName: string;
  public consumerId: string;
  public createdDate: string;
  public modifiedDate: string;
  public resolutionNotes: string[];
  public isCollapsed = true;
  constructor(obj?: any) {
    if (obj) {
      this.supportId = obj.supportId;
      this.customerId = obj.customerId;
      this.customerName = obj.customerName;
      this.orderId = obj.orderId;
      this.orderDate = obj.orderDate;
      this.productName = obj.productName;
      this.productCost = obj.productCost;
      this.inquiryType = obj.inquiryType;
      this.inquiryDate = obj.inquiryDate;
      this.inquiryCategory = obj.inquiryCategory;
      this.description = obj.description;
      this.priority = obj.priority;
      this.assignedTo = obj.assignedTo;
      this.inquiryStatus = obj.inquiryStatus;
      this.notes = obj.notes;
      this.resolvedInquiryStatus = obj.resolvedInquiryStatus;
      this.resolutionDate = obj.resolutionDate;
      this.resolutionType = obj.resolutionType;
      this.resolutionDescription = obj.resolutionDescription;
      this.resolutionNotes = obj.resolutionNotes;
      this.retailerId = obj.retailerId;
      this.retailerName = obj.retailerName;
      this.consumerId = obj.consumerId;
      this.createdDate = obj.createdDate;
      this.modifiedDate = obj.modifiedDate;
    }
  }
}
export class Inquirys extends Pagination {
  constructor(obj?: any) {
    if (obj) {
      super(obj);
      this.content = obj.content.map(p => new Inquiry(p));
    }
  }
  public content: Inquiry[];
}

export const InquiryTypes = [
  { name: 'MemberQuestion', value: 'Member Question', categories: ['Product', 'Order', 'Account', 'Shipping', 'Using Kala', 'Other'] },
  { name: 'OrderIssue', value: 'Order Issue', categories: ['Product Not Received', 'Product Damaged', 'Payment Issue', 'Wrong Product Received', 'Didn\'t Receive Order Confirmation', 'Didn\t Receive Shipping Confirmation', 'Other'] },
  { name: 'Return', value: 'Return', categories: ['Product Defect', 'Wrong Size', 'Wrong Color', 'Wrong Style', 'Don\'t Like the Product', 'Personal Reasons', 'Other'] },
  { name: 'Exchange', value: 'Exchange', categories: ['Product Defect', 'Wrong Size', 'Wrong Color', 'Wrong Style', 'Don\'t Like the Product', 'Personal Reasons', 'Other'] },
  { name: 'Other', value: 'Other', categories: [] },
];
export const InquiryStatuses = ['Unresolved', 'Resolved'];
export const InquiryResolvedOutcomes = ['Satisfied', 'Unsatisfied'];
export const InquiryResolutions = ['Question Answered', 'Product Exchange', 'Product Return', 'Refund - Fraud', 'Refund - Other', 'Referred to Seller', 'No Issue Found', 'Other'];
export const InquiryPrioritys = ['Low', 'Medium', 'High'];
export const InquiryTypeOther = 'Other';
export const InquiryResolvedStatus = InquiryStatuses[1];
