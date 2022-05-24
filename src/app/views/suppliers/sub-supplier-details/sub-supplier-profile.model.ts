export interface Address {
    addressLine1?: string;
    addressLine2?: string;
    city: string;
    state: string;
    country: string;
    zip?: string;
    latitude?: string;
    longitude?: string;
}
export interface ContactInfo {
    name: string;
    phoneNumber?: string;
    email: string;
}
export interface EmployeeCount {
    men: string;
    women: string;
    others: string;
    total: string;
}
export interface SubSupplierProfile extends ProfileDetails {
    id: string;
    supplierUid: string;
    facilities?: Facility[];
}

export interface Standards {
    id: string;
    uploadedFiles: string[];
    typeId: string;
    body: string;
    expiryDate: number;
    facilityName: string;
}
export interface FacilitiesProfile extends ProfileDetails {
    facilityId: string;
}

export interface ProfileDetails {
    name: string;
    employeeCount?: EmployeeCount;
    associatedSince?: string;
    qualityRating?: number;
    contactInfo?: ContactInfo;
    description?: string;
    valueProcess?: string[];
    materials?: string[];
    logoUrl?: string;
    address?: Address;
    website?: string;
    certifications?: Certification[];
}

export interface Country {
    code: string;
    entityVersion: number;
    id: string;
    name: string;
}

export interface MasterData {
    defaultValue: string;
    id: string;
    value: string;
}

export interface Facility {
    address: Address;
    certificateList: Certification[];
    id: string;
    name: string;
}

export interface Certification {
    body: string;
    companyId: string;
    createdBy: string;
    entityId: string;
    entityType: string;
    entityVersion: number;
    expiryDate: number;
    facilityName: string;
    id: string;
    typeId: string;
    uploadedFiles: string[];
}

export interface Payload {
    filter: unknown;
    pagination: Pagination;
    collapse?: string;
    sort: Sort;
    freeHand?: string;
}

export interface Pagination {
    from: number;
    size: number;
}
export interface Sort {
    sortBy: string;
    sortOrder: string;
}
