export interface ProductCategory {
    category: ProductGroup[];
}
export interface ProductGroup {
    name: string;
    productGroup: string;
    size: string;
    fit: string;
    length: string;
}
export const tabNames = {
    auditSettings: 'audit',
    styleSettings: 'style',
    apiSettings: 'api',
    integrationSettings: 'integration'
};
