export interface IMiddlewareProductList {
    id: string;
    integration_status: string;
    sub_category: string;
    product_number: string;
    plu: string;
    brand_name: string;
    category: string;
    searchAfterSort?: any;
    supplier_name: string;
    name: string;
    data_source: string[];
    error_type: string;
}

export interface IMiddlewareProductIntegrationData {
    totalCount: number;
    searchResponse: IMiddlewareProductList[];
    customFieldDisplayList: unknown;
}

export interface IRerunIntegrationPayload {
    module: string;
    processor: string;
    data: IProductNumber;
    company_id: string;
}

export interface IProductNumber {
    product_numbers: string[];
}

export interface IIntegrationSummaryDetail {
    active: string;
    brand_name: string;
    category: string;
    country_of_packaging: string;
    plu: string;
    product_labels: string;
    product_name: string;
    product_number: string;
    regional: string;
    segment_name: string;
    size_desc: string;
    sub_category: string;
    sub_segment_name: string;
    supplier_name: string;
    t_date: string;
    team: string;
}

export interface IDownloadFileRequestPayload {
    fileId: string;
}
