import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AnalyticsService } from '../../../core/analytics/analytics.service';
import { GenerateQrCodeComponent } from '../../../shared/components/generate-qr-code/generate-qr-code.component';
import { LocalizationService } from '../../../shared/utils/localization.service';
import { CertificateUploadService } from '../../uploads/certificate/cert-upload.service';
import { CertificateTypeValue } from '../../uploads/interface/certificate-type-value-model';
import { OrdersService } from '../orders.service';
import { ConfirmDialogComponent } from './../../../shared/modals/confirm-dialog/confirm-dialog.component';
import { CommonServices } from '../../../shared/commonServices/common.service';
import { FacilitiesService } from '../../facilities/facilities.service';
import { CustomToastrService } from '../../../shared/commonServices/custom-toastr.service';

@Component({
    selector: 'app-repackaging-transactions',
    templateUrl: './repackaging-transactions.component.html',
    styleUrls: ['./repackaging-transactions.component.scss']
})
export class RepackagingTransactionsComponent implements OnInit, OnDestroy {
    @ViewChild('soaSearchHint', { static: false }) soaSearchHint;
    hintColor: string;
    readonly inputLot = {
        externalId: '',
        lotId: '',
        quantity: {
            quantity: '',
            unit: ''
        }
    };
    certTypeValueList: CertificateTypeValue[];
    subscription: Subscription;
    inputLotQtyArray = [];
    certifications = [];

    repackagingInput = this.inputLot;

    transaction = {
        soaId: '',
        soaType: '',
        productType: '',
        date: new Date(),
        mode: '',
        repackagingInputLots: [],
        facilities: [],
        externalId: '',
        quantity: {
            quantity: 0,
            unit: ''
        },
        certificates: []
    };
    /*  soaUniqueName = {
        id_type: '',
        unique_search: ''
    }; */
    searchTerm: any;
    searchRawData = [];
    lotRawData = [];
    associatedFacility = [];
    isRequired = true;
    optional = { key: 'id', value: 'display_name', selectedKey: 'lotId' };

    isPrintReady: boolean;
    qrCodeToPrint: string;

    @ViewChild(GenerateQrCodeComponent, { static: false }) printQRCodeComponent;
    private lotQRCode: string;
    private isStyleMaterialSet: boolean;
    referenceIdIsUnique: boolean = true;

    constructor(
        private confirmDialog: MatDialog,
        private orderService: OrdersService,
        private router: Router,
        private toastr: CustomToastrService,
        private localeService: LocalizationService,
        private certUploadService: CertificateUploadService,
        private facilitiesService: FacilitiesService,
        public commonServices: CommonServices,
        private analyticsService: AnalyticsService
    ) {
        this.subscription = this.certUploadService.getCertificates().subscribe(certList => {
            this.certTypeValueList = certList;
        });
    }

    pageLoading = true;
    repackageConfig = {
        lots: [],
        unit: [],
        certifications: [],
        masterData: {
            QUANTITY_UNIT: [],
            CERTIFICATION: []
        },
        facilities: [],
        SOA_search: []
    };
    markedLotIdList = [];
    repackagingLottype = '';
    repackagingUnitType = '';

    ngOnInit() {
        this.analyticsService.trackPageVisit('repackaging transaction');
        this.getRepackageConfig();
    }
    getRepackageConfig() {
        this.transaction.repackagingInputLots.push(JSON.parse(JSON.stringify(this.repackagingInput)));
        this.certTypeValueList = [];
        this.repackagingLottype = '';
        this.orderService.getRepackageConfig().subscribe(response => {
            this.repackageConfig = response['data']['data'];
            this.lotRawData = this.repackageConfig.lots;
            this.repackageConfig.lots = [];
            this.repackageConfig.SOA_search = [];
            this.localeService.addToMasterData(response['data'].masterData);
            this.pageLoading = false;
        });
    }

    ngOnDestroy() {
        //  prevent memory leak when component is destroyed
        this.subscription.unsubscribe();
    }
    addInputLot() {
        this.repackagingInput = JSON.parse(JSON.stringify(this.inputLot));
        this.transaction.repackagingInputLots.push(JSON.parse(JSON.stringify(this.repackagingInput)));
    }
    deleteInputLot(index) {
        if (index >= this.transaction.repackagingInputLots.length - 1) {
            return;
        }
        this.transaction.repackagingInputLots.splice(index, 1);
        if (this.transaction.repackagingInputLots.length === 0) {
            this.transaction.repackagingInputLots.push(
                Object.assign({}, JSON.parse(JSON.stringify(this.repackagingInput)))
            );
        }
    }

