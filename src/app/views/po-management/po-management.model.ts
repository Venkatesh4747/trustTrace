import { ICustomFieldDisplay } from '../../shared/components/additional-information/additional-information.model';

export interface IValue {
    id: string;
    value: string;
}

export interface INameId {
    id: string;
    name: string;
}

export interface ICodeNameId {
    code: string;
    id: string;
    name: string;
}

export interface IPOItem {
    requested_quantity: number;
    requested_quantity_measurement_unit_code: string;
    line_item_number: string;
    transactional_trade_item_gtin: ICodeNameId;
    mapping_status: string;
}

export interface IPODetail {
    transaction_id: string;
    division: string;
    product_ref_id: string;
    delivery_date: string;
    facility_ref_id: string;
    seller_gln: INameId;
    id: string;
    status: string;
    searchAfterSort: number[];
    poQty?: string;
    parentPONumber?: string;
    purchase_order_line_items?: IPOItem[];
    custom_fields?: Object;
}

export interface IPO {
    searchResponse: IPODetail[];
    totalCount: number;
    customFieldDisplayList?: ICustomFieldDisplay[];
}
