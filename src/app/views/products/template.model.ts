import { ICustomFieldDisplay } from '../../shared/components/additional-information/additional-information.model';

/**
 * @interface brand-supplier-data-collection:template-model
 */
export interface IFilterTemplateData {
    [index: string]: IFilterKeys[];
}

export interface IFilterKeys {
    id: string;
    value: string;
}

export interface ISearchRequestPayload {
    filter: any;
    sort: {
        sortBy: 'create_ts' | 'name' | 'code' | 'status';
        sortOrder: 'desc' | 'asc';
    };
    pagination: {
        from: number;
        size: number;
    };
    freeHand?: string;
}

export interface IProductDetailRequestPayload extends ISearchRequestPayload {
    documentId: string;
    searchAfter?: string[];
}

export interface IOptionValueModel {
    id?: string;
    name?: string;
    data: IOptionsModel[];
}

export interface IOptionsModel {
    value: string;
    id: any;
}
export interface IProductsDataCollectionTemplate {
    autoSaveDate: number; // timestamp
    tasks: ITasks[];
    customFieldDisplayList?: ICustomFieldDisplay[];
    totalCount: number;
}

export interface ITasks {
    id: string;
    lastModifiedBy: string;
    updateTs: number;
    productId: string;
    status: GroupStatus;
    productName: string;
    productNumber: string;
    itemNumber: string;
    pluNumber: string;
    productTaskViewData: IProductTaskViewData[];
    showApiScore: boolean;
    customFields?: any;
}

export type GroupStatus = 'OPEN' | 'SUBMITTED' | 'DRAFT' | 'ONPROGRESS';

export interface IProductTaskViewData {
    id: string;
    label: string;
    fieldType?: FiledTypes;
    fieldTypeInfo: FieldTypeInfo;
    optionTemplateId?: any;
    displayValueAlone?: boolean;
    fieldRequired: boolean;
    duplicated?: false;
    fieldData?: string | number | string[] | number[];
    productTaskMetaData?: IProductTaskViewData[];
    order?: number;
    section?: Section;
    orderColumnView?: number;
}

export type FiledTypes = 'SINGLE_SELECT' | 'MULTI_SELECT';

export type FieldTypeInfo = 'FORM_CONTROL' | 'FORM_ARRAY' | 'FORM_GROUP';

export interface IBulkUpdatePayload {
    granularityId: string;
    ingredientId: string;
    data: string[];
}

export interface IValue {
    id: string;
    value: string;
}

/**
 * Add ingredient
 */

export interface ProductAutoSaveRequestPayload {
    product_data: ProductData;
    product_declaration_payload: ProductDeclarationPayload[];
}

export interface ProductData {
    composition: Composition[];
}

export interface Composition {
    id: string;
}

export interface ProductDeclarationPayload {
    _id: string;
    granularity_id: string;
    section: Section;
    label: string;
    save_value: string[];
    order: number;
}

export enum Section {
    Ingredient = 'INGREDIENT',
    Product = 'PRODUCT'
}
export const UNKNOWN = 'ign_UNKNOWN__';

export const INGREDIENT_META_DATA: IProductTaskViewData = {
    id: UNKNOWN,
    label: 'Ingredient & COO',
    fieldTypeInfo: 'FORM_GROUP',
    displayValueAlone: false,
    duplicated: false,
    fieldRequired: true,
    productTaskMetaData: [
        {
            id: UNKNOWN,
            section: Section.Ingredient,
            label: 'Ingredient',
            fieldType: 'SINGLE_SELECT',
            fieldTypeInfo: 'FORM_CONTROL',
            fieldData: [],
            optionTemplateId: 'product_ingredient',
            displayValueAlone: false,
            orderColumnView: 3,
            duplicated: false,
            fieldRequired: true
        },
        {
            id: 'ingredient_label',
            section: Section.Ingredient,
            label: 'Ingredient Label',
            order: 1,
            fieldType: 'MULTI_SELECT',
            fieldTypeInfo: 'FORM_CONTROL',
            fieldData: [],
            optionTemplateId: '',
            displayValueAlone: false,
            orderColumnView: 4,
            duplicated: false,
            fieldRequired: false
        },
        {
            id: 'production_method',
            section: Section.Ingredient,
            label: 'Production Method',
            order: 1,
            fieldType: 'SINGLE_SELECT',
            fieldTypeInfo: 'FORM_CONTROL',
            fieldData: [],
            optionTemplateId: '5ecd4131aaf62688e0f650af',
            displayValueAlone: false,
            orderColumnView: 5,
            duplicated: false,
            fieldRequired: false
        },
        {
            id: 'country_of_origin',
            section: Section.Ingredient,
            label: 'Country / Region of Origin',
            order: 1,
            fieldType: 'MULTI_SELECT',
            fieldTypeInfo: 'FORM_CONTROL',
            fieldData: [],
            optionTemplateId: '5ecd4131aaf62644e0f650af',
            displayValueAlone: false,
            orderColumnView: 6,
            duplicated: false,
            fieldRequired: false
        }
    ]
};

export interface IDeActivateOrReActivatePayload {
    showApiScore: boolean;
    apiScoreDeactivateType: number;
}
