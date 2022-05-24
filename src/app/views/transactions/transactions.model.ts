export interface IValue {
    id: string;
    value: string;
}

export interface ITransactionStyle {
    name: string;
    number: string;
}

export interface IQuantity {
    value: number;
    unit_id: string;
    units_value: string;
}

export interface INotificationDetail {
    isValid: boolean;
    message: string;
}

export interface ITransactionDetail {
    id: string;
    company_id: string;
    tx_type: string;
    lot_id: string;
    tx_date: string;
    product_id: string;
    product_type: IValue;
    product_number: string;
    product_name: string;
    product_name_number: string;
    supplier_material_name: string;
    trade_name: string;
    invoice_number: string;
    tc_reference_number: string;
    quantity_in_uom: any;
    actual_conversion_ratio: string;
    quantity: IQuantity;
    remaining_quantity: any;
    customer?: IValue;
    customer_facility?: any;
    supplier_name: string;
    supplier_id: string;
    facility: IValue;
    mode: string;
    po_number: string;
    po_mapping_status: string;
    remarks: string;
    biz_transaction_id: string;
    status: string;
    create_ts: string;
    update_ts: string;
    comments?: string;
}

export interface ITransaction {
    searchResponse: ITransactionDetail[];
    totalCount: number;
}

export interface ITransactionTree {
    eventId: string;
    ilmdId: string;
    companyId: string;
    lotNo: string;
    quantity: string;
    poNumber: string;
    productNameAndNumber: string;
    productType: string;
    companyName: string;
    facilities: string[];
    inputEpcs: ITransactionTree[];
}

export interface IInboundData {
    date: Date;
    companyId: string;
    mode: string;
    txType: string;
    facilityId: string;
    inboundData: {
        productEntity: string;
        productItemId: string;
        sellerLotId: string;
        quantity: {
            quantity: string;
            unit: string;
        };
        sellerUOM: {
            quantity: string;
            unit: string;
        };
        poNumber: string;
        poDate: Date;
        supplierId: string;
        supplierFacilityId: string;
    };
}

export interface IOutboundData {
    date: Date;
    companyId: string;
    mode: string;
    txType: string;
    facilityId: string;
    outboundData: {
        poNumber: string;
        poMappingStatus: string;
        poDate: Date;
        customerFacilityId: string /* Commented the code as the ticket PL-259 is not imlemented on the backend */;
        /* supplierId: string; */ productionLotId: string;
        lotManufacturedDate: Date;
        productItemId: string;
        quantity: {
            quantity: string;
            unit: string;
        };
        sellerUOM: {
            quantity: string;
            unit: string;
        };
        delayReason: string;
        remarks: string;
        invoiceNumber: string;
        productionTxId: string;
    };
}

export interface IInputLotData {
    lotId: string;
    poNumber: string;
    quantity: {
        quantity: string;
        unit: string;
    };
    inputTxDate: string;
    inputTxId: string;
    supplierId: string;
    txType: string;
    articleId: string;
    fieldName?: string;
}

export interface IProductionData {
    date: string;
    companyId: string;
    mode: string;
    txType: string;
    facility: string;
    productionData: {
        outputLotId: string;
        outputProductItemId: string;
        outputQuantity: {
            quantity: string;
            unit: string;
        };
        sellerUOM: {
            quantity: string;
            unit: string;
        };
        year: string;
        season: string;
        supplierMaterialName: string;
        inputLotData: IInputLotData[];
    };
}

export interface ICountryOfOriginData {
    country: string[];
    province: string[];
    certificateOfOrigin: string;
}

export interface ICottonInboundData {
    date: Date;
    companyId: string;
    mode: string;
    txType: string;
    facility: string;
    inboundData: {
        sellerLotId: string;
        quantity: {
            quantity: string;
            unit: string;
        };
        invoiceNumber: string;
        materialCompositionList: IValue[];
        sellerName: string;
        materialType: string;
        yarnCOO: ICountryOfOriginData;
        cottonLintCOO: ICountryOfOriginData;
        productItemId: string;
        productEntity: string;
        supplierId: string;
    };
    tierId: string;
}

