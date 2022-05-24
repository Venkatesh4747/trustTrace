export type DOMAINS =
    | 'DEV'
    | 'FOOD_QA'
    | 'FASHION_QA'
    | 'FASHION_UAT'
    | 'FOOD_QA'
    | 'FOOD_UAT'
    | 'ADIDAS_QA'
    | 'UAT_QA'
    | 'FASHION_PROD'
    | 'FOOD_PROD'
    | 'MOCK_SERVER'
    | 'NG_ROK'
    | 'GEOAPI_QA'
    | 'GEOAPI_PROD'
    | 'ADIDAS_PROD'
    | 'ADIDAS_INTEGRATION'
    | 'ADIDAS_TRAINING';

export type BASE_URL_TYPE = {
    [key in DOMAINS]: string;
};

/**
 * Base urls
 */
const BASE_URL: BASE_URL_TYPE = Object.freeze({
    DEV: `http://localhost:5000/`,
    FASHION_QA: `https://api.trustrace.net/`,
    FASHION_UAT: `https://api.trustrace.biz/`,
    FOOD_QA: `https://food.api.trustrace.net/`,
    FOOD_UAT: `https://food.api.trustrace.org/`,
    UAT_QA: `https://uat-api.trustrace.net/`,
    ADIDAS_QA: `https://adidastempapi.trustrace.net/`,
    FASHION_PROD: `https://api.trustrace.com/`,
    FOOD_PROD: `https://food-api.trustrace.com/`,
    ADIDAS_PROD: `https://adidas.api.trustrace.com/`,
    ADIDAS_INTEGRATION: `https://iadidas.api.trustrace.com/`,
    ADIDAS_TRAINING: `https://iadidas.api.trustrace.com/`,
    NG_ROK: ``,
    MOCK_SERVER: `https://mock.trustrace.io/`,
    GEOAPI_QA: `https://geo-api.trustrace.net/`,
    GEOAPI_PROD: `https://geo-api.trustrace.net/`
});

/**
 * @method getBaseUrl
 * @param domainName
 * It returns Base URL based on domainName
 */
export const getBaseUrl = (domainName: DOMAINS) => {
    return BASE_URL[domainName];
};

/**
 * @method API
 * @param isProduction
 * it returns complete API url (based on the environment )
 */
