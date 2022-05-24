import { PROD_CONFIG } from './common/config';
import { API, getBaseUrl } from './common/endpoints';

export const environment = {
    ...PROD_CONFIG,
    url: getBaseUrl('FASHION_PROD'),
    api: API('FASHION_PROD', true),
    demoAccounts: ['demo-brand@trustrace.com'],
    name: 'fashion'
};
