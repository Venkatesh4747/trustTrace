export type status = 'ACTIVE' | 'IN_ACTIVE' | 'DELETED';

export interface INonConformities {
    catergoryId: string;
    categoryName: string;
    subCategories?: Array<IsubCategories>;
}

export interface IsubCategories {
    subCategoryId: string;
    value: string;
    status?: status;
    subCategoryName?: string;
    subNCData?: Array<IsubNCData>;
}

export interface IsubNCData {
    value: string;
    status: status;
    priorityId: string;
    addedOn?: Date;
    updatedOn?: Date;
    priorityValue?: string;
    id?: string;
    isProgress?: boolean;
}

export interface IupdateModel {
    mainIndex: number;
    subIndex: number;
    ncIndex: number;
    type: 'update' | 'delete' | 'address' | null;
}

export interface INonConformitiesTemplate {
    id: string;
    value: string;
    status: status;
    subCategories: Array<{
        subCategoryId: string;
        value: string;
        status: status;
        formControlName?: string;
    }>;
}

export interface IAuditPriority {
    categoryId: string;
    categoryName: string;
    ncDeadlineValue: number;
    ncDeadLineUnit: string;
    mailReminderValue: number;
    mailReminderUnit: string;
    status: string;
}

export type NcMode = 'view' | 'edit' | 'record';

export const NcStaticData: Array<INonConformities> = [
    {
        catergoryId: 't4nvg34wd2yi',
        categoryName: 'Social management',
        subCategories: []
    },
    {
        catergoryId: 't4nvg34wd2ye',
        categoryName: 'Labour',
        subCategories: []
    },
    {
        catergoryId: 'm4nvg34wd2fi',
        categoryName: 'Recreation',
        subCategories: []
    },
    {
        catergoryId: '1jelixhrzsx9e',
        categoryName: 'Safety & Health',
        subCategories: [
            {
                subCategoryId: '1iv4aej7cydlw',
                value: 'Earthquake',
                status: 'ACTIVE',
                subNCData: [
                    {
                        value: 'test123',
                        status: 'ACTIVE',
                        priorityId: 't86ud3bsctpe',
                        addedOn: new Date(2018, 11, 24, 10, 33, 30, 0)
                    }
                ]
            },
            {
                subCategoryId: 'vevv4pi3jyoy',
                value: 'Fire',
                status: 'ACTIVE',
                subNCData: []
            }
        ]
    },
    {
        catergoryId: '1hr5bzs10o7qx',
        categoryName: 'Bharathi',
        subCategories: [
            {
                subCategoryId: 'ubmef2l3h3jp',
                value: 'Bharathi Sundar',
                status: 'ACTIVE',
                subNCData: []
            },
            {
                subCategoryId: 'ubmef2l3h3ji',
                value: 'Updated - Bharathi Sundar',
                status: 'ACTIVE',
                subNCData: []
            }
        ]
    }
];