export interface IProductionIntermediateInputLotData {
    articleId: string;
    lotId: string;
    poNumber: string;
    quantity: {
        quantity: string;
        unit: string;
    };
    inputTxId: string;
    supplierId: string;
    supplierFacilityId: string;
    txType: string;
    inputMaterialType: number;
    materialCompositionList: IValue[];
    fieldName?: string;
}

export interface IProductionIntermediateData {
    date: Date;
    companyId: string;
    mode: string;
    txType: string;
    facilityId: string;
    productionData: {
        outputLotId: string;
        outputQuantity: {
            quantity: string;
            unit: string;
        };
        sellerUOM: {
            quantity: string;
            unit: string;
        };
        materialCompositionList: IValue[];
        productionInputLots: IProductionIntermediateInputLotData[];
    };
    tierId: string;
}

export interface ITierConfigPayload {
    brandCompanyId: string;
    tier: string;
    searchContext: string;
    txType: string;
}

export interface ITierConfigLabel {
    ttName: string;
    aliasName: string;
    visible: Boolean;
}

export interface ITierValue {
    key: string;
    value: string;
}

export enum SEARCH_CONTEXT {
    T1 = 'T1',
    T2 = 'T2',
    T3 = 'T3',
    T1_INBOUND = 'tr_tier1_INBOUND',
    T1_PRODUCTION = 'tr_tier1_PRODUCTION',
    T1_OUTBOUND = 'tr_tier1_OUTBOUND',
    T2_COTTON_INBOUND = 'tr_tier2_COTTON_INBOUND',
    T2_PRODUCTION_INTERMEDIATE = 'tr_tier2_INTERMEDIATE_PRODUCTION',
    INBOUND = 'INBOUND',
    PRODUCTION = 'PRODUCTION',
    OUTBOUND = 'OUTBOUND',
    COTTON_INBOUND = 'COTTON_INBOUND',
    PRODUCTION_INTERMEDIATE = 'INTERMEDIATE_PRODUCTION'
}

export enum TRANSACTION_TYPE {
    INBOUND = 'INBOUND',
    PRODUCTION = 'PRODUCTION',
    OUTBOUND = 'OUTBOUND',
    COTTON_INBOUND = 'COTTON_INBOUND',
    PRODUCTION_INTERMEDIATE = 'INTERMEDIATE_PRODUCTION'
}

export enum INBOUND_LABELS {
    INTERNAL_FIELD = 'Internal Field',
    ARTICLE_NAME_NUMBER = 'MLM ID / Material Name & Number',
    MATERIAL_NAME = 'Material Name',
    MATERIAL_NUMBER = 'Material Number',
    STYLE_NAME = 'Style Name',
    STYLE_NUMBER = 'Style Number',
    LOT_ID = 'Lot ID',
    QUANTITY = 'Inbound Quantity (in kgs)',
    QUANTITY_SUPPLIER_UOM = 'Released Quantity in Supplier UOM',
    SUPPLIER_UOM = 'Supplier UOM',
    PO_NUMBER = 'Invoice Number',
    PO_DATE = 'Invoice Date',
    TRANSACTION_DATE = 'Inbound Date',
    SUPPLIER = 'Seller of the product',
    SUPPLIER_FACILITY = 'Seller Facility',
    FACILITY = 'Buyer of the product',
    MATERIAL_COMPOSITION = 'Material Composition'
}

export enum OUTBOUND_LABELS {
    INTERNAL_FIELD = 'Internal Field',
    ARTICLE_NAME_NUMBER = 'MLM ID / Material Name and Number',
    LOT_ID = 'Lot ID',
    QUANTITY = 'Outbound Quantity',
    PO_NUMBER = 'Po Number',
    PO_MAPPING_STATUS = 'Po Mapping Status',
    TRANSACTION_DATE = 'Invoice Date',
    CUSTOMER_NAME = 'Customer Name',
    SUPPLIER = 'Owner',
    FACILITY = 'Outbound Facility',
    LOT_MANUFACTURED_DATE = 'Lot Manufactured Date',
    QUANTITY_SUPPLIER_UOM = 'Released Quantity in Supplier UOM',
    SUPPLIER_UOM = 'Supplier UOM',
    REMARKS = 'Remarks',
    DELAY_REASON = 'Delay Reason',
    OTHER_REASON = 'Other Reason',
    INVOICE_NUMBER = 'Invoice Number'
}

