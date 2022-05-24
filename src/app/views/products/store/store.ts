import { ActionReducerMap } from '@ngrx/store';
import * as Product from './products.reducer';

export interface ProductState {
    Products: Product.IProductsModel;
}

export const productReducer: ActionReducerMap<ProductState> = {
    Products: Product.ProductReducer
};

export const FILTER_SESSION = `product_declaration_filters`;
