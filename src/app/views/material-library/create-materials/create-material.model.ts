interface IMaterialsComposition {
    id: string;
    value: number;
}

interface IWidth {
    value: number;
    unit: string;
}

interface IDensity {
    value: number;
    unit: string;
}

interface ICertification {
    id: string;
    mandatory: boolean;
}

export interface IMaterial {
    id?: string;
    internalArticleNumber: string;
    year: number | string;
    season: string;
    articleTypeId: string;
    internalArticleName: string;
    supplierId: string;
    supplierArticleNumber?: string;
    supplierArticleName?: string;
    traceable: string;
    tags?: string | string[];
    materialsComposition?: IMaterialsComposition[];
    width?: IWidth;
    density?: IDensity;
    certifications?: ICertification[];
    colors?: string[];
    materialColors?: any;
    supplier?: any;
    materialUniqueCode: string;
}
