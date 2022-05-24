export interface ILabelAndProgramList {
    id: string;
    name: string;
    label_level: string;
    label_type: string;
    status: string;
    label_id?: string;
    searchAfterSort?: any;
    supplier_divisions: string[];
}

export interface ILabelListTableData {
    totalCount: number;
    searchResponse: ILabelAndProgramList[];
    customFieldDisplayList: any;
}

export type LabelType = 'General' | 'Custom';

export type LabelLevel = 'Product' | 'Ingredient';

// create , update
export type screenState = 'create' | 'update';
export interface ILabelsAndProgramConfig {
    labelType: LabelType[];
    labelLevel: LabelLevel;
    suppliers: string[];
    calculationBuilderConfig: ICalculationBuilderConfig;
}

interface ICalculationBuilderConfig {
    operatorsConfig: IOperators[];
    scoreValueRange: IScoreValueRange;
    parametersConfig: IParameterConfig[];
}

export interface IParameterConfig {
    parameterName: string;
    displayName?: string;
    operator: IOperators;
    score: number;
    subParametersConfig: IParameterConfig[];
}
interface IScoreValueRange {
    minValue: number;
    maxValue: number;
    incrementValue: number;
}

interface IOperators {
    operator: Operators;
    displayName: string;
}

export enum Operators {
    ASSIGNMENT = '=',
    ADDITION = '+',
    SUBTRACT = '-'
}

export interface ICreateLabelAndProgramReqPayload {
    labelName: string;
    labelType: string;
    labelLevel: string;
    clonedLabel: string;
    suppliers: string[];
    isClone: boolean;
    calculationBuilderValues: ICalculationBuilderValues[];
}
export interface ICalculationBuilderValues {
    parameterName: string;
    operator?: Operators | null;
    score?: number | null;
    subParameterValues?: ICalculationBuilderValues[];
}

export interface SupplierProductCount {
    draftProductCount: number;
    submittedProductCount: number;
}
