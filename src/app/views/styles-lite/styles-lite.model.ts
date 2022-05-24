export interface IValue {
    id: string;
    value: string;
}

export interface IStylesDetail {
    division: string;
    product_type: IValue;
    code: string;
    name: string;
    searchAfterSort: number[];
    id: string;
}

export interface ICustomFieldDisplay {
    name: string;
    id: string;
    order: number;
}

export interface IStyles {
    searchResponse: IStylesDetail[];
    totalCount: number;
    customFieldDisplayList?: ICustomFieldDisplay[];
}
