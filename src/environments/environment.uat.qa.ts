import { QA_CONFIG } from './common/config';
import { API, getBaseUrl } from './common/endpoints';

export const environment = {
    ...QA_CONFIG,
    IMG_URL: 'https://static.trustrace.net/static/adidas/',
    url: getBaseUrl('UAT_QA'),
    api: API('UAT_QA', false),
    name: 'adidas'
};
