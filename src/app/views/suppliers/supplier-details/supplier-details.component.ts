import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import FileSaver from 'file-saver';
import { default as _rollupMoment } from 'moment';
import * as _moment from 'moment';
import { environment } from '../../../../environments/environment';
import { AnalyticsService } from '../../../core/analytics/analytics.service';
import { CommonServices } from '../../../shared/commonServices/common.service';
import { CertificateManagerService } from '../../../shared/components/certificate-manager/certificate-manager.service';
import { LocalizationService } from '../../../shared/utils/localization.service';
import { AssessmentAuditService } from '../../assessment-audit/assessment-audit.service';
import { MaterialLibraryService } from '../../material-library/material-library.service';
import { StylesService } from '../../styles/styles.service';
import { SuppliersService } from '../suppliers.service';
import { SupplierProfile, ISupplierProfileUpdate } from './supplier-profile.model';
import { AuthService } from '../../../core';
import { CustomToastrService } from '../../../shared/commonServices/custom-toastr.service';
import { UsersService } from '../../user/brand-user-management/users/users.service';
import { UtilsService } from '../../../shared/utils/utils.service';

const moment = _rollupMoment || _moment;

export interface Valueprocess {
    name: string;
}

export interface Materials {
    name: string;
}

@Component({
    selector: 'app-supplier-details',
    templateUrl: './supplier-details.component.html',
    styleUrls: ['./supplier-details.component.scss']
})
export class SupplierDetailsComponent implements OnInit {
    FETCH_STYLE_SIZE = 100;
    FETCH_ML_SIZE = 100;
    pageLoading = true;
    todoTask;
    contact;
    contactInfo = { name: '', email: '', phoneNumber: '' };
    supplierProfile: SupplierProfile;
    supplierProfileUpdate: ISupplierProfileUpdate;
    editSupplierDetail = false;
    supplier;
    supplierData = { name: '', description: '' };
    analyticsPageOrigin = 'Suppliers Page';
    address;
    standards = [];
    masterData = [];
    env = environment;
    refId = null;

    moment = moment;

    editContactInfo = false;
    editProfileInfo = false;

    supplierId = '';
    countries = [];
    ratings = [];
    productsList = [];
    subsupplierList = [];
    materialsList = [];
    mlCount = 0;
    styleCount = 0;
    subsupplierCount = 0;
    facilityCount = 0;
    userCount = 0;
    users = [];
    audits = [];
    auditCount = 0;
    master_standards: any[];

    supplierProfileTypes = ['Basic Information'];
    supplierProfileType = this.supplierProfileTypes[0];
    additionalInfo;
    entity = 'SUPPLIER'; // 'ML', 'SUPPLIER'
    viewPage = 'SUPPLIER_VIEW'; // 'ML_VIEW', 'SUPPLIER_VIEW'
    viewType = 'FORM'; // 'FORM', 'TABLE', 'CARD'
    isFetchingAdditionalInfo = false;
    additionalInformation: string = 'Additional Information';
    additionalInformationPage: string = 'Addition Information Page';
    canEditSupplierProfile = true;

    get checkAccess(): (name: string) => boolean {
        return this.auth.haveAccess.bind(this.auth);
    }

    constructor(
        private route: ActivatedRoute,
        private supplierService: SuppliersService,
        private commonServices: CommonServices,
        private analyticsService: AnalyticsService,
        private localeService: LocalizationService,
        private toastr: CustomToastrService,
        private styleService: StylesService,
        private mlService: MaterialLibraryService,
        public certificateManagerService: CertificateManagerService,
        private assessmentAuditService: AssessmentAuditService,
        public auth: AuthService,
        private usersService: UsersService,
        public utilService: UtilsService
    ) {
        this.supplierProfile = {
            id: null,
            supplierUid: '',
            name: '',
            description: '',
            associatedSince: '',
            contactInfo: { name: '', phoneNumber: '', email: '' },
            employeeCount: { men: '0', women: '0', others: '0', total: '0' },
            valueProcess: [],
            materials: [],
            certifications: [],
            articlesAssociated: [],
            address: {
                addressLine1: '',
                addressLine2: '',
                city: '',
                state: '',
                country: '',
                zip: ''
            },
            qualityRating: ''
        };
        this.supplierProfileUpdate = {
            description: '',
            contactInfo: { name: '', phoneNumber: '', email: '' }
        };
    }

    disableStyleInfiniteScroll = false;
    stylePagination = {
        from: 0,
        size: this.FETCH_STYLE_SIZE
    };
    subsuplierPagination = {
        from: 0,
        size: this.FETCH_STYLE_SIZE
    };
    disableMLInfiniteScroll = false;
    mlPagination = {
        from: 0,
        size: this.FETCH_ML_SIZE
    };
    sortByFilter = {
        sortBy: 'create_ts',
        sortOrder: 'desc'
    };

