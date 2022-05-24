import { CommonServices } from '../../../shared/commonServices/common.service';
import { Component, OnDestroy, OnInit } from '@angular/core';

import { Router } from '@angular/router';
import { CustomToastrService } from '../../../shared/commonServices/custom-toastr.service';
import { Subject, Subscription } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { AnalyticsService } from '../../../core/analytics/analytics.service';
import { CertificateManagerService } from '../../../shared/components/certificate-manager/certificate-manager.service';
import { ConfirmDialogComponent } from '../../../shared/modals/confirm-dialog/confirm-dialog.component';
import { LocalizationService } from '../../../shared/utils/localization.service';
import { FacilitiesService } from '../../facilities/facilities.service';
import { CertificateUploadService } from '../../uploads/certificate/cert-upload.service';
import {
    ISupplierListFormOptions,
    SupplierListTypes
} from '../../../shared/components/supplier-list-form-element/supplier-list-form-element.model';
import { AuthService } from '../../../core';
import { ContextService } from '../../../shared/context.service';
import { TransactionsService } from '../transactions.service';
import { IInboundData } from '../transactions.model';
import { MatDialog } from '@angular/material/dialog';
import { debounceTime } from 'rxjs/operators';

@Component({
    selector: 'app-inbound',
    templateUrl: './inbound.component.html',
    styleUrls: ['./inbound.component.scss']
})
export class InboundComponent implements OnInit, OnDestroy {
    hintColor: string;

    pageLoading = false;
    subscription: Subscription;

    certifications = [];
    units = [];
    associatedFacility = [];
    suppliers = [];

    soaUniqueName: any;
    searchData = [];
    searchRawData = [];
    payload: IInboundData = {
        date: new Date(),
        companyId: '',
        mode: 'WEB_UI',
        txType: 'INBOUND',
        facilityId: null,
        inboundData: {
            productItemId: '',
            sellerLotId: '',
            quantity: {
                quantity: '',
                unit: 'un_kilograms'
            },
            poNumber: '',
            poDate: null,
            supplierId: ''
        }
    };
    isRequired = true;
    optional = { key: 'supplier_id', value: 'supplier_name', selectedKey: 'supplier_id' };

    supplierListOptions: ISupplierListFormOptions = {
        controlType: 'single-select',
        listOnlyThisSuppliers: [
            SupplierListTypes.not_invited_supplier,
            SupplierListTypes.accepted_supplier,
            SupplierListTypes.unAccepted_supplier
        ],
        acceptOnlyListedValues: true,
        floatLabel: 'always',
        isRequired: true,
        placeholder: 'Supplier:',
        valueChangesFire: 'from-option',
        customClass: 'transaction-custom-style'
    };

    referenceIdIsUnique = true;

    uploadFiles: any = {};

    data: any = {
        certificates_to_collect: []
    };

    isUploading: any = {};
    env = environment;

    selectedUnit = [];

    validationResponse = {};

    soaSearchHintText = 'Type at least 3 characters to search';

    freeHandSearchSubject: Subject<any> = new Subject();

    constructor(
        private confirmDialog: MatDialog,
        private localeService: LocalizationService,
        private router: Router,
        private toastrService: CustomToastrService,
        private certUploadService: CertificateUploadService,
        private facilitiesService: FacilitiesService,
        private appContext: ContextService,
        private certificateManagerService: CertificateManagerService,
        private analyticsService: AnalyticsService,
        public authService: AuthService,
        private dialog: MatDialog,
        private transactionsService: TransactionsService,
        private commonServices: CommonServices
    ) {
        this.payload.companyId = this.authService.companyId;
    }

    ngOnInit() {
        if (sessionStorage.getItem('tx_inbound_unit')) {
            this.selectedUnit[0] = { id: sessionStorage.getItem('tx_inbound_unit') };
        }
        this.analyticsService.trackPageVisit('inbound transaction');
        this.pageLoading = true;
        this.transactionsService.getInboundConfig().subscribe(response => {
            this.localeService.addToMasterData(response['data'].masterData);
            const data = response['data'].data;
            this.associatedFacility = data.facilities;
            this.units = data.unit;
            this.pageLoading = false;
        });

        this.freeHandSearchSubject.pipe(debounceTime(150)).subscribe(() => {
            this.searchFreeHandInbound(this.soaUniqueName);
        });
    }

    ngOnDestroy() {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }

    getSOAName(item) {
        if (item?.code && item?.name && item?.season?.value && item?.year) {
            return `${item?.code}-${item?.name}-${item?.year}-${item?.season?.value}`;
        }
        return null;
    }

    resetForm() {
        this.soaUniqueName = { id_type: '', unique_search: '', supplier: [] };
        this.suppliers = [];
        this.payload = {
            date: new Date(),
            companyId: this.authService.companyId,
            mode: 'WEB_UI',
            txType: 'INBOUND',
            facilityId: null,
            inboundData: {
                productItemId: '',
                sellerLotId: '',
                quantity: {
                    quantity: '',
                    unit: 'un_kilograms'
                },
                poNumber: '',
                poDate: null,
                supplierId: ''
            }
        };
        this.transactionsService.getInboundConfig();
    }

