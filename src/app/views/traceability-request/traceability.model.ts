export class IGetPONumber {
    styleID: string;
    supplierID: string;
}

export interface INextTierProviderData {
    Article: string;
    Supplier: string;
}

interface IMetaData {
    isAgentNode: boolean;
}

export interface IPayLoadSupplyChain {
    productSupplyChainList?: any;
    dataProvider: string;
    dataProviderName?: string;
    provideMyself: boolean;
    metaData?: IMetaData;
    poNumber?: string;
    supplyChainArticle: ISupplyChainArticle;
}

export interface ISupplyChainArticle {
    articleTypeId: string;
    mandatory: false;
    internalArticleName: string;
    supplierId: string;
    supplierName: string;
    traceable: string;
    facilityId: string;
    facilityName: string;
    productOtherInfo?: any;
    supplierVerificationStatus?: IIdValue;
    supplierAssociationStatus?: IIdValue;
    supplierOtherInfo?: ISupplierOtherInfo;
    creationType?: string;
    articleUniqueId: string;
}

export interface IIdValue {
    id: number;
    value: string;
}

export interface ISupplierOtherInfo {
    address: {
        city: string;
        latitude: number;
        longitude: number;
        country: string;
        state: string;
    };
}

export interface IArticleDelete {
    checkedStatus: boolean;
    articleDetail: ISupplyChainArticle;
}
