import { ISupplierListProfileData } from '../../../views/suppliers/supplier.model';

interface IAddSupplierFormControl {
    isRequired: boolean;
    isNotEditable?: boolean;
}

interface ITemplateConfig {
    title: string;
    btnLabel: {
        cancel: string;
        submit: string;
    };
}

export type AddSupplierOrigins = 'Suppliers' | 'T-trace' | 'T-ems' | 'Styles' | 'Raw-materials';
export interface IAddSupplierModelData {
    origin: AddSupplierOrigins;
    formControlConfig: {
        supplierUid: IAddSupplierFormControl;
        companyName: IAddSupplierFormControl;
        email: IAddSupplierFormControl;
        location: IAddSupplierFormControl;
        doNotInvite: {
            visibility: boolean;
            notCheckable?: boolean;
        };
        values: null | ISupplierListProfileData;
    };
    actionType: 'ADD' | 'INVITE' | 'UPDATE';
    templateConfig: ITemplateConfig;
}

export interface IUpdateSupplierInvitePayload {
    supplierUid: string;
    companyId: string;
    supplierId: string;
    newEmailId: string;
}

export class IUpdateSupplierInviteResponse {
    constructor(public status: 'Success' | 'Error', public message: string) {}
}

export interface IAddSupplierResponse {
    status: 'ERROR' | 'SUCCESS';
    data: any;
}

export const getAddSupplierModelDefaultTemplate = (): IAddSupplierModelData =>
    JSON.parse(JSON.stringify(AddSupplierModelDefaultData));

const AddSupplierModelDefaultData: IAddSupplierModelData = {
    origin: 'Suppliers',
    actionType: 'ADD',
    templateConfig: {
        title: 'Add New Supplier',
        btnLabel: {
            cancel: 'Cancel',
            submit: 'Send Invite'
        }
    },
    formControlConfig: {
        supplierUid: {
            isRequired: true
        },
        companyName: {
            isRequired: true
        },
        location: {
            isRequired: true
        },
        email: {
            isRequired: true
        },
        doNotInvite: {
            visibility: true
        },
        values: null
    }
};

export interface IAddSupplierPayload {
    supplierUid: string;
    companyName: string;
    doNotInvite: boolean;
    email: string;
    address: IAddress;
}

export interface IAddress {
    addressLine1?: string;
    addressLine2?: string;
    countryCode?: string;
    zip?: string;
    city?: string;
    latitude?: number;
    longitude?: number;
    country?: string;
    state?: string;
}
