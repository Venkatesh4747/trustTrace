export interface IIdValue {
    id: string;
    value: string;
}

export interface IValue {
    value: string;
}

export interface IValueExists {
    value: string;
    isExist: boolean;
}
export interface IKeyValue {
    key: string;
    value: string;
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

export interface IEvidenceDetail {
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

export interface IEvidenceTableDetail {
    id: string;
    file_name: string;
    tc_reference_id: string;
    cert_type: string;
    cert_std: IIdValue;
    consignee: IIdValue;
    supplier: IIdValue;
    searchAfterSort: string[];
    lot_numbers: string[];
    facility: IIdValue;
    invoice_number?: string;
    net_weight: string;
    product_name: string;
    cert_id: string;
    creation_date?: string;
    comments?: string;
    workflow_status?: string;
}

export interface IEvidence {
    searchResponse: IEvidenceTableDetail[];
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

export enum ApprovalStatuses {
    PENDING = 'PENDING'
}

export enum ApprovalReasons {
    TC_EXTRACTION_FAILURE = 'TC extraction failure',
    PARTIAL_DATA_EXTRACTED = 'Only partial data extracted',
    WRONG_DATA_EXTRACTED = 'Wrong data extracted',
    COMBINED_INFO_ON_TC = 'Combined information on TC',
    QUANTITY_FOR_ADIDAS = 'Quantity for adidas'
}

export interface IWorkflowStatusComments {
    selectedComments: string[];
    otherComments: string;
}

export interface ICountry {
    country: any[];
}
export interface IProductInfo {
    productName: string;
    tradeName: string;
    lotNumbers: string;
    grossWeight: string;
    netWeight: string;
    labelGrade: string;
    packedIn: string;
    supplierForTraderTC: string;
    yarnCOO: ICountry;
    cottonLintCOO: ICountry;
    productItem: any;
}

export interface IExtractedDetail {
    referenceNumber: string;
    bodyIssuingCertificate: string;
    licenseCode: string;
    sellerOfProduct: IValue;
    facility: any;
    countryOfDispatch: string;
    buyerOfProduct: IValueExists;
    consigneeOfProduct: IValueExists;
    inspectionBody: string;
    lastProcessorOfProducts: string;
    countryOfConsignee: string;
    productAndShipmentInformation: string;
    grossWeight: string;
    netWeight: string;
    commercialWeight: string;
    placeAndDateOfIssue: string;
    certTypeId: string;
    isTrader?: boolean;
    productInfo: IProductInfo[];
    isScExpired: boolean;
}

export interface IExtractedData {
    id: string;
    updateTs: string;
    createTs: string;
    createdBy: string;
    lastModifiedBy: string;
    certType: string;
    companyId: string;
    tcExtractedData: IExtractedDetail;
}

export interface IEvidenceSubmitData {
    certId: string;
    certType: string;
    ttDocumentId: string;
    companyId: string;
    brandId: string;
    recordingFacilityId: string;
    tierId: string;
    creationDate: Date;
    tcExtractedData: IExtractedDetail;
    workflowStatus?: string;
    comments?: IWorkflowStatusComments;
    notifyTT?: boolean;
    systemMessages: string[];
}

export interface IInvoiceInfo {
    invoiceNo: string;
    invoiceDate: Date;
}

export interface INotificationDetail {
    isValid: boolean;
    message: string;
}

export const TierKeys = {
    tier1: 'tr_tier1',
    tier2: 'tr_tier2'
};