    checkLotAlreadySelected(event, i, isScanned = false) {
        let eventIsDuplicate = false;
        this.transaction.repackagingInputLots.forEach(lot => {
            if (lot.lotId === event.id) {
                eventIsDuplicate = true;
                return;
            }
        });

        if (eventIsDuplicate) {
            this.repackagingInput = JSON.parse(JSON.stringify(this.inputLot));
            this.toastr.error(
                'The selected lot is already taken for repackaging in the current transaction',
                'Kindly select another lot!'
            );
            return;
        }

        if (this.hasDuplicates(this.transaction.repackagingInputLots)) {
            this.transaction.repackagingInputLots.splice(this.transaction.repackagingInputLots.length - 2, 1);
            this.toastr.error(
                'The selected lot is already taken for repackaging in the current transaction',
                'Kindly select another lot!'
            );
            return;
        }

        this.transaction.repackagingInputLots[i].lotId = event.id;

        this.repackageConfig.lots.forEach(lot => {
            if (lot.id === this.transaction.repackagingInputLots[i].lotId) {
                this.transaction.repackagingInputLots[i].lotId = lot.id;
                this.transaction.repackagingInputLots[i].externalId = lot.external_id;
                this.transaction.repackagingInputLots[i].quantity.quantity = lot.quantity;
                this.inputLotQtyArray[i] = lot.quantity;
                this.transaction.repackagingInputLots[i].quantity.unit = lot.units_key;
                this.transaction.soaId = lot.soa_id;
                this.transaction.soaType = lot.soa_type;
                this.transaction.productType = lot.product_type.id;
            }
        });
        if (this.transaction.repackagingInputLots.length === 1) {
            // do this check for comparing articles/style types of input lots
            const matchingLot = this.repackageConfig.lots.find(
                lot => lot.id === this.transaction.repackagingInputLots[0].lotId
            );
            if (matchingLot !== undefined) {
                this.repackagingLottype = matchingLot.soa_type;
                this.repackagingUnitType = matchingLot.units_key;
                this.addInputLot();
            }
        } else if (this.transaction.repackagingInputLots.length > 1) {
            if (!this.checkForArticleType(event, i)) {
                this.repackagingInput = JSON.parse(JSON.stringify(this.inputLot));
                this.toastr.error('The selected lot is of different unit. Please select lot with same unit');
            } else {
                this.addInputLot();
            }
        }
    }

    checkQuantityEntered(userQty, i) {
        const inputlotId = this.transaction.repackagingInputLots[i].lotId;
        this.repackageConfig.lots.forEach(lot => {
            const lotQty = this.inputLotQtyArray[i];
            if (lot.id === inputlotId && (userQty === 0 || +userQty > +lotQty)) {
                this.toastr.error(
                    'Invalid Quantity Entered: Available Quantity in selected Lot:' +
                        lot.quantity +
                        ' ' +
                        this.localeService.getDisplayText(lot.units_key)
                );
                this.transaction.repackagingInputLots[i].quantity.quantity = undefined;
                return;
            }
        });
    }

    hasDuplicates(array) {
        const valuesSoFar = Object.create(null);
        for (let i = 0; i < array.length; ++i) {
            const value = array[i].lotId;
            if (value in valuesSoFar) {
                return true;
            }
            valuesSoFar[value] = true;
        }
        return false;
    }

    checkForArticleType(event, i) {
        const matchingLot = this.repackageConfig.lots.find(lot => lot.id === event.id);
        if (
            matchingLot !== undefined &&
            matchingLot.soa_type === this.repackagingLottype &&
            matchingLot.units_key === this.repackagingUnitType
        ) {
            // check for the type of first input lot to repackage
            return true;
        }
        return false;
    }

    getSOAName(item) {
        if (item != null && item.artifactName_no != null) {
            return item.artifactName_no;
        }
    }