    payload: any;
    fieldResponse: any;

    ngOnInit() {
        this.route.params.subscribe(params => {
            this.pageLoading = true;
            this.supplierId = params['id'];
            this.ratings = [];
            this.resetPayload();
            this.payload['groupOnly'] = true;
            this.commonServices.getCustomFieldInfo(this.payload).subscribe(response => {
                const additionalInfoData = response['customFieldUITemplateAggResponseMap'];
                this.processAdditionalInfoTabs(additionalInfoData);
                this.resetPayload();
            });
            if (this.checkAccess('USER_LIST_READ')) {
                this.fetchUsers();
            }
            this.fetchSupplierProfile(this.supplierId);
        });
        this.commonServices.getCountries().subscribe(response => {
            this.countries = response['data']['country'];
        });
        this.getAssociatedStyles();
        this.getAssociatedMaterialLibrary();
        this.getSupplierAudits(this.supplierId);
    }

    resetPayload() {
        this.payload = {
            entity: this.entity,
            viewPage: this.viewPage,
            viewType: this.viewType,
            entityId: this.supplierId
        };
    }

    processAdditionalInfoTabs(data: any) {
        if (data !== null) {
            Object.keys(data).forEach(key => {
                this.supplierProfileTypes.push(key);
            });
            this.pageLoading = false;
        }
    }

    getAssociatedStyles() {
        this.disableStyleInfiniteScroll = true;
        const payload = {
            filter: {
                Suppliers: [this.supplierId]
            },
            module: 'STYLE',
            pagination: this.stylePagination
        };
        this.styleService.getAllProducts(payload).subscribe(
            response => {
                const data = response['data'];
                if (data['searchResponse'].length > 0) {
                    data['searchResponse'].forEach(searchResult => {
                        this.productsList.push(searchResult);
                    });
                    this.disableStyleInfiniteScroll = false;
                }
                this.styleCount = data.totalCount;
            },
            failResponse => {
                if (failResponse.status !== 403) {
                    this.toastr.error(
                        environment.error_messages.could_not_fetch_data.message,
                        environment.error_messages.could_not_fetch_data.title
                    );
                }
            }
        );
    }

    getSubSuppliers() {
        this.subsupplierList = [];
        this.disableStyleInfiniteScroll = true;
        let payload = {
            filter: {
                // SupplierVerificationStatus: [20] // todo verify with product owners
            },
            sort: this.sortByFilter,
            pagination: this.subsuplierPagination
        };
        payload.filter[this.env.subSupplierFilterKey] = [this.supplierProfile.name];
        this.supplierService.getAllSuppliers(payload).subscribe(
            response => {
                const data = response['data'];
                if (data['searchResponse'].length > 0) {
                    data['searchResponse'].forEach(searchResult => {
                        const supplier = {
                            id: '',
                            supplier_logo: '',
                            name: '',
                            contact_email: '',
                            contact_phone_no: ''
                        };
                        supplier.id = searchResult.supplier_id;
                        supplier.supplier_logo = searchResult['supplier_logo'];
                        supplier.name = searchResult['supplier_name'];
                        supplier.contact_email = searchResult['contact_email'];
                        supplier.contact_phone_no = searchResult['contact_phone_no'];

                        this.subsupplierList.push(supplier);
                    });
                    this.disableStyleInfiniteScroll = false;
                }
                this.subsupplierCount = data.totalCount;
            },
            failResponse => {
                if (failResponse.status !== 403) {
                    this.toastr.error(
                        environment.error_messages.could_not_fetch_data.message,
                        environment.error_messages.could_not_fetch_data.title
                    );
                }
            }
        );
    }

    getAssociatedMaterialLibrary() {
        this.disableMLInfiniteScroll = true;

        const payload = {
            filter: { SupplierNested: [this.supplierId] },
            module: 'ML',
            pagination: this.mlPagination
        };

        this.mlService.getAllMaterials(payload).subscribe(
            response => {
                const data = response['data'];
                if (data['searchResponse'].length > 0) {
                    data['searchResponse'].forEach(searchResult => {
                        this.materialsList.push(searchResult);
                    });
                    this.disableMLInfiniteScroll = false;
                }
                this.mlCount = data.totalCount;
            },
            failResponse => {
                if (failResponse.status !== 403) {
                    this.toastr.error(
                        environment.error_messages.could_not_fetch_data.message,
                        environment.error_messages.could_not_fetch_data.title
                    );
                }
            }
        );
    }

