export interface IReleaseUpdate {
    id?: string;
    key?: string;
    updateTs?: number;
    createTs?: string;
    createdBy?: string;
    lastModifiedBy?: string;
    group?: string;
    message: string;
    expiryTs: any;
    status?: 'ACTIVE' | 'IN_ACTIVE';
}