    saveInbound() {
        this.pageLoading = true;
        if (!this.payload.inboundData.supplierId || typeof this.payload.inboundData.supplierId !== 'string') {
            this.toastrService.error('Please fix the errors on the form');
            this.pageLoading = false;
            return;
        }

        this.searchRawData.filter(e => {
            if (this.soaUniqueName.unique_search === e.unique_search) {
                this.payload.inboundData.productItemId = e.id;
            }
        });

        this.payload.date = this.commonServices.adjustDateForTimezone(this.payload.date);
        const payload = JSON.parse(JSON.stringify(this.payload));
        payload.inboundData.supplierId = this.payload.inboundData.supplierId;
        delete payload.inboundData.supplier;

        this.transactionsService.submitTransactions(payload).subscribe(
            (response: any) => {
                if (response?.errorMsg === 'Duplicate Transaction') {
                    this.analyticsService.trackSaveFail('inbound transaction');
                    this.toastrService.error('Inbound Transaction already exists', 'Error');
                    this.pageLoading = false;
                } else {
                    this.analyticsService.trackSaveSuccess('inbound transaction');
                    this.toastrService.success('Transaction created successfully', 'Success');
                    setTimeout(() => {
                        this.pageLoading = false;
                        this.appContext.cardViewRefresh.next(true);
                        this.router.navigate(['/transactions']);
                    }, 800);
                }
            },
            errorResponse => {
                if (errorResponse.status === 409) {
                    this.analyticsService.trackSaveFail('inbound transaction', 'Error: Duplicate Reference Id');
                    this.referenceIdIsUnique = false;
                    this.toastrService.error('A lot with the reference id already exists!', 'Duplicate Reference Id');
                } else {
                    this.analyticsService.trackSaveFail('inbound transaction');
                    this.toastrService.error(
                        'We could not process your request at the moment. Please try again later',
                        'Error'
                    );
                }
                this.pageLoading = false;
            }
        );
    }

    searchFreeHandInbound(searchTerm) {
        if (searchTerm && typeof searchTerm !== 'string') return;
        const searchPayload = {};
        searchPayload['freeHand'] = searchTerm;
        if (!searchPayload['freeHand']) {
            return;
        }
        this.transactionsService.searchFreeHandStyle(searchPayload).subscribe(
            response => {
                this.searchRawData = response['data'].searchResponse;
                if (this.searchRawData.length > 0) {
                    // used to check only unique values are pushed to this.searchData
                    this.searchData = this.transactionsService.filterForUniqueSOAValue(this.searchRawData);

                    this.hintColor = '';
                    this.soaSearchHintText = '';
                } else {
                    if (searchTerm && searchTerm.length >= 3) {
                        this.searchData = [];
                        this.hintColor = 'red';
                        this.soaSearchHintText = 'No results found';
                    }
                }
            },
            () => {
                if (searchTerm && searchTerm.length >= 3) {
                    this.searchData = [];
                    this.hintColor = 'red';
                    this.soaSearchHintText = 'No results found';
                }
            }
        );
    }

    onSOASelection(value) {
        this.suppliers = [];
        this.searchRawData.forEach(el => {
            if (value.unique_search === el.unique_search) {
                if (el.supplier) {
                    el.supplier.forEach(supplier => {
                        this.suppliers.push({ supplier_id: supplier.id, supplier_name: supplier.name });
                    });
                }

                if (this.suppliers.length === 1) {
                    if (Array.isArray(this.suppliers) && this.suppliers.length === 1) {
                        if (
                            !this.payload.inboundData.supplierId ||
                            this.payload.inboundData.supplierId !== this.suppliers[0].supplier_id
                        ) {
                            this.supplierListOptions.selectedItem = this.suppliers;
                        }
                    }
                } else {
                    this.payload.inboundData.supplierId = null;
                }
                if (!this.suppliers || this.suppliers.length === 0) {
                    this.suppliers = [];
                    this.onCreateSupplierNotAvailableModel();
                }
            }
        });
    }

