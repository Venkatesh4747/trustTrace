export interface Address {
    addressLine1: string;
    addressLine2: string;
    country: string;
    countryCode: string;
    state: string;
    city: string;
    zip: string;
    latitude: string;
    longitude: string;
}
export interface EmployeeCount {
    men: any;
    women: any;
    others: any;
}
export interface FacilityProfile {
    name: string;
    employeeCount: any;
    noOfAssessments: number;
    companyId: string;
    address: Address;
    valueProcess: string[];
    materials: string[];
    standards?: string[];
    certificateList?: any;
    productionCapacity: string;
}

export enum FacilityProfileMode {
    READ,
    EDIT,
    ADD
}

export interface InputPayload {
    mode: FacilityProfileMode;
    facility?: FacilityProfile;
}