    saveRepackage(print = false) {
        this.pageLoading = true;
        /*         const soaSplit = this.soaUniqueName.id_type.split('-');
        this.transaction.soaId = soaSplit[0];
        this.transaction.soaType = soaSplit[1]; */

        this.transaction.repackagingInputLots.splice(this.transaction.repackagingInputLots.length - 1, 1);

        this.transaction.quantity.quantity = this.getTotalInputLotQuantity();
        this.transaction.quantity.unit = this.transaction.repackagingInputLots[0].quantity.unit;

        const certificationPayload = [];
        this.certTypeValueList.forEach(element => {
            const kv = {
                certification_type: element.certType,
                evidence_id: element.evidenceId
            };
            certificationPayload.push(kv);
        });
        this.transaction.certificates = certificationPayload;
        this.transaction.mode = 'web';

        this.orderService.createRepackage(this.transaction).subscribe(
            (response: any) => {
                this.resetForm();
                this.openConfirmationDialog(response.data);

                if (print) {
                    this.qrCodeToPrint = response['data'].UNIQUE_CODE;
                    this.isPrintReady = true;
                    setTimeout(() => {
                        this.printQRCodeComponent.printQRCode();
                    }, 100);
                }
                this.pageLoading = false;
            },
            failResponse => {
                this.pageLoading = false;

                if (failResponse.status === 409) {
                    this.analyticsService.trackSaveFail('repackaging transaction', 'Error: Duplicate Reference Id');
                    this.toastr.error('A lot with the reference id already exists!', 'Duplicate Reference Id');
                } else {
                    this.analyticsService.trackSaveFail('repackaging transaction');
                    this.toastr.error('Something has gone wrong. Please try after some time', 'Oops!');
                }
            }
        );
    }

    getTotalInputLotQuantity(): number {
        let total = 0;
        if (this.transaction != null && this.transaction.repackagingInputLots.length > 0) {
            this.transaction.repackagingInputLots.forEach(x => (total += parseInt(x.quantity.quantity, 10)));
        }
        return total;
    }

    searchFreeHandRepackage(searchTerm, isScanned = false, entity = { displayName: '' }) {
        const searchPayload = {};
        searchPayload['freeHand'] = searchTerm;
        searchPayload['filter'] = {
            status: ['UN_USED'],
            txType: ['INBOUND', 'PRODUCTION', 'RE_PACKAGING', 'SYS_RE_PACKAGING']
        };
        this.orderService.searchLot(searchPayload).subscribe(response => {
            this.searchRawData = response['data'].searchResponse;
            // used to check only unique values are pushed to this.searchData
            this.repackageConfig.SOA_search = this.filterForUniqueLots(this.searchRawData);
            if (this.repackageConfig.SOA_search.length > 0) {
                if (isScanned) {
                    let searchTermMatch = false;
                    this.repackageConfig.SOA_search.forEach(data => {
                        if (data.artifactName_no === this.searchTerm.artifactName_no) {
                            this.searchTerm = JSON.parse(JSON.stringify(data));
                            this.onSOASelection(this.searchTerm);
                            let lotFound = false;
                            this.repackageConfig.lots.forEach(lot => {
                                if (lot.display_name === entity.displayName) {
                                    this.isStyleMaterialSet = true;
                                    this.checkLotAlreadySelected(
                                        lot,
                                        this.transaction.repackagingInputLots.length - 1,
                                        true
                                    );
                                    lotFound = true;
                                }
                            });
                            if (!lotFound) {
                                this.toastr.info(
                                    'The scanned lot is either invalid or it has been used.',
                                    'Invalid / Used Lot'
                                );
                            }
                            searchTermMatch = true;
                        }
                    });
                    if (!searchTermMatch) {
                        this.toastr.error(
                            'Make sure the scanned item is present in the inbound transactions',
                            'No matching data!'
                        );
                    }
                }
            } else {
                if (isScanned) {
                    this.toastr.error(
                        'Make sure the scanned item is present in the inbound transactions',
                        'No matching data!'
                    );
                }
                if (searchTerm.length >= 3) {
                    if (this.repackageConfig.SOA_search.length > 0) {
                        this.hintColor = '';
                        this.soaSearchHint.nativeElement.innerText = '';
                    } else {
                        this.hintColor = 'red';
                        this.soaSearchHint.nativeElement.innerText = 'No results found';
                    }
                }
            }
        });
    }

    getSOAId(value): string {
        const soaSplit = value.split('-');
        return soaSplit[0];
    }

    onSOASelection(value) {
        this.repackageConfig.lots = this.searchRawData.filter(lot => {
            return lot.artifactName_no === value.artifactName_no;
        });
        this.transaction.repackagingInputLots = [];
        this.transaction.repackagingInputLots.push(JSON.parse(JSON.stringify(this.repackagingInput)));
    }

