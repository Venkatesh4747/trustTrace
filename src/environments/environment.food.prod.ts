import { PROD_CONFIG } from './common/config';
import { API, getBaseUrl } from './common/endpoints';

export const environment = {
    ...PROD_CONFIG,
    url: getBaseUrl('FOOD_PROD'),
    api: API('FOOD_PROD', true),
    name: 'food'
};
