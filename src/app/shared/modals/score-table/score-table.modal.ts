export interface Document {
    fileId: string;
    fileName: Array<string>;
}

export interface IngredientScore {
    updatedScore: number;
    ingredientId: string;
}

export interface parameterScore {
    label: string;
    updatedProductScore: number;
    ingredientScore: Array<IngredientScore>;
}

export interface scoreTableDetail {
    headers: Array<string>;
    subheaders: Array<string>;
    parameters: Array<string>;
    scoredata: Array<any>;
    updatedBy: string;
}
