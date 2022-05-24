import { QA_CONFIG } from './common/config';
import { API, getBaseUrl } from './common/endpoints';

export const environment = {
    ...QA_CONFIG,
    url: getBaseUrl('FASHION_UAT'),
    api: API('FASHION_UAT', false),
    name: 'fashion'
};
