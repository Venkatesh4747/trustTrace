import { IPagination } from '../user/brand-user-management/users/user.model';

export class IGeoLocation {
    latitude: number;
    longitude: number;
}

export interface IAddress extends IGeoLocation {
    addressLine1?: string;
    addressLine2?: string;
    country: string;
    countryCode?: string;
    state: string;
    city: string;
    zip?: string;
    fullText?: string;
}

export interface IFacilityData extends IGeoLocation {
    id: string;
    icon?: string;
}

export interface ISupplierData extends IGeoLocation {
    company_id: string;
    supplier_id: string;
    map_facility_info?: IFacilityData[];
}

export interface ICompanyData extends ICompanyCommon, IGeoLocation {
    map_facility_info: IFacilityData[];
    suppliers: ISupplierData[];
}

export interface ICompanyCommon {
    company_id: string;
    logoUrl?: string;
}

export interface IFacilityCommon {
    facilityId: string;
    name?: string;
    address?: IAddress;
    certificateList?: object[];
}

export interface ISelectedFacility extends IFacilityCommon {
    logoUrl?: string;
    facilityScore?: object;
}

export interface ISelectedCompanyFacility extends IFacilityCommon {
    valueProcess?: string[];
    materials?: string[];
}

export interface IContactInfo {
    name?: string;
    email?: string;
    phoneNumber?: string;
}

export interface ISelectedCompany extends ICompanyCommon {
    companyName?: string;
    description?: string;
    contactInfo?: IContactInfo;
    facilities?: ISelectedCompanyFacility[];
    companyAddress?: IAddress;
}

export interface ISupplierLinkEntry {
    from: IGeoLocation;
    to: IGeoLocation;
}

export interface IDashboardContent {
    filter: object;
    ttDashboardResponse: ICompanyData;
}

export interface IGetAllFacilitiesResponse {
    dashboardContent: IDashboardContent;
    masterData: object;
}

export interface ISearchPayload {
    filter: unknown;
    pagination: IPagination;
    collapse: string;
}
