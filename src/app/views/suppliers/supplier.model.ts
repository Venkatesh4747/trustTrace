import { SupplierVerificationStatus } from '../../shared/components/supplier-list-form-element/supplier-list-form-element.model';

export type tabs = null | 'un_invited_suppliers' | 'sub_suppliers' | 'supplier_conflicts' | 'terminated_suppliers';

export const tabNames = {
    SUPPLIERS: 'null',
    UNINVITED_SUPPLIERS: 'un_invited_suppliers',
    SUB_SUPPLIERS: 'sub_suppliers',
    SUPPLIER_CONFLICTS: 'supplier_conflicts'
};
export interface ISupplierListProfileData extends ISubSupplierProfileData {
    style_count: number;
    raw_material_count: number;
    product_count: number;
    ingredient_count: number;
}

export interface ISupplierStatistics {
    ttrace: number;
    tems: number;
    transaction: number;
    assessmentCount: number;
}

export interface ISupplierListEvents {
    eventType: string;
    data: any;
}

export interface ISupplierConflictsContactInfo {
    email: string;
}

export interface ISupplierConflictsAddress {
    city: string;
    state: string;
    country: string;
    latitude?: string;
    longitude?: string;
}
export interface ISupplierConflicts {
    name: string;
    contactInfo: ISupplierConflictsContactInfo;
    address: ISupplierConflictsAddress;
}
export interface ISubSupplierProfileData {
    id: string;
    supplier_uid: string;
    supplier_logo: string | null;
    name: string;
    contact_email?: string;
    contact_phone_no?: string;
    status?: SupplierVerificationStatus;
    supplier_country: string;
    supplier_state: string;
    supplier_city: string;
    facility_count: number;
    grade: string;
    supplier_id: string;
    company_id: string;
    score: string;
    grade_score: string;
    is_sub_supplier?: boolean;
    sub_supplier_status?: number;
    reference_id?: string;
}
