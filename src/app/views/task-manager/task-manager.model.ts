import { IFacilityInfo, IKeyValueCode } from '../scope-certificates/scope-certificates.model';

export type tabs = null | 'completed_tasks';

export const subModules = ['TASK', 'TT_TASK_HISTORY'];

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

export interface IKeyCodeValue {
    key: string;
    code: string;
    value: string;
}

export interface ITierValue {
    key: string;
    value: string;
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
    requestedDate?: string;
    comments?: string;
    status?: string;
}

export interface IEvidence {
    searchResponse: IEvidenceTableDetail[];
    totalCount: number;
}

export interface ICountry {
    country: any[];
}

export enum ExtractionStatuses {
    EXTRACTING = 10,
    COMPLETED = 20,
    FAILED = 30,
    NOT_SUPPORTED = 40
}

export enum ApprovalStatuses {
    PENDING = 'PENDING',
    REJECTED = 'REJECTED',
    APPROVED = 'APPROVED'
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

export interface IWorkflowComments {
    selectedComments: string[];
    otherComments: string;
    resolutionDate: string;
}

export interface ICompanyFacility {
    certType: string;
    validUntil: string;
    source: string;
    facility: IKeyCodeValue;
}
export interface IProductInfo {
    productName: string;
    tradeName: string;
    lotNumbers: string;
    grossWeight: string;
    netWeight: string;
    labelGrade: string;
    packedIn: string;
    materialComposition?: string;
    productItem: IKeyValue;
    supplierForTraderTC: string;
    yarnCOO: ICountry;
    cottonLintCOO: ICountry;
    productItemMaterialComposition: string;
}

export interface IExtractedDetail {
    referenceNumber: string;
    bodyIssuingCertificate: string;
    licenseCode: string;
    sellerOfProduct: IValue;
    facility: IKeyValue;
    countryOfDispatch: string;
    buyerOfProduct: IValue;
    consigneeOfProduct: IValue;
    inspectionBody: string;
    lastProcessorOfProducts: string;
    countryOfConsignee: string;
    productAndShipmentInformation: string;
    grossWeight: string;
    netWeight: string;
    commercialWeight: string;
    placeAndDateOfIssue: string;
    certTypeId: string;
    productInfo: IProductInfo[];
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
    creationDate: Date;
    tcExtractedData: IExtractedDetail;
    workflowStatus?: string;
    comments?: IWorkflowStatusComments;
    notifyTT?: boolean;
}

export interface IInvoiceInfo {
    invoiceNo: string;
    invoiceDate: Date;
}

export interface ITaskExtractedData {
    certTypeId: string;
    bodyIssuingCertificate: string;
    licenseCode: string;
    referenceNumber: string;
    sellerOfProduct: IValue;
    facility: IKeyValue;
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
    isTrader: boolean;
    productInfo: IProductInfo[];
    scExpired: boolean;
}

export interface ITaskDetail {
    ttDocumentId: string;
    certType: string;
    certId: string;
    companyId: string;
    recordingFacility: string;
    creationDate: string;
    extractedData: ITaskExtractedData;
    changedData: ITaskExtractedData;
    status?: string;
    comments?: IWorkflowStatusComments;
    systemMessages: string[];
}

export interface ITaskApprovalStatusRequestPayload {
    id: string;
    certType: string;
    workflowStatus?: string;
    workflowType: string;
    fromCompanyId: string;
    toCompanyId: string;
    certId: string;
    comments?: IWorkflowStatusComments;
    taskHistory: any;
}

export interface ITaskApprovalStatusRequestFacilityCreationPayload {
    id: string;
    certType: string;
    workflowStatus?: string;
    workflowType: string;
    fromCompanyId: string;
    toCompanyId: string;
    certId: string;
    comments?: IWorkflowComments;
    facilityInfo?: ISCFacilityInfo[];
    taskHistory: any;
}

export interface IWaitingForApprovalTaskData {
    taskId: string;
    entityId: string;
    entity: string;
    workflowType: string;
    fromCompany: string;
    toCompany: string;
    status: string;
    comments: string;
}

export interface IWaitingForApprovalRequestPayload {
    taskObject: IWaitingForApprovalTaskData;
    taskHistory: any;
}

export interface ISCReviewComments {
    selectedComments: string[];
    otherComments: string;
    resolutionDate: string;
}

export interface ISCReviewRequestPayload {
    id: string;
    certType: string;
    workflowStatus: string;
    workflowType: string;
    fromCompanyId: string;
    toCompanyId: string;
    certId: string;
    comments: ISCReviewComments;
    notifyTT: boolean;
    taskHistory: any;
}

export interface IWithMatchedData {
    id: string;
    value: string;
    matchedData: IKeyValueCode;
}

export interface ISCFacilityInfo {
    nameOfUnit: string;
    address: string;
    processes: string;
    matchedData: IKeyValueCode;
    doCreate: boolean;
}

export interface ISCTaskExtractedData {
    certTypeId: string;
    bodyIssuingCertificate: string;
    referenceNumber: string;
    sellerOfProduct: IWithMatchedData;
    certStandard: string;
    validUntil: string;
    validFrom: string;
    placeAndDateOfIssue: string;
    facilityInfo: ISCFacilityInfo[];
}

export interface ISCTaskDetail {
    ttDocumentId: string;
    certType: string;
    certId: string;
    certStandard: string;
    companyId: string;
    creationDate: string;
    extractedData: ISCTaskExtractedData;
    changedData: ISCTaskExtractedData;
    comments: ISCReviewComments;
    status: string;
}
