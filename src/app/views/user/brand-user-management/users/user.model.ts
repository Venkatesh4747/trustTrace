export interface Payload {
    status: string;
    message: string;
    data: User[];
}

export interface User {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    status: string;
    enableEmailNotification: boolean;
    primaryContact: boolean;
    groups: Group[];
    // kindly remove explicit delectation of division and lolocation from adidas
    division: string[];
    loLocation: string[];
    facilitiesAssociated: FacilitiesAssociated[];
    // due to time constrain this type made as any need to fix this after the OU release comment is added in that respective ticket
    // https://trustrace.atlassian.net/browse/TRA-504?focusedCommentId=14656  link for comment
    ouAttributeData: any;
}

export interface FacilitiesAssociated {
    id: string;
    name: string;
    address: Address;
}

export interface Address {
    addressLine1: string;
    addressLine2: string;
    city: string;
    state: string;
    country: string;
    countryCode: string;
    zip: string;
    latitude: number;
    longitude: number;
}

export interface Group {
    id: string;
    name: string;
}

export interface Ou {
    id: string;
    value: string[];
}
export interface UserConfig {
    facilities: EntityMicroView[];
    groups: EntityMicroView[];
    ouAttribute: IOU[];
}

export interface EntityMicroView {
    id: string;
    name: string;
    isSelected?: boolean;
}

export interface ISearchPayload {
    module: string;
    filter: any;
    sort: ISort;
    pagination: IPagination;
}

export interface ISort {
    sortBy: 'create_ts' | 'status';
    sortOrder: 'desc' | 'asc';
}

export interface IPagination {
    from: number;
    size: number;
}

export enum Status {
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE',
    DELETED = 'DELETED'
}

export enum CompanyType {
    SUPPLIER = 'SUPPLIER',
    BRAND = 'BRAND',
    RETAILER = 'RETAILER',
    BRAND_SUPP = 'BRAND_SUPP',
    FASHION_BRAND_SUPP = 'FASHION_BRAND_SUPP',
    FOOD_SUPPLIER = 'FOOD_SUPPLIER'
}

export enum Subscription {
    SUPPLIER = 'SUPPLIER',
    BRAND = 'BRAND'
}
export interface IUserProps {
    companyId: string;
    email: string;
    companyName: string;
    companyType: CompanyType;
    status: Status;
    subscriptionType: Subscription;
}

export interface IOU {
    OuAttribute: string;
    id: string;
    value: EntityMicroView[];
}

export interface IOUResp {
    ouAttributeId: string;
    ouAttributeValues: string[];
}
