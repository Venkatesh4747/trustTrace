import { QA_CONFIG } from './common/config';
import { API, getBaseUrl } from './common/endpoints';

export const environment = {
    ...QA_CONFIG,
    url: getBaseUrl('DEV'),
    api: API('DEV', false),
    name: 'fashion'
};
