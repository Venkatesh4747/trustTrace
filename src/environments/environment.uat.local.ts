import { LOCAL_CONFIG } from './common/config';
import { API, getBaseUrl } from './common/endpoints';

export const environment = {
    ...LOCAL_CONFIG,
    IMG_URL: 'https://static.trustrace.net/static/adidas',
    url: getBaseUrl('DEV'),
    api: API('DEV', false)
};
