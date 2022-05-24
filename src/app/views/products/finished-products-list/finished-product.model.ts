import { ICustomFieldDisplay } from '../../../shared/components/additional-information/additional-information.model';
import { GroupStatus, IValue } from '../template.model';

export interface IProductListTableData {
    header: string[];
    totalCount: number;
    data: IProductList[];
    customFieldDisplayList?: ICustomFieldDisplay[];
}

export interface IProductDetails {
    productNumber: string;
    product: IValue;
    brand: IValue;
    supplier: IValue;
    productLabels: IValue[];
    countryOfPackaging: IValue;
    productionMethod: IValue;
    aktuCode: IValue;
}
export interface IProductList extends IProductDetails {
    productCategory: IValue;
    status: GroupStatus;
    subCategory: IValue;
    taskId: string;
    searchAfterSort?: string[];
    itemNumber: string;
    pluNumber: string;
    customFields?: any;
}

export interface ISupplierDetail {
    country: string;
    name: string;
    id: string;
}

export interface IProductDetail {
    code: string;
    product_type: IValue;
    year: string;
    supplier: ISupplierDetail[];
    name: string;
    season: IValue;
    current_sort: string[];
    id: string;
    certifications?: IValue[];
    searchAfterSort: string[];
    product_labels?: IValue[];
    item_number?: string;
    plu_number?: string;
    brand?: IValue;
    status?: IValue;
    country_of_packaging: IValue;
}

export interface IFinishedProductDetail {
    next_document_id: string;
    previous_document_id: string;
    current_document: IProductDetail;
    lastModifiedBy?: string;
    updateTs?: number;
    showApiScore?: boolean;
    scoreUpdateTs: number;
    scoreType: string;
}
