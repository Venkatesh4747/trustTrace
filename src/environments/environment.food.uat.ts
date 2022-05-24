import { QA_CONFIG } from './common/config';
import { API, getBaseUrl } from './common/endpoints';

export const environment = {
    ...QA_CONFIG,
    url: getBaseUrl('FOOD_UAT'),
    api: API('FOOD_UAT', false),
    name: 'food'
};
