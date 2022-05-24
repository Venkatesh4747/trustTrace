export interface IHiggApiKey {
    apiKey: string;
}

export interface IHiggModalCloseResponse {
    event: string;
}

export interface IHiggSavedApiKey {
    message: string;
    higgApiStatusCode: number;
}

export interface IHiggSyncAudit {
    statusCode: number;
    message: string;
    syncStatusData: ISyncAuditDataModel;
}

export interface ISyncAuditDataModel {
    createdCount: number;
    auditsWithUnmappedFacilityCount: number;
    updatedCount: number;
    errorCount?: number;
}

export interface IGetApiKeyHttpResponse {
    data: IHiggApiKey;
}

export interface ISaveApiKeyHttpResponse {
    data: {
        data: IHiggSavedApiKey;
    };
}

export interface ISyncAuditHttpResponse {
    status: string;
    data: {
        errors?: {
            higgApiStatusCode: string;
            message: string;
        };
    };
}

export interface IHiggModalConfigData {
    type: string;
    btnType?: string;
    eventType?: string;
    title?: string;
    description?: string;
}
