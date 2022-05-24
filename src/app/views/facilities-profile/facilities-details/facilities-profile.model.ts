export interface Address {
    addressLine1?: string;
    addressLine2?: string;
    city?: string;
    state?: string;
    country?: string;
    countryCode?: string;
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
export interface FacilitiesProfile {
    facilityId: string;
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
    noOfAssessments: number;
    productionCapacity: string;
    referenceId?: string;
}
