export interface ISupplierListFormOptions {
    brandContextId?: string;
    controlType: controlType;
    isRequired?: boolean;
    isDisabled?: boolean;
    label?: string;
    floatLabel?: floatValues;
    placeholder?: string;
    requiredSymbolRemove?: boolean;
    errorMessage?: string;
    acceptOnlyListedValues?: boolean;
    valueChangesFire?: valueChangesFire;
    listOnlyThisSuppliers: SupplierListTypes[];
    selectedItem?: ISupplier | ISupplier[] | any;
    showCurrentCompany?: boolean;
    addSupplierOption?: boolean;
    tooltipPosition?: positions;
    fullWidth?: boolean;
    customClass?: string;
}

export type floatValues = 'always' | 'auto' | 'never';
export type positions = 'above' | 'below' | 'left' | 'right' | 'before' | 'after';
export type controlType = 'single-select' | 'chip-select';
export type valueChangesFire = 'from-input' | 'from-option' | 'both';

export enum SupplierListTypes {
    not_invited_supplier = 10,
    unAccepted_supplier = 15,
    accepted_supplier = 20
}

export interface IGetSupplierListPayload {
    filter: {
        SupplierAssociationStatus: SupplierListTypes[];
    };
    brandContextId?: string;
    sort: {
        sortBy: 'create_ts'; // todo
        sortOrder: sortOption;
    };
    pagination: {
        from: number;
        size: number;
    };
}

type sortOption = 'asc' | 'desc';

export interface ISupplierList {
    searchResponse: ISupplier[];
    totalCount: number;
}

export interface ISupplier {
    supplier_verification_status: SupplierVerificationStatus;
    supplier_association_status: SupplierVerificationStatus;
    id: string;
    supplier_name: string;
    supplier_id: string;
    supplier_logo: string;
    contact_phone_no?: string;
    contact_email?: string;
}

export interface SupplierVerificationStatus {
    id: SupplierListTypes;
    value: string;
}