export const API = (domainName: DOMAINS, isProduction: boolean) => {
    const API_URL = getBaseUrl(domainName);
    const GEO_URL = isProduction ? getBaseUrl('GEOAPI_PROD') : getBaseUrl('GEOAPI_QA');
    return Object.freeze({
        quicksight: {
            getDashboardEmbedUrl: `https://f0beozxwyb.execute-api.eu-central-1.amazonaws.com/${
                isProduction ? 'prod' : 'dev'
            }`
        },
        supplier_dashboard: {
            pending_tasks: `${API_URL}api/search/task`,
            submitScopeCertificate: `${API_URL}api/task-manager/update-status`,
            getTaskDetails: `${API_URL}api/task-manager/review/$taskId`
        },
        admin: {
            validateData: `${API_URL}admin/data/validate`,
            importData: `${API_URL}admin/data/import`,
            conflictDataType: `${API_URL}admin/data/conflict-types`,
            exportConflicts: `${API_URL}admin/data/export-conflicts?type=$1`,
            resetPassword: `${API_URL}admin/reset-password`,
            getAllCompanies: `${API_URL}admin/companies`,
            getML: `${API_URL}admin/ml?company-id=$companyId`,
            generateOrdersQRCodesJson: `${API_URL}admin/orders/qr-data`,
            sendEmailRequest: `${API_URL}admin/generate-forget-password-link`,
            uploadBlueprint: `${API_URL}admin/generate-s3-url/tbot`,
            compliance: `${API_URL}api/customrating/sustainability_label`,
            getAvailableCalculationBuckets: `${API_URL}admin/getAllowedBuckets`,
            uploadCalculationDataSets: `${API_URL}admin/uploadToS3`,
            triggerBatchOperation: `${API_URL}api/batch-operation/create`,
            batchOperationStatus: `${API_URL}api/batch-operation/status`,
            supplierStatistics: `${API_URL}admin/supplier-statistics/$supplierId`,
            getAllApiKeys: `${API_URL}admin/getAllApiKeys`,
            generateNewApiKey: `${API_URL}admin/generate-new-apiKey`,
            deleteApiKey: apiKey => `${API_URL}admin/deleteApiKey/${apiKey}`
        },
        audits: {
            auditsFilter: `${API_URL}api/audits/filter-list`,
            getAudits: `${API_URL}api/search/facility_audit`,
            getAuditDetails: `${API_URL}api/audits/$auditId`,
            saveAudit: `${API_URL}api/audits/`,
            updateAudit: `${API_URL}api/audits/$auditId`,
            deleteAudit: `${API_URL}api/audits/$auditId`,
            addNewAudit: `${API_URL}api/audits/add-new-form-data`,
            getTemplates: `${API_URL}api/audits/templates/$templateId?supplier-id=$supplierId&facility-id=$facilityId`,
            uploadFile: `${API_URL}evidence/uploadNewDoc`,
            getFile: `${API_URL}evidence/getEvidence`,
            removeFile: `${API_URL}evidence/removeAssociation`,
            getSupplierAudits: `${API_URL}api/audits/supplier-profile-audits?supplierId=$1`,
            getFacilityProfileAudits: `${API_URL}api/audits/facility-profile-audits?facilityId=$1`,
            getAuditSettings: `${API_URL}api/settings/company/audit-settings`,
            createAuditNonConformanceCategory: `${API_URL}api/settings/company/audit-settings/non_conformance_categories`,
            createAuditNonConformanceSubCategory: `${API_URL}api/settings/company/audit-settings/$id/add-sub-category`,
            updateAuditNonConformanceCategory: `${API_URL}api/settings/company/audit-settings/$id`,
            updateAuditNonConformanceSubCategory: `${API_URL}api/settings/company/audit-settings/$category-id/sub-category/$subCategory-id`,
            deleteAuditNonConformanceCategory: `${API_URL}api/settings/company/audit-settings/$id`,
            deleteAuditNonConformanceSubCategory: `${API_URL}api/settings/company/audit-settings/$category-id/sub-category/$subcategory-id`,
            createNonConformity: `${API_URL}api/audits/$auditId/nc-category/$nccId`,
            createNonConformityInSubCategory: `${API_URL}api/audits/$auditId/nc-category/$nccId/sub-category/$sccId`,
            updateNonConformityInSubCategory: `${API_URL}api/audits/$auditId/nc-category/$nccId/sub-category/$sccId/sub-nc/$sncId`,
            deleteNonConformityInSubCategory: `${API_URL}api/audits/$auditId/nc-category/$nccId/sub-category/$sccId/sub-nc/$sncId`,
            updateNonConformity: `${API_URL}api/audits/$auditId/nc-category/$nccId/nc/$ncId`,
            deleteNonConformity: `${API_URL}api/audits/$auditId/nc-category/$nccId/nc/$ncId`,
            getAuditHistory: `${API_URL}api/audits/audit-history?auditId=$auditId`,
            getAuditTemplates: `${API_URL}api/audit-drafts/audit-templates`,
            getFacilityAuditDrafts: `${API_URL}api/search/facility_audit_drafts`,
            auditDrafts: `${API_URL}api/audit-drafts`,
            deleteDraft: `${API_URL}api/audit-drafts/$draftId`,
            auditExtracted: `${API_URL}api/audit-drafts/extraction-form-config?auditDraftId=$draftId`,
            saveDraft: `${API_URL}api/audit-drafts/$draftId/save-draft`,
            draftToCreateAudit: `${API_URL}api/audit-drafts/$draftId/create-audit`,
            nonConformityTemplate: `${API_URL}api/audits/config/non-conformities`
        },
        certificateManager: {
            getCertificates: `${API_URL}api/certificate/config/$type`,
            upload: `${API_URL}api/certificate/uploadNewDoc`,
            discardCertificates: `${API_URL}api/certificate/discard`,
            updateCertificate: `${API_URL}api/certificate/id/$certificateId`,
            upsertCertificate: `${API_URL}api/certificate/details?certId=$certId`,
            deleteCertificate: `${API_URL}api/certificate/id/$certificateId`,
            deleteFile: `${API_URL}api/certificate/file`,
            downloadFile: `${API_URL}api/certificate/id/$certificateId?fileName=$filename`
        },
        dashboard: {
            getSupplierView: `${API_URL}api/dashboard/getSupplier/$supplierId`,
            getFacilityview: `${API_URL}api/dashboard/getFacility/$facilityId`,
            getMapFilter: `${API_URL}api/dashboard/filter-list`,
            getSupplierFacility: `${API_URL}api/dashboard/getFacilities/$supplierId`,
            getAllFacilities: `${API_URL}api/dashboard/getAllFacilities`,
            getSupplierInfo: `${API_URL}api/charts/suppliers?selectionOption=$selectionOption&filterOption=$filterOption`,
            getStyleInfo: `${API_URL}api/dashboard/getStyleInfo?filter1=$1&filter2=$2&option=$3`
        },
        charts: {
            getConfig: `${API_URL}api/charts/config`,
            getInfo: `${API_URL}api/charts/data?category=$category&criteria=$criteria&filterCriteria=$filterCriteria`,
            getConfigV2: `${API_URL}api/charts/v2/config`,
            getFavConfig: `${API_URL}api/charts/v2/fav-config`,
            createFavChart: `${API_URL}api/charts/v2/fav-chart`,
            getFilters: `${API_URL}api/charts/filter-list/$itemId?customFieldId=$customFieldId`,
            getChartData: `${API_URL}api/charts/v2/data`,
            exportChartData: `${API_URL}api/data-export/charts`
        },
        maps: {
            getAllTR: `${API_URL}api/traceability-request/getDashboardData`,
            getAllStyles: `${API_URL}api/company/getStyleDashboardData`
        },
        common: {
            searchCities: `${API_URL}api/geo/search/city`,
            getCountries: `${API_URL}api/geo/country/getAll`,
            getStates: `${API_URL}api/geo/state/getByCountry/$1`,
            getCities: `${API_URL}api/geo/city/getByState/$1`,
            getAllSuppliers: `${API_URL}api/company/supplier/all`,
            uploadFile: `${API_URL}evidence/uploadNewDoc`,
            downloadFile: `${API_URL}evidence/getDoc?evidenceId=$fileId`,
            getFileName: `${API_URL}evidence/getPOFileName?evidenceId=$fileId`,
            getMasterData: `${API_URL}api/master-data/get`,
            getDataExport: `${API_URL}api/data-export/`,
            longPolling: `${API_URL}api/background-task/search`
        },
        auth: {
            login: `${API_URL}login`,
            logout: `${API_URL}logout`,
            forgotPassword: `${API_URL}user/reset-password`,
            forgotPasswordWithOutuserEmailflow: `${API_URL}user/reset-password-system`,
            resetPassword: `${API_URL}user/update-password`,
            getUser: `${API_URL}api/secured/user/`,
            forgetPasswordTokenValidate: `${API_URL}user/valid-token/$token`,
            getAuthToken: `${API_URL}api/secured/user/api-token`,
            getNewAuthToken: `${API_URL}user/refreshtoken`,
            saveFilter: `${API_URL}api/secured/user/save-filter`
        },
        sso: {
            getSSOOptionsEmail: `${API_URL}tenant-config?email-id=$email`,
            getSSOOptionsDomain: `${API_URL}tenant-config?domain=$domain`,
            isSSOEnabled: `${API_URL}tenant-config/sso-enabled?email-id=$email`
        },
        translate: {
            getTranslatedText: `${API_URL}api/translate`,
            getSupportedLanguage: `${API_URL}api/translate/get-all-language`
        },
        assessment: {
            getAll: `${API_URL}api/search/assessment`,
            getAssessmentReceivedFilter: `${API_URL}api/assessment/assessment-received/filter-list`,
            getAssessmentLaunchedFilter: `${API_URL}api/assessment/assessment-launched/filter-list`,
            getAssessmentsLaunched: `${API_URL}api/assessment/getAllAssessmentsByMe`,
            getSuppliersAndFacilities: `${API_URL}api/company/getSupplierAndFacility`,
            launchAssessment: `${API_URL}api/assessment/launchAssessment`,
            getSurveyQuestions: `${API_URL}api/assessment/getQuestion`,
            evidenceFileUpload: `${API_URL}evidence/uploadFile`,
            saveResponse: `${API_URL}api/response/save`,
            getPreview: `${API_URL}api/assessment/getPreview`,
            getSurveyStatus: `${API_URL}api/assessment/getQuestionCount`,
            getSurveyQuestionAnsweredStatus: `${API_URL}api/assessment/getQuestionCount`,
            getEvidence: `${API_URL}evidence/getEvidence`,
            downloadEvidence: `https://s3.ap-southeast-1.amazonaws.com/tt-evidence-qe`,
            removeAssociation: `${API_URL}evidence/removeAssociation`,
            remindAssessment: `${API_URL}api/assessment/remind`,
            submitAssessment: `${API_URL}api/assessment/submit`,
            approveAssessment: `${API_URL}api/assessment/approve`,
            reopenAssessment: `${API_URL}api/assessment/reopen`,
            getCommentForAssessment: `${API_URL}api/comment/getCommentForAssessment?assessmentId=$1`,
            getCommentByQuestion: `${API_URL}api/comment/getCommentByQuestion?assessmentId=$1&questionId=$2`,
            getQuestionWithComment: `${API_URL}api/comment/getQuestionWithComment?assessmentId=$1`,
            resolveQuestion: `${API_URL}api/comment/resolveQuestion`,
            saveComment: `${API_URL}api/comment/save`,
            getSubAssessments: `${API_URL}api/assessment/getAllSubAssessments?assessmentId=$1&launched=$2`,
            exportAssessmentData: `${API_URL}api/data-export/assessments`,
            getUnansweredMandatoryQuestionIds: `${API_URL}api/response/get/mandate-to-reponse/$assessmentId`
        },
        questionnaire: {
            getAll: `${API_URL}api/questionnaire/getAll`,
            getQuestionsByTemplateId: `${API_URL}api/question/getQuestionsByTemplateId?templateId=$1`,
            get: `${API_URL}api/questionnaire/get/$questionnaireId`,
            create: `${API_URL}api/questionnaire/create`,
            save: `${API_URL}api/questionnaire/save`,
            delete: `${API_URL}api/questionnaire/delete`,
            getByMaterial: `${API_URL}api/classificationMapping/getByMaterial?material=$1`,
            getValueProcess: `${API_URL}api/classificationMapping/getValueProcessForFilter?material=$1`,
            getSubGroup: `${API_URL}api/classificationMapping/getSubGroupForFilter?material=$1&valueProcess=$2`,
            questionCount: `${API_URL}api/question/getQuestionsCount`,
            getQuestions: `${API_URL}api/question/getQuestions`
        },
        suppliers: {
            getAll: `${API_URL}api/company/getSupplierAndFacility?searchMultiTire=$1`,
            getAllFacilities: `${API_URL}api/company/supplier/facility`,
            getSupplier: `${API_URL}api/company/supplier/$1`,
            getSubSupplier: `${API_URL}api/company/sub-supplier/$supplier-id/$company-id`,
            getAllSuppliers: `${API_URL}api/search/supplier_search`,
            getAllSuppliersProfile: `${API_URL}api/search/supplier_profile`,
            getAcceptedUnAcceptedSupplierFilters: `${API_URL}api/company/invited-supplier/filter-list`,
            getUninvitedSupplierFilters: `${API_URL}api/company/uninvited-supplier/filter-list`,
            getTerminatedSupplierFilters: `${API_URL}api/company/uninvited-supplier/filter-list`,
            addSupplier: `${API_URL}api/company/addSupplier`,
            getAdditionalInfo: `${API_URL}api/additional-info/supplier/$supplierId`,
            registrationAssociationReminder: `${API_URL}api/company/reminder-email/$supplierId`,
            updateSupplierInvite: `${API_URL}api/company/updateInvite`,
            supplierInviteLink: `${API_URL}api/company/invite-link/$supplierId`,
            downloadSupplierTemplate: `${API_URL}excel-export/supplier/create-template`,
            importSuppliers: `${API_URL}excel-import/supplier`,
            getSupplierConflicts: `${API_URL}supplier/conflict`,
            getAllSubSuppliersProfile: `${API_URL}api/search/sub_supplier_profile`,
            getSubSupplierFilters: `${API_URL}api/company/sub-supplier/filter-list`,
            terminate: `${API_URL}api/company/terminate-supplier?companyId=$1&supplierId=$2`,
            archiveSupplier: `${API_URL}supplier/archiveSupplier/$supplierId`
        },
        facilities: {
            getFacility: `${API_URL}api/facility/profile/$1`,
            getSubSupplierFacility: `${API_URL}api/facility/profile/$facilityId/$companyId`,
            saveFacilityProfile: `${API_URL}api/facility/profile`,
            getAllFacilities: `${API_URL}api/search/facility_profile`,
            getSubSupplierFacilities: `${API_URL}api/search/sub_supplier_facility_profile`,
            getFacilityFilters: `${API_URL}api/facility/filter-list`,
            getSubSupplierFacilityFilters: `${API_URL}api/facility/sub-supplier/filter-list`,
            downloadFacilityTemplate: `${API_URL}excel-export/facility/create-template`,
            importFacilities: `${API_URL}excel-import/facility-create`
        },
        todo: {
            getTodoTask: `${API_URL}api/task/get?supplierId=$1`,
            createTask: `${API_URL}api/task/add`,
            addTaskItem: `${API_URL}api/task/items/add`,
            removeTaskItem: `${API_URL}api/task/items/delete?itemId=$1`,
            editTaskItem: `${API_URL}api/task/items/update`
        },

        profile: {
            getCompanyProfile: `${API_URL}api/company/getCompanyProfile/$1`,
            updateCompanyProfile: `${API_URL}api/company/update`,
            getAllFacility: `${API_URL}api/facility/getFacilityListByCompany/$1`,
            associateSupplier: `${API_URL}api/company/associateSupplier`,
            associateExistingEmployer: `${API_URL}api/company/associate`,
            newSupplierSingUp: `${API_URL}user/signUpNewSupplier`,
            addFacility: `${API_URL}api/facility/add`,
            getFacility: `${API_URL}api/facility/get/$1`,
            updateFacility: `${API_URL}api/facility/update`,
            deleteFacility: `${API_URL}api/facility/delete/$1`,
            getStandards: `${API_URL}api/facility/getStandards`,
            uploadCompanyLogo: `${API_URL}api/company/uploadLogo`,
            isDuplicateReferenceId: `${API_URL}api/facility/reference-ids`
        },
        company: {
            associateSupplier: `${API_URL}api/company/associateSupplier`,
            newSupplierSignUp: `${API_URL}user/signUpNewSupplier`,
            newCompanyUserSignUp: `${API_URL}user/signUpCompanyUser`,
            existingEmployerAssociation: `${API_URL}api/company/associate`,
            getAllStyles: `${API_URL}api/company/getStyles`,
            getStyles: `${API_URL}api/company/getStyles`,
            getDefaultMasterData: `${API_URL}api/company/master-data`,
            supplierSignupConfig: `${API_URL}user/signup-supplier-config/$signupCode`,
            getSupplierLink: `${API_URL}api/company/supplier-tier-link`
        },
        t_ems: {
            getFilters: `${API_URL}api/traceability/product-evidence/filter-list`,
            getAllTrs: `${API_URL}api/search/t_ems`
        },
        traceabilityRequest: {
            searchStyle: `${API_URL}api/search/style_meta_data`,
            searchMaterial: `${API_URL}api/search/mtr_lib_meta_data`,
            getEntities: `${API_URL}api/traceability/config/product?entity=$entity`,
            createTr: `${API_URL}api/traceability/$createApi/create`,
            archiveTr: `${API_URL}api/traceability/supply-chain/archive-tr/$trId`,
            lockTr: `${API_URL}api/traceability/supply-chain/lock/$trId`,
            unlockTr: `${API_URL}api/traceability/supply-chain/unlock/$trId`,
            getSupplyChainData: `${API_URL}api/traceability/supply-chain/get/$trId`,
            getSupplyChainTreeData: `${API_URL}api/traceability/supply-chain/tree-view/$trId`,
            getSupplyChainBOMData: `${API_URL}api/traceability/supply-chain/get-style-bom/$trId`,
            getAddMoreInput:
                API_URL +
                `api/traceability/mapping/Product?entityType=$entityType&mappingType=RAW_MATERIALS&trId=$trId`,
            getFilters: `${API_URL}api/traceability/supply-chain/filter-list`,
            getAllTrs: `${API_URL}api/search/t_trace`,
            saveSupplyChain: `${API_URL}api/traceability/supply-chain/save/$trId`,
            launchAndProceedSupplyChain: `${API_URL}api/traceability/supply-chain/process/$trId`,
            reusableSupplyChain: `${API_URL}api/traceability/supply-chain/reusable-supply-chain/$trId`,
            processReusableSupplyChain: `${API_URL}api/traceability/supply-chain/reusable-supply-chain/process/$trId`,
            getEvidenceCollectionData: `${API_URL}api/traceability/product-evidence/get/$trId`,
            saveEvidenceCollectionData: `${API_URL}api/traceability/product-evidence/save/$trId`,
            processEvidenceCollectionData: `${API_URL}api/traceability/product-evidence/process/$trId`,
            getAddMoreCertificatesInput: `${API_URL}api/traceability/product-evidence/mappings?trId=$trId`,
            evidenceCollectionDetailedView: `${API_URL}api/traceability/product-evidence/view/$trId`,
            getSupplyChainForProductEvidence: `${API_URL}api/traceability/product-evidence/get-supply-chain/$trId`,
            updateSupplyChainForTRProductEvidence: `${API_URL}api/traceability/product-evidence/send-evidences/$trId/$entityId`,
            updateSupplyChainForStyleMaterialProductEvidence: `${API_URL}api/traceability/product-evidence/send-evidences/$trId`,
            getAllProductEvidenceRequestsByEntity: `${API_URL}api/traceability/product-evidence/$entity/$entityId`,
            fetchProductEvidence: `${API_URL}api/traceability/product-evidence/fetch-evidence/$trId`,
            lockTems: `${API_URL}api/traceability/product-evidence/lock/$trId`,
            unlockTems: `${API_URL}api/traceability/product-evidence/unlock/$trId`,
            getTrUIMetadata: `${API_URL}api/traceability/supply-chain/get-tr-ui-metadata/$trId`
        },
        traceability: {
            getAllLaunchedTRs: `${API_URL}api/traceability-request/getAll?launched=by`,
            getAllReceivedTRs: `${API_URL}api/traceability-request/getAll?launched=to`,
            getLaunchedTRFilter: `${API_URL}api/traceability-request/filter-list?launched=by`,
            getReceivedTRFilter: `${API_URL}api/traceability-request/filter-list?launched=to`,
            addTR: `${API_URL}api/traceability-request/add`,
            createTr: `${API_URL}api/traceability-request/saveAndProcess`,
            getAllSubTRs: `${API_URL}api/traceability-request/getAllSubTRs?trId=$1&launched=$2`,
            uploadPO: `${API_URL}evidence/uploadNewDoc`,
            getPO: `${API_URL}evidence/getDoc?evidenceId=$1`,
            getPOFileName: `${API_URL}evidence/getPOFileName?evidenceId=$1`,
            getCreateTRMetadata: `${API_URL}api/traceability-request/getMetadata?section=create_tr`,
            getMetadata: `${API_URL}api/traceability-request/getMetadata?section=$1&id=$2`,
            saveVpToFacility: `${API_URL}api/traceability-request/saveVpToFacility`,
            getProductFlow: `${API_URL}api/traceability-request/getProductFlow?trId=$1`,
            getFibreMaterials: `${API_URL}api/traceability-request/getMaterialForInput?input=Fibre`,
            saveFibreMaterial: `${API_URL}api/traceability-request/save`,
            submit: `${API_URL}api/traceability-request/submit`,
            approve: `${API_URL}api/traceability-request/approve`,
            getAllCertifications: `${API_URL}api/traceability-request/certification/files?trId=$trId`,
            uploadCertifications: `${API_URL}api/traceability-request/certification`,
            addShipmentDetails: `${API_URL}api/traceability-request/shipment-info`,
            getShipmentDetails: `${API_URL}api/traceability-request/shipment-info?trId=$1`
        },
        styles: {
            createStyle: `${API_URL}api/styles/create`,
            editStyle: `${API_URL}api/styles/edit`,
            cloneStyles: `${API_URL}api/styles/clone`,
            getStyles: `${API_URL}api/styles/$1`,
            styleConfigs: `${API_URL}api/styles/configs`,
            getAllProducts: `${API_URL}api/search/style`,
            getStyleDetails: `${API_URL}api/styles/view/$styleId`,
            getSupplyChainDetails: `${API_URL}api/styles/$styleId/supply-chain`,
            getProductsTemplateFilter: `${API_URL}api/styles/filter-list`,
            searchArticle: `${API_URL}api/search/mtr_lib_ut`,
            viewQrCode: `${API_URL}api/styles/unique-code`,
            archiveStyle: `${API_URL}api/styles/archive-style/$styleId`,
            compliance: `${API_URL}api/styles/compliance/$styleId`,
            getByProductType: `${API_URL}api/styles/type/$productType`,
            downloadStyleTemplate: `${API_URL}excel-export/style/create-template`,
            importStyles: `${API_URL}excel-import/style`
        },
        user: {
            consentUpdate: `${API_URL}api/secured/user/update-consent`,
            languageUpdate: `${API_URL}api/secured/user/update-lang?language=$language`,
            userProfileUpdate: `${API_URL}api/secured/user/profile`,
            userPasswordUpdate: `${API_URL}api/secured/user/password`,
            userPasswordValidate: `${API_URL}api/secured/user/validate-password`,
            emailTimeFrameUpdate: `${API_URL}api/secured/user/email-notification?emailTimeFrameId=$emailTimeFrame`,
            getEmailPreference: `${API_URL}api/secured/user/fetch-initial-email-preference`
        },
        userManagement: {
            getAllGroups: `${API_URL}api/search/group`,
            getGroup: `${API_URL}api/usermanagement/group/$1`,
            getGroupConfig: `${API_URL}api/usermanagement/group/config`,
            deleteGroup: `${API_URL}api/usermanagement/group/$1/deactivate`,
            saveGroup: `${API_URL}api/usermanagement/group`,
            getUserConfig: `${API_URL}api/usermanagement/users/config`,
            usersFilter: `${API_URL}api/usermanagement/users/filter-list`,

            getAllUsers: `${API_URL}api/search/user`,
            getAllUsersWithDefaultFiltering: `${API_URL}api/usermanagement/users/search`,
            getUser: `${API_URL}api/usermanagement/users/$1`,
            saveUser: `${API_URL}api/usermanagement/users`,
            updateUser: `${API_URL}api/usermanagement/users`,
            activateUser: `${API_URL}api/usermanagement/users/$1/activate`,
            deActivateUser: `${API_URL}api/usermanagement/users/$1/deactivate`
        },
        settings: {
            style: {
                getSettings: `${API_URL}api/settings/company/style/`,
                saveProductCategory: `${API_URL}api/settings/company/style/product-category`,
                saveStyleColorSettings: `${API_URL}api/settings/company/style/color`,
                saveKVSettings: `${API_URL}api/settings/company/style/kv/$1`
            },
            audit: {
                getAuditValidityAndConfig: `${API_URL}api/settings/company/audit-settings/audit-validity`,
                saveAuditValidity: `${API_URL}api/settings/company/audit-settings/audit-validity`,
                saveAuditPriority: `${API_URL}api/settings/company/audit-settings/nc-priority`,
                getAuditPriority: `${API_URL}api/settings/company/audit-settings/nc-priority`,
                updateAuditPriority: `${API_URL}api/settings/company/audit-settings/nc-priority/category-id/$1`,
                deleteAuditPriority: `${API_URL}api/settings/company/audit-settings/nc-priority/category-id/$1`
            },
            integration: {
                getItems: `${API_URL}api/integration/$companyId/api`,
                getAlias: `${API_URL}api/master-data/alias/$aliasName`
            },
            api: {
                getApiKey: `${API_URL}api/settings/company/api-settings/get-api-key`,
                generateApiKey: `${API_URL}api/settings/company/api-settings/generate-api-key`,
                deleteApiKey: `${API_URL}api/settings/company/api-settings/delete-api-key`
            }
        },
        orders: {
            ordersFilter: `${API_URL}api/order/filter-list`,
            getOrders: `${API_URL}api/search/order_lot`,
            uploadCertificate: `${API_URL}evidence/uploadNewDoc`,
            inboundConfig: `${API_URL}api/order/inbound-config`,
            saveInbound: `${API_URL}api/order/inbound`,
            productionConfig: `${API_URL}api/order/production-config`,
            production: `${API_URL}api/order/production`,
            getRepackageConfig: `${API_URL}api/order/repackage-config`,
            createRepackage: `${API_URL}api/order/repackage`,
            outboundConfig: `${API_URL}api/order/outbound-config`,
            saveOutbound: `${API_URL}api/order/outbound`,
            searchArticleOrStyle: `${API_URL}api/search/sml`,
            searchStyle: `${API_URL}api/search/style_ut`,
            searchArticle: `${API_URL}api/search/mtr_lib_ut`,
            searchLot: `${API_URL}api/search/lot_ut`,
            getOrdersSupplyChain: `${API_URL}api/order/fetch-supply-chain?orderId=$1`,
            getTraceabilitySupplyChain: `${API_URL}api/traceability/supply-chain/fetch-supply-chain/$1`,
            lotOrigin: `${API_URL}api/order/track-lot?orderId=$transactionId`,
            referenceIdIsUnique: `${API_URL}api/order/validate/external-id/$reference-id`,
            getCertificateList: `${API_URL}api/order/upload-config?orderId=$transaction-id`,
            updateCertificates: `${API_URL}api/order/update-doc?orderId=$transaction-id`,
            getRequiredCertificates: `${API_URL}api/order/soa-id/$soa-id/type/style`
        },
        orders_lite: {
            inboundConfig: `${API_URL}api/transaction-lite/inbound-config`,
            outboundConfig: `${API_URL}api/transaction-lite/outbound-config`,
            save: `${API_URL}api/transaction-lite/create-event`,
            ordersFilter: `${API_URL}api/transaction-lite/filter-list`,
            getOrders: `${API_URL}api/search/transaction_lite_event`,
            lotOrigin: `${API_URL}api/transaction-lite/track-lot?eventId=$eventId`,
            getCertificateList: `${API_URL}api/transaction-lite/upload-config?liteEventId=$transaction-id`,
            updateCertificates: `${API_URL}api/transaction-lite/update-doc?liteEventId=$transaction-id`
        },
        rawMaterials: {
            getConfig: `${API_URL}api/library/material/configs`,
            getMaterialLibraryFilter: `${API_URL}api/library/material/filter-list`,
            getAllMaterials: `${API_URL}api/search/material_library`,
            createLibrary: `${API_URL}api/library/material`,
            getMaterialDetail: `${API_URL}api/library/material/view/$id`,
            getMaterialStyleAssociation: `${API_URL}api/library/material/view/$id/style-association?page=$pageNo`,
            cloneMaterial: `${API_URL}api/library/material/clone`,
            getMaterialOrdersAssociation: `${API_URL}api/library/material/$id/supply-chain`,
            viewQrCode: `${API_URL}api/library/material/unique-code`,
            getAdditionalInfo: `${API_URL}api/additional-info/ml/$mlId`,
            archiveMaterial: `${API_URL}api/library/material/archive-material/$mlId`,
            downloadMaterialTemplate: `${API_URL}excel-export/ml/create-template`,
            importMaterials: `${API_URL}excel-import/ml`
        },
        qr: {
            fetchQRDetails: `${API_URL}api/order/unique-code/$qrCode`
        },
        notification: {
            latestReleaseUpdate: `${API_URL}user/notification/release/latest`,
            adminReleaseUpdate: `${API_URL}api/notification`
        },
        entityCustomization: {
            getCustomFieldInfo: `${API_URL}api/custom-field/get-info`,
            updateCustomFieldInfo: `${API_URL}api/custom-field/update/$entity/$id`
        },
        products: {
            productConfig: `${API_URL}api/product-task/search`,
            filters: `${API_URL}api/product-task/filter-list`,
            options: `${API_URL}api/product-task/options`,
            getScoreHistorySupplier: `${API_URL}api/product-task/score-history/$versionId`,
            submitData: `${API_URL}api/product-task/submit`,
            saveData: `${API_URL}api/product-task/save`,
            saveData_v1: `${API_URL}api/product-task/product/$productId/product-declaration/$taskId`,
            bulkUpdate: `${API_URL}api/product-task/bulk-update`,
            finishedProductsFilters: `${API_URL}api/retailer/filter-list`,
            finishedProductsList: `${API_URL}api/retailer/search`,
            getScoreInfo: `${API_URL}api/retailer/get-info`,
            finishedProductDetail: `${API_URL}api/search/next-previous/$entity`,
            finishedProductDetailTemp: `${API_URL}api/retailer/next-previous/$productId`,
            downloadProductData: `${API_URL}api/product-task/download`,
            uploadProductData: `${API_URL}api/product-task/upload`,
            brandProductScoreEcData: `${API_URL}api/product-task/get-info`,
            productTaskDetail: `${API_URL}api/product-task/detail`,
            getScoreHistory: `${API_URL}api/retailer/score-history/$versionId`,
            getVersionHistories: `${API_URL}api/retailer/version-history-list`,
            getVersionHistoriesSupplier: `${API_URL}api/product-task/version-history-list`,
            editScore: `${API_URL}api/retailer/edit-score`,
            simulationProductAutoCompleteListBrand: `${API_URL}api/product-task/auto-suggest`,
            simulationProductAutoCompleteListRetailer: `${API_URL}api/retailer/auto-suggest`,
            simulationGetProductTask: `${API_URL}api/product-task/id/$productId`,
            productTaskSimulation: `${API_URL}api/product-task/simulate`,
            getLatestScoreToEdit: `${API_URL}api/retailer/latest-score-history/$productId`,
            retailerSupplierDeclarationEdit: `${API_URL}api/product-task/submit/product/$productId/product-declaration/$taskId`,
            updateShowApiScore: `${API_URL}api/retailer/updateShowApiScoreStatus/$productId`,
            submitAllProducts: `${API_URL}api/product-task/submit-all`,
            supplierProgramAndLabelsList: `${API_URL}api/search/product_declaration_label`,
            labelsAndProgramConfig: `${API_URL}api/product-declaration/labels/options`,
            getLabelsList: `${API_URL}api/product-declaration/labels/$labelType`,
            getLabelConfig: `${API_URL}api/product-declaration/labels/calculationBuilderValues/$labelId`,
            createLabel: `${API_URL}api/product-declaration/labels/create`,
            supplierProgramAndLabelsFilterList: `${API_URL}api/product-declaration/labels/filter-list`,
            getLabelData: `${API_URL}api/product-declaration/labels/get/$labelId`,
            updateLabel: `${API_URL}api/product-declaration/labels/update/$labelId`,
            getProductCount: `${API_URL}api/product-declaration/labels/product-count/$labelId`,
            deactivateLabel: `${API_URL}api/product-declaration/labels/deactivate/$labelId`,
            getMasterAndLabelData: `${API_URL}api/retailer/master-and-label-data`,
            getSupplierProductCount: `${API_URL}api/product-declaration/labels/product-count/$labelId`,
            getReTriggerScore: `${API_URL}api/product-task/score/$productId`,
            getProductsCount: `${API_URL}api/retailer/productCount/$productId/type/$apiScoreDeactivateType`,
            getReactivateOptions: `${API_URL}api/retailer/apiScoreDeactivateType/$productId `,
            productIntegrationLogList: `${API_URL}api/search/product_integration_log`,
            productIntegrationLogFilters: `${API_URL}api/product/integration-log/filter-list`,
            downloadProductLog: `${API_URL}api/product/integration-log/download-data/$productNumber`,
            reRunIntegrationProcess: `${API_URL}api/product/integration-log/reRunIntegrationProcess`,
            getProductionIntegrationDetailData: `${API_URL}api/product/integration-log/product-detail/$productNumber`,
            getDownloadintegrationLogData: `${API_URL}api/product/integration-log/download-data`
        },
        transactions: {
            getOrdersSupplyChain: `${API_URL}api/order/fetch-supply-chain?orderId=$1`,
            getOrders: `${API_URL}api/search/tt_transaction`,
            ordersFilter: `${API_URL}api/tt-transaction/filter-list`,
            submitDraftOrders: `${API_URL}api/tt-transaction/submit`,
            submitAllDraftOrders: `${API_URL}api/tt-transaction/submit-all`,
            downloadTransactionsData: `${API_URL}api/tt-transaction/download-template`,
            uploadTransactionsData: `${API_URL}api/tt-transaction/import`,
            getCertificateList: `${API_URL}api/tt-transaction/upload-config?txId=$transaction-id`,
            deleteSelectedTransactions: `${API_URL}api/tt-transaction/delete-multiple-transactions`,
            deleteSelectedSubmittedTransactions: `${API_URL}api/tt-transaction/delete-multiple-sub-transactions`,
            deleteOrder: `${API_URL}api/order/delete?orderId=$orderId`,
            getTransaction: `${API_URL}api/tt-transaction/$transactionId/trace`,
            updateCertificates: `${API_URL}api/tt-transaction/update-doc?txId=$transaction-id`,
            getMaterial: `${API_URL}api/tt-transaction/getMaterial`,
            inboundConfig: `${API_URL}api/tt-transaction/inbound-config`,
            productionConfig: `${API_URL}api/tt-transaction/production-config`,
            outboundConfig: `${API_URL}api/tt-transaction/outbound-config`,
            submitTransaction: `${API_URL}api/tt-transaction/submit-UI`,
            searchStyle: `${API_URL}api/search/style_ut`,
            uploadCertificate: `${API_URL}evidence/uploadNewDoc`,
            searchArticle: `${API_URL}api/search/tt_transaction`,
            searchLot: `${API_URL}api/search/lot_ut`,
            searchArticleOrStyle: `${API_URL}api/search/sml`,
            referenceIdIsUnique: `${API_URL}api/order/validate/external-id/$reference-id`,
            getRequiredCertificates: `${API_URL}api/order/soa-id/$soa-id/type/style`,
            searchMaterial: `${API_URL}api/search/material_library`,
            searchSupplier: `${API_URL}api/search/supplier_search`,
            submitTransactions: `${API_URL}api/tt-transaction/submit-UI`,
            submitTransactionToLoApproval: `${API_URL}api/tt-transaction/submitTransaction-to-loApproval`,
            getTierConfig: `${API_URL}api/tt-transaction/get-tier-config`,
            getPOList: `${API_URL}api/search/po_linking`,
            cottonInboundConfig: `${API_URL}api/tt-transaction/cotton-inbound-config`,
            productionIntermediateConfig: `${API_URL}api/tt-transaction/cotton-inbound-config`,
            getFacilities: `${API_URL}api/search/facility_profile_cs`,
            getWaitingApprovalTransactionDetail: `${API_URL}api/tt-transaction/$transactionId`,
            getNotificationDetail: `${API_URL}api/tt-transaction/hasAccess`
        },
        evidences: {
            getEvidences: `${API_URL}api/search/tt_document_transformed`,
            evidencesFilter: `${API_URL}api/tt-document-transformed/filter-list`,
            uploadFile: `${API_URL}api/certificate/uploadNewDoc`,
            extractUploadedEvidence: `${API_URL}api/tt-document-transformed/extract`,
            submitEvidence: `${API_URL}api/tt-document-transformed/submit`,
            getSellersBuyersAndConsignees: `${API_URL}api/tt-transaction/inbound-config`,
            downloadCertificate: `${API_URL}api/certificate/download-certificate?certId=$certId`,
            downloadAdditionalCertificate: `${API_URL}api/certificate/download-additional-certificate?certId=$certId`,
            allCertificateNames: `${API_URL}api/certificate/all-certificate-names?certId=$certId`,
            removeDocument: `${API_URL}api/tt-document-transformed/remove-document?certId=$certId`,
            submitSCReview: `${API_URL}api/task-manager/update-status`,
            deleteEvidence: `${API_URL}api/tt-document-transformed/delete-multiple-evidences`,
            hasValidProductNames: `${API_URL}api/tt-document-transformed/valid-product-names`,
            matchingMaterialCompostion: `${API_URL}api/tt-document-transformed/matching-material-composition`,
            facilityListForCompany: `${API_URL}api/tt-document-transformed/list-facility`
        },
        poManagement: {
            getPOs: `${API_URL}api/search/po`,
            posFilter: `${API_URL}api/po/filter-list`,
            deletePOs: `${API_URL}api/po`,
            submitPOs: `${API_URL}api/po/submit`,
            downloadPOData: `${API_URL}api/po/download-template`,
            uploadPOData: `${API_URL}api/po/import`,
            getPoNumber: `${API_URL}api/po/get-ponumber?styleID=$styleID&supplierID=$supplierID`,
            getPODetail: (poId, styleId) => `${API_URL}api/po/${poId}/${styleId}`
        },
        reports: {
            getModules: `${API_URL}api/report/modules`,
            getReports: `${API_URL}api/report/$module/reports-configs-with-latest-generated`,
            getReportConfigs: `${API_URL}api/report/$module/reports-configs`,
            getFilterConfigs: `${API_URL}api/report/$processor/filter-configs`,
            downloadReport: `${API_URL}api/report/generated/$reportId/$format`,
            generateReport: `${API_URL}api/report/request-new`
        },
        scopeCertificates: {
            getScopeCertificates: `${API_URL}api/search/tt_document_transformed`,
            scopeCertificatesFilter: `${API_URL}api/tt-document-transformed/filter-list`,
            uploadFile: `${API_URL}api/certificate/uploadNewDoc`,
            extractUploadedScopeCertificate: `${API_URL}api/tt-document-transformed/extract`,
            submitScopeCertificate: `${API_URL}api/tt-document-transformed/submit`,
            getSuppliersAndFacilities: `${API_URL}api/tt-document-transformed/inbound-config`,
            downloadCertificate: `${API_URL}api/certificate/download-certificate?certId=$certId`,
            removeDocument: `${API_URL}api/tt-document-transformed/remove-document?certId=$certId`,
            getScopeCertificateDetail: `${API_URL}api/tt-document-transformed/view/$certId`,
            hasValidSCForCompany: `${API_URL}api/tt-document-transformed/has-valid-SC/$companyId`,
            hasValidSC: `${API_URL}api/tt-document-transformed/has-valid-SC`
        },
        taskManager: {
            getTasks: `${API_URL}api/search/task`,
            getTaskHistory: `${API_URL}api/search/tt_tasks_history`,
            tasksFilter: `${API_URL}api/task-manager/filter-list`,
            getTaskDetail: `${API_URL}api/task-manager/review/$taskId`,
            getTaskDetailView: `${API_URL}api/tt-document-transformed/tc-view`,
            updateTaskStatus: `${API_URL}api/task-manager/update-status`,
            updateWaitingForApprovalTaskStatus: `${API_URL}api/task-manager/update-tx-status`,
            getEntityForWaitingApprovalTransaction: `${API_URL}api/task-manager/task/$taskId`
        },
        materials_lite: {
            getMaterials: `${API_URL}api/search/material_library_lite`,
            getMaterialsFilter: `${API_URL}api/library/material/lite/filter-list`,
            getMaterialDetail: `${API_URL}api/library/material/lite/view/$id`,
            submitMaterials: `${API_URL}api/po/submit`,
            downloadMaterialData: `${API_URL}api/tt-transaction/download-template`,
            uploadMaterialData: `${API_URL}api/tt-transaction/import`
        },
        bom_lite: {
            getBom: `${API_URL}api/search/bom_lite`,
            getBomFilter: `${API_URL}api/bom/lite/filter-list`,
            getBOMDetail: `${API_URL}api/bom/lite/view/$id`,
            submitBom: `${API_URL}api/po/submit`,
            downloadBomData: `${API_URL}api/tt-transaction/download-template`,
            uploadBomData: `${API_URL}api/tt-transaction/import`
        },
        styles_lite: {
            getStyles: `${API_URL}api/search/style_lite`,
            getStylesFilter: `${API_URL}api/styles/lite/filter-list`,
            getStyleDetail: `${API_URL}api/styles/lite/view/$id`,
            submitStyles: `${API_URL}api/po/submit`,
            downloadStylesData: `${API_URL}api/tt-transaction/download-template`,
            uploadStylesData: `${API_URL}api/tt-transaction/import`
        },
        integrationLogs: {
            getLogs: `${API_URL}api/integration/search?&page=$pageNo&size=$pageSize`,
            logsFilter: `${API_URL}api/integration/filter-list`,
            downloadLogs: `${API_URL}api/integration/log/download/$id`,
            rerunLogs: `${API_URL}api/integration/log/trigger/$id`
        },
        geoApi: {
            getCities: `${GEO_URL}cities`,
            getCitiesBasedOnCountry: `${GEO_URL}countries/search`,
            getCitiesBasedOnState: `${GEO_URL}states/search`,
            getCountries: `${GEO_URL}countries`,
            getStatesBasedOnCountryId: id => {
                return `${GEO_URL}countries/${id}/states`;
            },
            getRegions: `${GEO_URL}regions`,
            getSubRegions: `${GEO_URL}sub-regions`,
            getStates: `${GEO_URL}states`,
            onImport: `${GEO_URL}import`,
            getImportCount: `${GEO_URL}import-triggers/count`,
            getImportDetails: `${GEO_URL}import-triggers`
        },
        higg: {
            saveHiggApi: `${API_URL}api/external-integration/higg/config`,
            getHiggApi: `${API_URL}api/external-integration/higg/config`,
            syncAudit: `${API_URL}api/external-integration/higg/syncData`
        }
    });
};
