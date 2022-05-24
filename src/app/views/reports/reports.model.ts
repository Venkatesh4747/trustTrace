export interface IModulesDetail {
    name: string;
    id: string;
}

export interface IReportRequest {
    report: string;
    requestType: 'SCHEDULED' | 'ONDEMAND';
}

export interface IOutputFormat {
    type: string;
}

export interface IReportDetail {
    id: string;
    createTs: string;
    updateTs: string;
    createdBy: string;
    lastModifiedBy: string;
    companyId: string;
    status: string;
    reportRequest: IReportRequest;
    outputFormat: IOutputFormat[];
}

export interface IReport {
    id: string;
    name: string;
    supportZIPReports?: boolean;
    latestScheduledReport: IReportDetail;
    latestOnDemandReport: IReportDetail;
}

export interface IReportConfig {
    id: string;
    name: string;
    companyId: string;
    module: string;
    processor: string;
    format: IOutputFormat[];
    maxDays?: string;
    dateFilterNeeded?: boolean;
}

export interface IFilterInput {}
export interface IFilter {
    name: string;
    value: IFilterConfig[];
}

export interface IFilterConfig {
    id: string;
    value: string;
}

export interface IFilter {
    name: string;
    value: IFilterConfig[];
}

export interface IFilterConfig {
    id: string;
    value: string;
}
export interface IGenerateReportPayload {
    report: string;
    filterInput: IFilterInput;
    filter: IFilter[];
    dateFilter: IFilterInput[];
    brandContextId: string;
}

export interface IDateRangeConfig {
    action: 'sub' | 'add' | 'custom';
    days: number;
}

export interface IDateRange {
    id: string;
    value: string;
    disableInputFields: boolean;
    config: IDateRangeConfig;
}
