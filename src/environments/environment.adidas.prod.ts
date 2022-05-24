import { PROD_CONFIG } from './common/config';
import { API, getBaseUrl } from './common/endpoints';

export const environment = {
    ...PROD_CONFIG,
    IMG_URL: 'https://static.trustrace.com/static/adidas/',
    url: getBaseUrl('ADIDAS_PROD'),
    api: API('ADIDAS_PROD', true),
    name: 'adidas'
};
