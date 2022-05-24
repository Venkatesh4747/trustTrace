const AMPLITUDE_TOKEN_QA = '8ee3df95944cc07f1c9d7d8fbc67b907';
const SUPPORT_CHAT_TOKEN_QA = 'eac734fb-962b-4819-b126-31fa64298602';

const AMPLITUDE_TOKEN_PROD = 'dddb84b2965e530047afcdf93ce4c377';
const SUPPORT_CHAT_TOKEN_PROD = 'bea4f050-646a-48e1-8ca4-84cb985fa172';

const COMMON_CONFIG = {
    EXPORT_IMAGE_HIGHCHART_URL: 'https://export.highcharts.com/',
    IMAGE_SLIDING_INTERVAL: 5000,
    TRUNCATE_STRING_LENGTH: 30,
    FETCH_SIZE: 50, // todo DEFAULT_PAGINATION_SIZE ?
    DEFAULT_PAGINATION_SIZE: 100,
    AUTO_SUGGESTION_SIZE: 5,
    config: {
        standardsImage: {
            bcorp: 'bcorp.jpg',
            futurefit: 'futurefit.png',
            bluesign: 'bluesign.jpg',
            c2c: 'c2c.png',
            fwf: 'fwf.jpg',
            stwi: 'siwi.jpeg',
            grs: 'grs.jpg',
            higg: 'higg.jpg',
            bsic: 'bsic.jpg'
        },
        questionnaire_band: true,
        supplier_band: true,
        maximumFileUploadSize: 5,
        allowedExtensions: {
            adminS3FileImportExtensions: ['.xlsx', '.xls'],
            certificates: ['jpg', 'jpeg', 'png', 'pdf'],
            foodEditScoreJustificationDocuments: ['jpg', 'jpeg', 'png', 'pdf', 'xlsx', 'xlsm', 'xls', 'doc', 'docx']
        },
        allowedFileExtensions: [
            'jpg',
            'jpeg',
            'png',
            'pdf',
            'xls',
            'xlsx',
            'xlsm',
            'doc',
            'docx',
            'rtf',
            'xps',
            'txt',
            'ppt',
            'pptx',
            'csv',
            'tsv'
        ],
        allowedLogoFileExtensions: ['jpg', 'jpeg', 'png'],
        allowedCertificationFileExtensions: ['pdf']
    },
    star_rating: {
        1: 'E - Very Poor',
        2: 'D - Poor',
        3: 'C - Average',
        4: 'B - Good',
        5: 'A - Very Good'
    },
    certificateTypes: {
        facilityAuditDraft: 'FACILITY_AUDIT_DRAFT'
    },
    subSupplierFilterKey: 'Sub-Supplier Associations',
    error_messages: {
        could_not_fetch_data: {
            title: 'Error!',
            message: 'Could not fetch data from server. Please contact support or try after some time.'
        },
        no_authorization: 'Please contact your account administrator'
    },
    defaultChartColorPalettes: [
        '#058DC7',
        '#50B432',
        '#ED561B',
        '#DDDF00',
        '#24CBE5',
        '#64E572',
        '#FF9655',
        '#FFF263',
        '#6AF9C4'
    ],
    foodFaq: {
        sv: 'https://faqs.trustrace.com/coop-sv/',
        en: 'https://faqs.trustrace.com/coop-en/'
    },
    menusVersion: 'v4',
    downloadFileType: {
        xlsx: 'application/octet-stream',
        csv: 'application/octet-stream',
        json: 'application/json'
    },
    higgPortalUrl: 'https://portal.higg.org'
};

export const LOCAL_CONFIG = {
    ...COMMON_CONFIG,
    environment: 'dev',
    production: false,
    IMG_URL: 'https://static.trustrace.net/static/',
    MENU_URL: 'https://static.trustrace.net/static/jsons/menus/default.json',
    SUPPORT_CHAT_TOKEN: SUPPORT_CHAT_TOKEN_QA,
    amplitude_token: AMPLITUDE_TOKEN_QA,
    cognito: {
        callback_url: '/sso/callback',
        signout: '/'
    }
};

export const QA_CONFIG = {
    ...COMMON_CONFIG,
    environment: 'staging',
    production: false,
    IMG_URL: 'https://static.trustrace.net/static/',
    MENU_URL: 'https://static.trustrace.net/static/jsons/menus/default.json',
    SUPPORT_CHAT_TOKEN: SUPPORT_CHAT_TOKEN_QA,
    amplitude_token: AMPLITUDE_TOKEN_QA,
    cognito: {
        callback_url: '/sso/callback',
        signout: '/'
    }
};

export const PROD_CONFIG = {
    ...COMMON_CONFIG,
    environment: 'production',
    production: true,
    IMG_URL: 'https://static.trustrace.com/static/',
    MENU_URL: 'https://static.trustrace.com/static/jsons/menus/default.json',
    SUPPORT_CHAT_TOKEN: SUPPORT_CHAT_TOKEN_PROD,
    amplitude_token: AMPLITUDE_TOKEN_PROD,
    cognito: {
        callback_url: '/sso/callback',
        signout: '/'
    }
};