    private filterForUniqueLots(rawLotData) {
        const filteredArticleNames = [];
        const filteredLotData = [];
        rawLotData.forEach(lot => {
            lot.artifactName_no = lot.artifactName_no.replace(/-$/, '');
            if (filteredArticleNames.indexOf(lot.artifactName_no) === -1) {
                filteredArticleNames.push(lot.artifactName_no);
                filteredLotData.push(lot);
            }
        });
        return filteredLotData;
    }

    searchStyleOrArticle(event) {
        if (event.key !== '') {
            this.searchFreeHandRepackage(this.searchTerm);
        }
    }

    openSubmissionDialog(): void {
        const submissionDialog = this.confirmDialog.open(ConfirmDialogComponent, {
            width: '460px',
            data: {
                title: '',
                msg: 'One more thing',
                primaryButton: 'Close',
                secondaryButton: 'Submit',
                showClose: false,
                isProvisionToAddInput: true,
                placeholder: 'External id to be associated'
            }
        });
        submissionDialog.afterClosed().subscribe(response => {
            if (response != null) {
                const responseArr = response.split(',');
                if (response[0] === 'Close') {
                    // Do nothing as the user want to go back to the create form
                    // console.log(response);
                } else if (responseArr.length > 1) {
                    this.transaction.externalId = responseArr[1]; //  1 is index here
                    this.saveRepackage();
                }
            }
        });
    }

    openConfirmationDialog(data): void {
        const confirmationDialog = this.confirmDialog.open(ConfirmDialogComponent, {
            width: '460px',
            data: {
                title: '',
                msg:
                    ' Transaction created successfully with the Lot ID : ' +
                    data.LOT +
                    ' and External ID: ' +
                    data.UNIQUE_CODE,
                primaryButton: 'View',
                secondaryButton: 'Record new',
                showClose: false
            }
        });
        confirmationDialog.afterClosed().subscribe(response => {
            if (response != null) {
                if (response === 'Record new') {
                    this.resetForm();
                } else if (response === 'View') {
                    this.router.navigate(['orders']);
                }
            }
        });
    }

    resetForm() {
        this.searchTerm = '';
        this.certUploadService.clearCertificates();
        this.facilitiesService.clearFacilities();
        this.repackageConfig.lots = [];
        this.transaction = {
            soaId: '',
            soaType: '',
            productType: '',
            date: new Date(),
            mode: '',
            repackagingInputLots: [],
            facilities: [],
            externalId: '',
            quantity: {
                quantity: 0,
                unit: ''
            },
            certificates: []
        };
        this.getRepackageConfig();
    }

    save() {
        this.analyticsService.trackSaveButtonClick('repackaging transaction');
        this.saveRepackage();
    }

    saveAndPrint() {
        this.saveRepackage(true);
    }

    handleQRResponse(response: any) {
        const entity = response['entity_data'];
        this.searchTerm = {
            id: entity.soaId,
            artifactName_no: [entity.soaName, entity.soaNumber].filter(Boolean).join('-')
        };
        this.searchFreeHandRepackage(this.searchTerm.artifactName_no, true, entity);

        this.transaction.facilities = this.repackageConfig.facilities
            .filter(facility => facility.key === entity.facilities[0])
            .map(facility => facility.key);
    }

    handleInputLotsQRResponse($event: any) {
        if (!this.isStyleMaterialSet) {
            this.handleQRResponse($event);
        } else {
            let lotFound = false;
            this.repackageConfig.lots.forEach(lot => {
                if (lot.display_name === $event.entity_data.displayName) {
                    this.checkLotAlreadySelected(lot, this.transaction.repackagingInputLots.length - 1, true);
                    lotFound = true;
                }
            });
            if (!lotFound) {
                this.toastr.info(
                    'The scanned lot is either invalid, not part of this style/material or it has been used.',
                    'Invalid / Used Lot'
                );
            }
        }
    }

    checkIfReferenceIdIsUnique() {
        this.orderService.isReferenceIfUnique(this.transaction.externalId).subscribe(
            response => {
                this.referenceIdIsUnique = true;
            },
            errorResponse => {
                if (errorResponse.status === 409) {
                    this.referenceIdIsUnique = false;
                    this.toastr.error('A lot with the reference id already exists!', 'Duplicate Reference Id');
                } else {
                    this.referenceIdIsUnique = true;
                }
            }
        );
    }
}
