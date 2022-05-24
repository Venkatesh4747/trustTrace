export interface Audit {
    id: string;
    type: string;
    auditor: string;
    auditee: string;
    dateOfAudit: number;
    validTill: number;
    name: string;
}

export interface AssessmentType {
    id: string;
    name: string;
}

export interface Supplier {
    id: string;
    name: string;
}

export interface Facility {
    id: string;
    name: string;
}

export interface AuditFile {
    id?: string;
    names?: string;
}

export interface AuditFileData {
    name: string;
    value: AuditFile;
    type: string;
}

export interface AuditData {
    name: string;
    value: string;
    type: string;
    scores?: TTScoreParam[];
}

export interface AuditPayload {
    id?: string;
    auditor?: string;
    auditee: string;
    name: string;
    type: string;
    dateOfAudit: number;
    validTill: number;
    status?: string;
    facilityId: string;
    overallRating: string | number;
    nonConformitiesCount: number;
    data: {
        sections: AuditData[];
    };
}

export interface TTScoreParam {
    subGroupName?: string;
    subGroupValue?: number;
}

export interface TTScoreOption {
    id?: string;
    score?: TTScoreParam[];
    name?: string;
}

export interface TTScoreField {
    type?: string;
    name?: string;
    options?: TTScoreOption[];
}
