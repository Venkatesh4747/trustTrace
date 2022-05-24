import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core';
import { AnalyticsService } from '../../../core/analytics/analytics.service';
import { MultiIndustryService } from '../../../shared/multi-industry-support/multi-industry.service';
import { TEmsService } from '../t-ems.service';
import { CommonServices } from '../../../shared/commonServices/common.service';
import { TTSupplierSearchService } from '../../../shared/components/tt-supplier-search/tt-supplier-search.service';
import { ContextService } from '../../../shared/context.service';
import { CustomToastrService } from '../../../shared/commonServices/custom-toastr.service';

@Component({
    providers: [TTSupplierSearchService],
    selector: 'app-create-tr',
    templateUrl: './create-tr.component.html',
    styleUrls: ['./create-tr.component.scss']
})
export class CreateTrComponent implements OnInit {
    createTRForm: FormGroup;

    pageLoading = false;
    addMoreInputs: any;

    templateName = '';
    productType = '';

    searchData = [];
    searchRawData = [];
    templates = [];
    trTypes = [
        {
            key: 'style',
            value: 'Style'
        },
        {
            key: 'material',
            value: 'Material'
        }
    ];

    actionTypes = {
        enter: 'Enter Data By Yourself',
        collect: 'Collect from the supplier'
    };
    optionalParamsSupplierName = { key: 'id', value: 'name' };
    optionalParamsInformation = { key: 'api', value: 'name' };
    dataProviderSelectionDisabled = false;
    autoSelectedSupplier;

    constructor(
        private fb: FormBuilder,
        private auth: AuthService,
        private trServices: TEmsService,
        public commonServices: CommonServices,
        private toastr: CustomToastrService,
        private router: Router,
        private trs: TEmsService,
        private analyticsService: AnalyticsService,
        private appContext: ContextService,
        private supplierSearchService: TTSupplierSearchService,
        private multiIndustryService: MultiIndustryService
    ) {
        this.trTypes[0].value = this.multiIndustryService.getLabel(this.trTypes[0].value);
        this.trTypes[1].value = this.multiIndustryService.getLabel(this.trTypes[1].value);
    }

    ngOnInit() {
        this.createTRForm = this.fb.group({
            type: ['', Validators.required],
            style: ['', Validators.required],
            poNumber: '',
            supplier: ['', Validators.required],
            template: ['Product Evidences', Validators.required],
            actionType: [false, Validators.required]
        });
        this.getProductEntities();
    }

    getProductEntities() {
        this.pageLoading = true;
        this.trServices.getProductEntities(this.trTypes[0]['value']).subscribe(response => {
            const data = response['data'];
            this.productType = data['type'];
            this.templateName = data['entities'][0]['name'];
            this.templates = data['entities'][0]['templates'];
            this.resetForm();
            this.pageLoading = false;
        });
    }

    checkForTraceable(item: any) {
        const productId = this.createTRForm.value.style.product_type.id;

        // There are only one supplier so auto populate the supplier
        if (item['supplier'] && item['supplier'].length === 1) {
            this.getSupplierInfo(item['supplier'][0]['name']);
        }

        this.trs.getAddMoreInput(productId).subscribe(response => {
            const data = response['data'];
            this.addMoreInputs = data['mappings']['RAW_MATERIALS'];
            if (this.addMoreInputs.length === 0) {
                this.toastr.error(
                    this.multiIndustryService.getLabel('Please choose a traceable style/material'),
                    'Failed'
                );
                this.createTRForm.patchValue({ style: '' });
                this.setSupplierField();
            } else {
                if (this.createTRForm.controls.type.value.value === 'Material') {
                    if (this.createTRForm.controls.style.value.traceable === 'no') {
                        this.toastr.error(
                            this.multiIndustryService.getLabel('Please choose a traceable style/material'),
                            'Failed'
                        );
                        this.createTRForm.patchValue({ style: '' });
                        this.setSupplierField();
                    }
                }
            }
        });
    }

    createTr() {
        this.pageLoading = true;
        const createApi = 'product-evidence';
        const controls = this.createTRForm.controls;
        const payload = {
            type: this.productType,
            entity:
                controls.type.value.value === this.trTypes[1].value ? 'Material Library' : controls.type.value.value,
            entityId: controls.style.value.id,
            poNumber: controls.poNumber.value.toUpperCase(),
            supplierId: controls.supplier.value.supplier_id,
            supplierOtherInfo: controls.supplier.value.supplier_other_info,
            template: 'Product Evidences',
            dataProvider: ''
        };
        if (controls.actionType.value) {
            // Enter data by myself
            payload.dataProvider = this.auth.user.companyId;
        } else {
            // Collect it from supplier
            payload.dataProvider = controls.supplier.value.supplier_id;
        }
        this.trServices.createTr(createApi, payload).subscribe(
            response => {
                this.toastr.success('T-EMS request created', 'Success');
                if (controls.actionType.value) {
                    this.router.navigate(['/', 't-ems', 'product', 'evidencecollection', response['message'], 'edit']);
                } else {
                    setTimeout(() => {
                        this.router.navigate([
                            '/',
                            't-ems',
                            'product',
                            'evidencecollection',
                            response['message'],
                            'supplychain'
                        ]);
                    }, 1000);
                }
            },
            failResponse => {
                this.pageLoading = false;
                this.toastr.error(failResponse.error.message, 'Failed');
            }
        );
    }

    resetForm() {
        this.createTRForm.reset();
        this.createTRForm.setValue({
            type: this.trTypes[0],
            style: '',
            poNumber: '',
            supplier: '',
            template: this.templates[0],
            actionType: false
        });
        this.setSupplierField();
    }

    handleTypeChanged() {
        this.resetForm();
    }

    setSupplierField(value = undefined) {
        this.autoSelectedSupplier = value;
        this.appContext.selectedTRSupplier.next(this.autoSelectedSupplier);
        this.onSelectingSupplier(this.autoSelectedSupplier);
    }

    getSupplierInfo(name: string) {
        const payload = {
            pagination: {
                size: 10000
            },
            sort: {
                sortBy: 'supplier_name.sort',
                sortOrder: 'asc'
            }
        };

        payload['freeHand'] = name;

        this.supplierSearchService.getAllSuppliers(payload).subscribe(response => {
            if (response['data'].searchResponse) {
                this.setSupplierField(response['data']['searchResponse'][0]);
            }
        });
    }

    onSelectingSupplier(value) {
        this.createTRForm.controls.supplier.setValue(value);

        if (
            value &&
            (value['supplier_id'] === this.auth.companyId ||
                !value['supplier_association_status'] ||
                [0, 10].includes(+value['supplier_association_status'].id))
        ) {
            this.createTRForm.controls.actionType.setValue(true);
            this.createTRForm.controls.actionType.disable();
        } else {
            this.createTRForm.controls.actionType.enable();
        }
    }

    ANALYTICS_EVENT_T_EMS_NEW_REQUEST = 'T-EMS New-Request';
    analyticsEnterByYourselfChanged() {
        const analyticsOptions = {};

        let eventName = this.ANALYTICS_EVENT_T_EMS_NEW_REQUEST + ' Enter-By-Yourself';
        if (this.createTRForm.controls.actionType.value) {
            eventName += '#Checked';
        } else {
            eventName += '#Unchecked';
        }
        this.analyticsService.trackEvent(eventName, analyticsOptions);
    }

    analyticsLaunchRequestClicked() {
        const analyticsOptions = {};
        this.analyticsService.trackEvent(
            this.ANALYTICS_EVENT_T_EMS_NEW_REQUEST + ' Launch-Request#Clicked',
            analyticsOptions
        );
    }
}
