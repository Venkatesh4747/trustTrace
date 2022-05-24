export interface Address {
    addressLine1?: string;
    addressLine2?: string;
    city?: string;
    state?: string;
    country?: string;
    zip?: string;
    latitude?: string;
    longitude?: string;
}
export interface ContactInfo {
    name?: string;
    phoneNumber?: string;
    email?: string;
}
export interface EmployeeCount {
    men?: string;
    women?: string;
    others?: string;
    total?: string;
}
export interface ISupplierProfileUpdate {
    contactInfo?: ContactInfo;
    description?: string;
}

export interface SupplierProfile {
    id: string;
    supplierUid: string;
    employeeCount?: EmployeeCount;
    associatedSince?: string;
    qualityRating?: string;
    contactInfo?: ContactInfo;
    miscellaneous?: {};
    description?: string;
    valueProcess?: string[];
    materials?: string[];
    name?: string;
    logoUrl?: string;
    address?: Address;
    primaryDomain?: string;
    website?: string;
    certifications?: string[];
    facilities?: any;
    todoTasks?: any;
    articlesAssociated?: string[];
    referenceId?: string;
}
