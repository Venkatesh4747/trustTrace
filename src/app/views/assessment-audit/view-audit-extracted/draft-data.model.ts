import { INormalisedRatings } from '../assessment-audit.const';
import { INonConformities } from '../non-conformities/non-conformities-list/non-conformities-list.model';

export interface IDraft {
    id: string;
    updateTs: number;
    lastModifiedBy: string;
    companyId: string;
    status: number;
    auditName: string;
    auditTypeId: string;
    attachmentId: string;
    auditData: IAuditData;
    extractedData?: any;
}

export interface IAuditData {
    auditor?: string;
    auditee?: string;
    facilityId?: string;
    dateOfAudit?: number;
    auditBody?: string;
    validTill?: number;
    data: {
        sections: Array<ISection>;
    };
    overallRating?: string;
    normalisedRating?: INormalisedRatings;
    nonConformities?: Array<INonConformities>; // fix this in enhancement duplication
    nonConformityList?: Array<any>; // fix this in enhancement duplication
}

export type InputTypes = 'SELECT' | 'TEXT' | 'NUMBER' | 'EMAIL';

export interface IFields {
    name: string;
    options: {
        [key: string]: string;
    };
    type: InputTypes;
    mandatory: boolean;
    value?: string;
}

export interface ISection {
    header: string;
    fields: Array<IFields>;
    metadata?: {
        text_extraction_supported: boolean;
    };
}

export interface IauditTemplate {
    id: string;
    sections: Array<ISection>;
    overallRating: IoverallRating;
}

export interface IoverallRating {
    type: InputTypes;
    placeholder: string | null;
    options: {
        [key: string]: string;
    };
    name: string;
    mandatory: boolean;
    min: any;
    max: any;
    step: any;
}

export interface ICreateAuditPayload {
    auditData: IAuditData;
}