    onValueChange(param, type: string) {
        if (type === 'CONTACT') {
            this.supplierProfile.contactInfo.phoneNumber = param.contactMobile;
            this.supplierProfile.contactInfo.email = param.contactEmail;
            this.supplierProfile.contactInfo.name = param.contactPersonName;
        }
        this.supplierProfileUpdate.contactInfo = this.supplierProfile.contactInfo;
        this.supplierProfileUpdate.description = this.supplierProfile.description;
        this.supplierService.saveSupplierProfile(this.supplierId, this.supplierProfileUpdate).subscribe(
            resp => {
                // if it is a first time update. ensuring the next update is not creating a duplicate entry here
                this.contact = resp.data.supplierProfile.contactInfo;
                this.supplierProfile.id = resp.data.supplierProfile.id;
                this.toastr.success('Saved', 'Success');
                this.analyticsService.trackEvent('Supplier Details Page', {
                    Origin: 'Suppliers Page',
                    supplierId: this.supplierId,
                    'Action Performed': 'Suppler profile updated'
                });
            },
            () => {
                this.toastr.error(
                    environment.error_messages.could_not_fetch_data.message,
                    environment.error_messages.could_not_fetch_data.title
                );
            }
        );
    }

    getCountryCode(countryName) {
        for (let i = 0; i < this.countries.length; i++) {
            if (this.countries[i].name === countryName) {
                return this.countries[i].code.toLowerCase();
            }
        }
        return false;
    }

    navigateToFacilitiesView(facilityId: string) {
        this.commonServices.navigateToUrlWithLocationBack(['/', 'facilities', facilityId]);
    }

    onAssociatedStyleScroll() {
        this.stylePagination.from = this.stylePagination.from + this.FETCH_STYLE_SIZE;
        this.getAssociatedStyles();
    }

    onAssociatedMLScroll() {
        this.mlPagination.from = this.mlPagination.from + this.FETCH_ML_SIZE;
        this.getAssociatedMaterialLibrary();
    }

    getSupplierAudits(supplierId) {
        this.assessmentAuditService.getSupplierAudits(supplierId).subscribe(
            response => {
                const data = response['data'];
                this.audits = data['audits'];
                this.auditCount = data['totalCount'];
            },
            failResponse => {
                if (failResponse.status !== 403) {
                    this.toastr.error(
                        environment.error_messages.could_not_fetch_data.message,
                        environment.error_messages.could_not_fetch_data.title
                    );
                }
            }
        );
    }

    getCertificateNameById(Certificate_Type: any) {
        const cert = this.master_standards.filter(certificate => {
            return certificate.id === Certificate_Type;
        });
        if (cert && cert.length > 0) {
            return cert[0].value;
        }

        return 'Certificate Not Found';
    }

    changeSupplierProfileType(option) {
        this.supplierProfileType = option;

        switch (option) {
            case this.supplierProfileTypes[0]:
                break;
            default:
                this.analyticsService.trackEvent(this.additionalInformationPage, {
                    Origin: 'Supplier Detail Page',
                    Action: 'Additional Information tab visited'
                });
                this.pageLoading = true;
                this.getAdditionalInfo(option);
                break;
        }
    }

    onSaveAdditionalInfo(payload: any) {
        this.isFetchingAdditionalInfo = true;
        this.commonServices.updateCustomFieldInfo(this.entity, this.supplierId, payload.responseData).subscribe(
            data => {
                this.toastr.success('Information has been saved successfully.', 'Success');
                this.getAdditionalInfo(this.supplierProfileType);
            },
            failResponse => {
                if (failResponse.status === 400) {
                    this.toastr.warning(failResponse.error.message, 'Warning');
                } else {
                    this.toastr.error('Something has gone wrong. Please try after some time', 'Oops!');
                }
                this.isFetchingAdditionalInfo = false;
            }
        );
    }

    processAdditionalInfo(data: any) {
        this.additionalInfo = data;
        this.pageLoading = false;
    }

    getAdditionalInfo(option: string) {
        this.isFetchingAdditionalInfo = true;
        this.payload['tabs'] = [option];

        // In case of Additional Information tab, need to send empty string
        if (option === this.additionalInformation) {
            this.payload['tabs'] = [];
        }

        this.commonServices.getCustomFieldInfo(this.payload).subscribe(
            data => {
                this.processAdditionalInfo(data['customFieldUITemplateAggResponseMap'][option]);
                this.fieldResponse = data['fieldResponse'];
                this.resetPayload();
                this.isFetchingAdditionalInfo = false;
            },
            failResponse => {
                if (failResponse.status === 400) {
                    this.toastr.warning(failResponse.error.message, 'Warning');
                } else {
                    this.toastr.error('Something has gone wrong. Please try after some time', 'Oops!');
                }
                this.isFetchingAdditionalInfo = false;
            }
        );
    }

