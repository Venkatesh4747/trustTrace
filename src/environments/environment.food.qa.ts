import { QA_CONFIG } from './common/config';
import { API, getBaseUrl } from './common/endpoints';

export const environment = {
    ...QA_CONFIG,
    url: getBaseUrl('FOOD_QA'),
    api: API('FOOD_QA', false),
    name: 'food'
};