    uploadFile(files: any, certificateId) {
        if (!this.uploadFiles[certificateId]) {
            this.uploadFiles[certificateId] = [];
        }

        const fileToUpload: File = files.item(0);
        const fileSize: number = fileToUpload.size / 1024 / 1024;
        fileSize.toFixed(2);
        const fileName = fileToUpload.name;
        fileName.slice((Math.max(0, fileName.lastIndexOf('.')) || Infinity) + 1);

        if (certificateId !== 'QUALITY_REPORT' && certificateId !== 'OTHERS') {
            let certificateDetails;
            let certificate_id = null;
            let uploadedFiles = [];

            if (certificateDetails && certificateDetails.length > 0) {
                uploadedFiles = JSON.parse(JSON.stringify(certificateDetails[0].uploadedFiles));
                certificate_id = JSON.parse(JSON.stringify(certificateDetails[0].id));
            }

            const payload = {
                certificateId: certificate_id || null,
                Certificate_Type: certificateId,
                Certification_Body: '',
                Certificate_Expiry_Date: '',
                Entity_Type: 'TRANSACTION',
                Category: 'PRODUCT',
                Uploaded_Files: uploadedFiles || [],
                Entity_Id: null
            };

            if (this.uploadFiles[certificateId].certificateId) {
                payload.certificateId = this.uploadFiles[certificateId].certificateId;
            }

            this.isUploading[certificateId] = true;

            this.certificateManagerService.uploadFile(fileToUpload, payload).subscribe(response => {
                this.uploadFiles[certificateId] = {
                    certificateId: response.id,
                    files: []
                };
                const _files = JSON.parse(JSON.stringify(response.uploadedFiles));
                for (let i = 0; i < _files.length; i++) {
                    const raw_fileName = _files[i].substring(_files[i].lastIndexOf('/') + 1);
                    this.uploadFiles[certificateId].files[i] = {
                        fileUrl: _files[i],
                        fileName: raw_fileName,
                        displayFileName: raw_fileName.substring(raw_fileName.indexOf('_') + 1)
                    };
                }
                this.isUploading[certificateId] = false;
            });
        } else {
            let certificateDetails: null | any[];

            if (certificateId === 'QUALITY_REPORT') {
                certificateDetails = this.data.quality_report;
            } else {
                certificateDetails = this.data.other_documents;
            }
            let evidence_id = null;
            if (certificateDetails && certificateDetails?.length > 0) {
                JSON.parse(JSON.stringify(certificateDetails[0].fileName));
                evidence_id = JSON.parse(JSON.stringify(certificateDetails[0].id));
            }

            if (this.uploadFiles[certificateId].certificateId) {
                evidence_id = this.uploadFiles[certificateId].certificateId;
            }

            this.isUploading[certificateId] = true;
            this.transactionsService.uploadCertificate(evidence_id, fileToUpload, certificateId).subscribe(response => {
                this.uploadFiles[certificateId] = {
                    certificateId: response.id,
                    files: []
                };
                const _files = JSON.parse(JSON.stringify(response.fileName));
                for (let i = 0; i < _files.length; i++) {
                    const raw_fileName = _files[i].substring(_files[i].lastIndexOf('/') + 1);
                    this.uploadFiles[certificateId].files[i] = {
                        fileUrl: _files[i],
                        fileName: raw_fileName,
                        displayFileName: raw_fileName.substring(raw_fileName.indexOf('_') + 1)
                    };
                }
                this.isUploading[certificateId] = false;
            });
        }
    }

    removeFile(id: any, index: number) {
        if (id !== 'QUALITY_REPORT' && id !== 'OTHERS') {
            this.certificateManagerService
                .deleteFile(this.uploadFiles[id].certificateId, this.uploadFiles[id].files[index].fileName)
                .subscribe(response => {
                    this.uploadFiles[id] = {
                        certificateId: response.id,
                        files: []
                    };
                    const files = JSON.parse(JSON.stringify(response.uploadedFiles));
                    for (let i = 0; i < files.length; i++) {
                        const raw_fileName = files[i].substring(files[i].lastIndexOf('/') + 1);
                        this.uploadFiles[id].files[i] = {
                            fileUrl: files[i],
                            fileName: raw_fileName,
                            displayFileName: raw_fileName.substring(raw_fileName.indexOf('_') + 1)
                        };
                    }
                });
        } else {
            this.transactionsService
                .removeEvidenceFile(this.uploadFiles[id].certificateId, this.uploadFiles[id].files[index].fileName)
                .subscribe(() => {
                    this.uploadFiles[id].files.splice(index, 1);
                });
        }
    }

    searchStyleOrArticle() {
        this.freeHandSearchSubject.next();
    }

    save() {
        this.analyticsService.trackSaveButtonClick('inbound transaction');
        this.saveInbound();
    }

    onCreateSupplierNotAvailableModel() {
        this.confirmDialog.open(ConfirmDialogComponent, {
            width: '500px',
            data: {
                title: 'Information',
                msg:
                    'This Article/Style does not have an associated Supplier. Please add a Supplier to record this transaction',
                primaryButton: 'Close',
                showClose: true
            }
        });
    }

    validateSelectedStyle() {
        // Need to wait for the value to be updated after blur on input
        setTimeout(() => {
            // return if the value is null or undefined as it would be handled by the form itself
            if (this.soaUniqueName.hasOwnProperty('unique_search') || !this.soaUniqueName) {
                return;
            }

            let matchedItems = this.searchData.filter(x => x === this.soaUniqueName);

            if (Array.isArray(matchedItems) && matchedItems.length <= 0) {
                this.soaUniqueName = '';
                this.toastrService.error('Please select a valid style');
            }
        }, 200);
    }

    updateSupplier(event: any) {
        if (Array.isArray(event)) {
            this.payload.inboundData.supplierId = event[0].supplier_id;
        } else {
            this.payload.inboundData.supplierId = event.supplier_id;
        }
    }
}
