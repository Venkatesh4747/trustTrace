import { QA_CONFIG } from './common/config';
import { API, getBaseUrl } from './common/endpoints';

export const environment = {
    ...QA_CONFIG,
    url: getBaseUrl('FASHION_QA'),
    api: API('FASHION_QA', false),
    name: 'fashion'
};
