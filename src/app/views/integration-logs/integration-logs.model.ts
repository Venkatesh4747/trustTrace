export interface IValue {
    id: string;
    value: string;
}

export interface IIntegrationSource {
    bucket: string;
    value: string;
    key: string;
    eventDate: Date;
}

export interface IIntegrationCode {
    value: string;
    materialSupplierCode: string;
}

export interface IIntegrationError {
    exception: string;
}

export interface IIntegrationLogDetail {
    id: string;
    updateTs: string;
    createTs: string;
    integrationSource: IIntegrationSource;
    integrationCode: IIntegrationCode;
    companyId: string;
    division: string;
    integrationError: IIntegrationError;
    rawData: any;
    status: string;
    retry: boolean;
    additionalInfo: any;
}