export enum PRODUCTION_LABELS {
    INTERNAL_FIELD = 'Internal Field',
    ARTICLE_NAME_NUMBER = 'MLM ID / Material Name and Number',
    MATERIAL_NAME = 'Material Name',
    MATERIAL_NUMBER = 'Material Number',
    STYLE_NAME = 'Style Name',
    STYLE_NUMBER = 'Style Number',
    LOT_ID = 'Production Lot ID',
    QUANTITY = 'Output Quantity (in kgs)',
    QUANTITY_SUPPLIER_UOM = 'Quantity Produced In Supplier UOM',
    SUPPLIER_UOM = 'Supplier UOM',
    PO_NUMBER = 'Invoice Number',
    PO_DATE = 'Invoice Date',
    TRANSACTION_DATE = 'Production Date',
    SUPPLIER = 'Seller',
    FACILITY = 'Associated Facility',
    SUPPLIER_MATERIAL_NAME = 'Supplier Material Name',
    MATERIAL_COMPOSITION = 'Material Composition',
    INPUT_ARTICLE_NAME_NUMBER = 'MLM ID / Material Number',
    INPUT_LOT_ID = 'Input Lot ID',
    INPUT_LOT_QUANTITY = 'Input Lot Quantity',
    INPUT_LOT_CREATION_DATE = 'Lot Creation Date',
    INPUT_MATERIAL_COMPOSITION = 'Article Material Composition',
    INPUT_PO_NUMBER = 'Invoice Number',
    INPUT_QUANTITY_USED_IN_UOM = 'Input Quantity Used In UOM',
    INPUT_UNITS_IN_UOM = 'Input Units In UOM',
    YEAR = 'Year',
    SEASON = 'Season'
}

export enum COTTON_INBOUND_LABELS {
    MATERIAL_NAME = 'Material Name',
    MATERIAL_COMPOSITION = 'Material Composition',
    SUPPLIER = 'Seller Name',
    FACILITY = 'Buyer Name',
    YARN_LOT_NUMBER = 'Yarn Lot Number',
    COTTON_TYPE = 'Cotton Type',
    NET_WEIGHT = 'Net Weight in Kgs',
    YARN_INVOICE_NUMBER = 'Yarn Invoice number',
    YARN_COO = 'Yarn COO',
    COTTON_LINT_COO = 'Cotton Lint COO',
    YARN_PROVINCE = 'Yarn Province (please fill in only if the COO is china)',
    COTTON_LINT_PROVINCE = 'Cotton Lint Province (please fill in only if the COO is china)',
    CERTIFICATE_OF_YARN_ORIGIN = 'Certificate of Origin (Imported yarn only)',
    CERTIFICATE_OF_COTTON_LINT_ORIGIN = 'Certificate of Origin (Imported cotton lint only)',
    MLM_ID = 'MLM ID',
    T2_Facility_ID = 'T2 Facility ID'
}

export enum PRODUCTION_INTERMEDIATE_LABELS {
    MATERIAL_NAME = 'Material Name',
    MATERIAL_COMPOSITION = 'Material Composition',
    LOT_ID = 'Prod no',
    TRANSACTION_DATE = 'Production Date',
    QUANTITY = 'Output Quantity (in kgs)',
    FACILITY = 'Facility ID/Facility Name',
    OUTPUT_QUANTITY_UOM = 'Output Quantity(UOM)',
    OUTPUT_QUANTITY_UOM_UNITS = 'Units(UOM)',
    INPUT_ARTICLE_NAME_NUMBER = 'MLM ID',
    INPUT_MATERIAL_COMPOSITION = 'Yarn/Fiber/Composition',
    INPUT_PO_NUMBER = 'Invoice No./Tc No.',
    INPUT_LOT_ID = 'Yarn Lot number',
    INPUT_LOT_QUANTITY = 'Quantity Used(In Kgs)',
    INPUT_FACILITY = 'Supplier Name'
}

export const DateFormat = {
    parse: {
        dateInput: 'input'
    },
    display: {
        dateInput: 'DD-MM-YYYY',
        monthYearLabel: 'MMMM YYYY',
        dateA11yLabel: 'MM/DD/YYYY',
        monthYearA11yLabel: 'MMMM YYYY'
    }
};

export const TierKeys = {
    tier1: 'tr_tier1',
    tier2: 'tr_tier2'
};
