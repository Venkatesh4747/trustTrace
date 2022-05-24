import { ITasks } from './template.model';
import { IProductList } from './finished-products-list/finished-product.model';

export class ProductCommonComponent {
    isCustomFieldValueExists(product: IProductList | ITasks, customFieldId: string): boolean {
        return product?.customFields?.[customFieldId]?.[0];
    }
}