    private fetchUsers(): void {
        const payload = this.formUserSearchPayload();
        this.usersService.getAllUsers(payload).subscribe(
            resp => {
                const parsedUsers = JSON.parse(JSON.stringify(resp));
                if (resp.length > 0) {
                    if (!this.users || this.users.length === 0) {
                        this.users = JSON.parse(JSON.stringify(parsedUsers));
                    } else {
                        this.users.push(...JSON.parse(JSON.stringify(parsedUsers)));
                    }
                    this.userCount = this.users.length;
                }
            },
            failResponse => {
                this.toastr.error(
                    this.commonServices.getTranslation(
                        'Error in fetching User list. Contact admin if this issue persist'
                    ),
                    this.commonServices.getTranslation('Server Error')
                );
            }
        );
    }

    private fetchSupplierProfile(supplierId: string): void {
        this.supplierService.getSupplierProfile(supplierId).subscribe(
            response => {
                Object.keys(response.data.supplier).forEach(key => {
                    if (response.data.supplier[key] !== null || response.data.supplier[key] !== undefined) {
                        this.supplierProfile[key] = response.data.supplier[key];
                    }
                });
                const supplier = response.data.supplier;
                this.canEditSupplierProfile = supplier.status !== 'IN_ACTIVE';
                this.refId = supplier.referenceId;
                this.supplierData['name'] = this.supplierProfile.name;
                this.supplierData['description'] = this.supplierProfile.description;
                if (supplier.hasOwnProperty('contactInfo')) {
                    this.contact = supplier.contactInfo;
                    this.contactInfo.name = supplier.contactInfo.name;
                    this.contactInfo.email = supplier.contactInfo.email;
                    this.contactInfo.phoneNumber = supplier.contactInfo.phoneNumber;
                }
                if (supplier.hasOwnProperty('address')) {
                    this.address = response.data.supplier.address;
                }

                if (response.data.supplier?.certificatesList?.length) {
                    this.standards = response.data.supplier.certificatesList;
                }

                if (this.supplierProfile.facilities) {
                    this.facilityCount = this.supplierProfile.facilities.length;

                    this.supplierProfile.facilities.forEach(facility => {
                        if (facility.certificateList && facility.certificateList.length > 0) {
                            facility.certificateList.forEach(certificate => {
                                this.standards.push(certificate);
                            });
                        }
                    });
                }

                this.todoTask = response.data.supplier.todoTasks;
                this.masterData = response.data.masterData;
                this.localeService.addToMasterData(response.data.masterData);
                this.master_standards = this.localeService.getcertifications(this.masterData);
                this.supplierProfileData(supplierId);
            },
            failResponse => {
                if (failResponse.status === 403) {
                    this.toastr.info(this.env.error_messages.no_authorization, 'Insufficient Permission');
                } else {
                    this.toastr.error(
                        environment.error_messages.could_not_fetch_data.message,
                        environment.error_messages.could_not_fetch_data.title
                    );
                }
            }
        );
    }

    private supplierProfileData(supplierId: string): void {
        for (let index = 5; index > 0; index--) {
            if (index <= Number(this.supplierProfile.qualityRating)) {
                this.ratings.push(Number(index));
            } else {
                this.ratings.push(0);
            }
        }
        this.analyticsService.trackEvent('Supplier Details Page', {
            Origin: 'Suppliers Page',
            SupplierId: supplierId,
            Action: 'suppliers details page visited'
        });
        if (this.auth.haveAccess('SUB_SUPPLIER_READ')) {
            this.getSubSuppliers();
        }
        if (!this.canEditSupplierProfile) {
            this.toastr.warning('Supplier not associated with your company', 'Alert');
        }
        this.pageLoading = false;
    }

    private formUserSearchPayload() {
        return {
            companyId: this.supplierId,
            sort: this.sortByFilter
        };
    }

    downloadCertificate(certId: string, fileUrl: string) {
        if (!fileUrl || !certId) {
            this.toastr.info('Certificate not uploaded');
            return;
        }
        const fileName = fileUrl.substring(fileUrl.lastIndexOf('/') + 1);
        const file_name = fileName ? fileName : 'SC_Certificate_Information.pdf';
        this.toastr.info('Requesting file. Please wait', '', { timeOut: 3000, disableTimeOut: false });
        this.commonServices.downloadCertificate(certId).subscribe(
            response => {
                const blob = new Blob([response], { type: 'application/octet-stream' });
                FileSaver.saveAs(blob, file_name);
            },
            failResponse => {
                this.toastr.error('File could not be downloaded. Please try after some time.', 'Failed');
            }
        );
    }
}
