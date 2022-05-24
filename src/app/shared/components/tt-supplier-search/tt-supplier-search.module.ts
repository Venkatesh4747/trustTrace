export interface ITtSupplierSearchModule {
    supplier_verification_status: SupplierVerificationStatus;
    contact_phone_no?: any;
    supplier_association_status: SupplierAssociationStatus;
    searchAfterSort?: any[];
    id?: string;
    supplier_name: string;
    supplier_id: string;
    contact_email?: string;
    supplier_logo?: string;
    supplier_other_info?: any;
}

export interface SupplierVerificationStatus {
    id: number;
    value: string;
}

export interface SupplierAssociationStatus {
    id: number;
    value: string;
}
