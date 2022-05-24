import { IdValue } from '../../../views/products/product-detail/product-detail.model';

export interface ScoreModel {
    productId: string;
    statusTitle: string;
    reasonTitle: string;
    primaryBtn: string;
    secondaryBtn: string;
    scoreDeactivateTypeMessages: IdValue[];
    message: IdValue[];
    description: IdValue[];
    scoreReActivateType: number;
}
