export interface IIdValue {
    id: string;
    value: string;
}

export interface IValue {
    value: string;
}

export interface IKeyValue {
    key: string;
    value: string;
}

export interface IKeyValueCode {
    key: string;
    value: string;
    code: string;
}

export interface IWithMatchedData {
    id?: string;
    value: string;
    matchedData: IKeyValueCode;
}

export interface IIdCodeName {
    id: string;
    code: string;
    name: string;
}

export interface IQuantity {
    value: number;
    unit_id: string;
    units_value: string;
}

export interface IScopeCertificateDetail {
    id: string;
    company_id: string;
    tx_type: string;
    lot_id: string;
    tx_date: string;
    product_id: string;
    product_type: IIdValue;
    product_number: string;
    product_name: string;
    quantity: IQuantity;
    customer?: IIdValue;
    supplier?: IIdValue;
    facility: IIdValue;
    mode: string;
    po_number: string;
    biz_transaction_id: string;
    status: string;
    create_ts: string;
    update_ts: string;
}

export interface IScopeCertificateTableDetail {
    id: string;
    file_name: string;
    tc_reference_id: string;
    cert_type: IIdValue;
    consignee: IIdValue;
    supplier: IIdValue;
    searchAfterSort: string[];
    lot_numbers: string[];
    facility: IIdValue;
    invoice_number?: string;
    net_weight: string;
    product_name: string;
    cert_id: string;
}

export interface IScopeCertificate {
    searchResponse: IScopeCertificateTableDetail[];
    totalCount: number;
}

export enum ExtractionStatuses {
    EXTRACTING = 10,
    COMPLETED = 20,
    FAILED = 30,
    NOT_SUPPORTED = 40,
    PARTIALLY_COMPLETED = 50
}

export enum ExtractionStatusText {
    EXTRACTING = 'Extraction in progress (can take up to a minute)...',
    COMPLETED = 'Extraction completed',
    FAILED = 'Extraction failed',
    NOT_SUPPORTED = 'Extraction for this certificate type is not supported, Please enter the data manually',
    PARTIALLY_COMPLETED = 'Extraction partially completed'
}
export interface IFacilityInfo {
    nameOfUnit: string;
    address: string;
    processes: string;
    matchedData: IKeyValueCode;
    doCreate: boolean;
}

export interface ISupplierInfo {
    id: string;
    value: string;
    matchedData: IKeyValueCode;
}

export interface IExtractedDetail {
    certTypeId: string;
    bodyIssuingCertificate: string;
    referenceNumber: string;
    sellerOfProduct: IWithMatchedData;
    certStandard: string;
    validUntil: string;
    validFrom: string;
    placeAndDateOfIssue: string;
    facilityInfo: IFacilityInfo[];
}

export interface IExtractedData {
    id: string;
    certType: string;
    companyId: string;
    scExtractedData: IExtractedDetail;
    status: string;
}

export interface IWorkflowComments {
    selectedComments: string[];
    otherComments: string;
}
export interface IScopeCertificateSubmitData {
    certId: string;
    ttDocumentId: string;
    certType: string;
    companyId: string;
    brandId: string;
    scExtractedData: IExtractedDetail;
    status: string;
    workflowStatus?: string;
    comments?: IWorkflowComments;
    notifyTT: boolean;
    creationDate: Date;
    ttWorkflowId?: string;
}

export interface IScopeCertificateDetailView {
    certificateNumber: string;
    certificateStandard: string;
    validFrom: string;
    validUntil: string;
    certificateBody: string;
    supplierInfo: ISupplierInfo;
    facilityInfo: IFacilityInfo[];
}

export enum ApprovalStatuses {
    APPROVED = 'APPROVED',
    PENDING = 'PENDING'
}
