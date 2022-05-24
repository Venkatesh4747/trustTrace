import { IValue } from '../template.model';

export interface Entity {
    message: string;
    data: IRetailerDeclarationSubmitResponce;
}

export interface IRetailerDeclarationSubmitResponce {
    lastModifiedBy?: string;
    customFieldResponse?: CustomFieldResponse;
    updateTs?: number;
    status: boolean;
    productLabel?: { id: string; value: string }[];
    containsInvalidLabel?: boolean;
    scoreUpdateTs: number;
    country_of_packaging: IValue;
}

export interface CustomFieldResponse {
    fieldResponse: { [key: string]: string[] };
    customFieldUITemplateAggResponseMap: CustomFieldUITemplateAggResponseMap;
}

export interface CustomFieldUITemplateAggResponseMap {
    'Finished Products': FinishedProducts;
}

export interface FinishedProducts {
    'Spider web': Ingredient[];
    Scores: Score[];
    Ingredients: Ingredient[];
}

export interface Ingredient {
    id: string;
    updateTs: number;
    createTs: number;
    createdBy: string;
    lastModifiedBy: string;
    companyId: string;
    entity: string;
    fieldId: string;
    viewPage: string;
    viewType: string;
    displayConfig: DisplayConfig;
    groupConfig: GroupConfig;
    status: string;
    behaviourConfig?: BehaviourConfig;
}

export interface BehaviourConfig {
    displayType: string;
    compoundFields?: string[];
}

export interface DisplayConfig {
    order: number;
    name: string;
    type: string;
    options?: Option[];
    constraintConfig: ConstraintConfig;
    editable: boolean;
    hideLabel: boolean;
    visible: boolean;
}

export interface ConstraintConfig {
    mandatory: boolean;
}

export interface Option {
    key: string;
    value: string;
}

export interface GroupConfig {
    groupName: string;
    tabName: string;
}

export interface Score {
    id: string;
    updateTs: number;
    createTs: number;
    createdBy: string;
    lastModifiedBy: string;
    companyId: string;
    entity: string;
    fieldId: string;
    viewPage: string;
    viewType: string;
    displayConfig: DisplayConfig;
    groupConfig: GroupConfig;
    status: string;
}

export interface IdValue {
    id: number;
    value: string;
}

export interface ScoreActivateDeactivateModelData {
    statusTitle: string;
    reasonTitle: string;
    primaryBtn: string;
    message: IdValue[];
    description: IdValue[];
    scoreDeactivateTypeMessages: IdValue[];
}
