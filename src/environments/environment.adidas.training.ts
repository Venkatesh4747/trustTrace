import { PROD_CONFIG } from './common/config';
import { API, getBaseUrl } from './common/endpoints';

export const environment = {
    ...PROD_CONFIG,
    IMG_URL: 'https://static.trustrace.com/static/adidas/',
    url: getBaseUrl('ADIDAS_TRAINING'),
    api: API('ADIDAS_TRAINING', true),
    name: 'adidas'
};
