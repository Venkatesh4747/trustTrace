import { Component, forwardRef, Input, OnInit, Output, EventEmitter, ViewChild } from '@angular/core';
import { environment as env } from '../../../../environments/environment';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { take } from 'rxjs/operators';
import { TTSupplierSearchService } from './tt-supplier-search.service';
import { AddSupplierV2ModalComponent } from '../../modals/add-supplier-v2/add-supplier-v2.component';
import { MatDialog } from '@angular/material/dialog';
import { AuthService } from '../../../core';
import { SuppliersService } from '../../../views/suppliers/suppliers.service';
import { CollectSupplierInfoModalComponent } from '../../modals/collect-supplier-info/collect-supplier-info.component';
import { AnalyticsService } from '../../../core/analytics/analytics.service';
import {
    IAddSupplierModelData,
    IAddSupplierResponse,
    getAddSupplierModelDefaultTemplate,
    AddSupplierOrigins
} from '../../modals/add-supplier-v2/add-supplier-v2.model';
import { ContextService } from '../../context.service';
import { amplitude } from '../../const-values';
import { CustomToastrService } from '../../commonServices/custom-toastr.service';
import { MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { ITtSupplierSearchModule } from './tt-supplier-search.module';

const TTSUPPLIER_SEARCH_VALUE_ACCESSOR = {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => TTSupplierSearchComponent),
    multi: true
};
@Component({
    providers: [TTSupplierSearchService, TTSUPPLIER_SEARCH_VALUE_ACCESSOR],
    selector: 'app-tt-supplier-search',
    templateUrl: './tt-supplier-search.component.html',
    styleUrls: ['./tt-supplier-search.component.scss']
})
export class TTSupplierSearchComponent implements OnInit {
    @Input() unAcceptedTooltip: string;
    @Input() unInvitedTooltip: string;
    @Input() origin: AddSupplierOrigins = null; // Analytics
    @Input() placeholder: string;
    @ViewChild('supplierInput', { read: MatAutocompleteTrigger }) autocomplete: MatAutocompleteTrigger;

    public env = env;
    constructor(
        public dialog: MatDialog,
        private supplierSearchService: TTSupplierSearchService,
        private toastr: CustomToastrService,
        private authService: AuthService,
        private suppliersService: SuppliersService,
        private analyticsService: AnalyticsService,
        private appContext: ContextService
    ) {}

    defaultValue: ITtSupplierSearchModule = {
        supplier_id: '',
        supplier_name: '',
        supplier_verification_status: {
            id: 0,
            value: ''
        },
        supplier_association_status: {
            id: 0,
            value: ''
        },
        supplier_other_info: {}
    };

    cannotDiscloseSupplier: ITtSupplierSearchModule = {
        supplier_id: this.suppliersService.SUPPLIER_CANNOT_DISCLOSE,
        supplier_name: "I don't wish to provide",
        supplier_verification_status: {
            id: 0,
            value: ''
        },
        supplier_association_status: {
            id: 0,
            value: ''
        }
    };

    @Output() selectionChange = new EventEmitter<ITtSupplierSearchModule>();
    @Output() notFoundEvent = new EventEmitter<any>();
    @Output() searchTextChange = new EventEmitter<boolean>();

    @Input() existingValue: ITtSupplierSearchModule;
    @Input() selectedItem: ITtSupplierSearchModule;
    @Input() isReadonly: Boolean = false;
    @Input() notFoundAction;
    @Input() required: Boolean = false;
    @Input() showLabel: Boolean = false;
    @Input() options: object = {};
    @Input() showCurrentCompanyInTheList: Boolean = true;

    defaultOptions = {
        CANNOT_DISCLOSE: true,
        ADD_NEW: true,
        INCLUDE_SELF: true
    };
    floatLabel = 'never';

    searchOptions = [];

    supplierSearchText: ITtSupplierSearchModule;

    selectedOption: string;
    _value: any[]; // Private variable for input value
    onChange: any = Function.prototype; // Trascend the onChange event
    onTouched: any = Function.prototype; // Trascend the onTouch eventconstructor(private localeService: LocalizationService) {}

    ADD_NEW_SUPPLIER_OPTION = 'add-new-supplier';
    currentUserCompany: any = {};
    showCurrentUserCompany: Boolean = true;
    normalizedCurrentUserCompanyName = '';

    otherSupplierInfo = {};
    fetchingSuppliers = true;

    ngOnInit() {
        if (this.options) {
            this.options = { ...this.defaultOptions, ...this.options };
        }

        if (!this.authService.userCompanyDetails) {
            this.authService.getUser().subscribe(response => {
                this.authService.setUser(response);
                var currentUserCompanyView = this.authService.userCompanyDetails;
                this.currentUserCompany.supplier_id = currentUserCompanyView.id;
                this.currentUserCompany.supplier_name = currentUserCompanyView.name;
                this.normalizedCurrentUserCompanyName = this.currentUserCompany.supplier_name.toLowerCase();
            });
        } else {
            var currentUserCompanyView = this.authService.userCompanyDetails;
            this.currentUserCompany.supplier_id = currentUserCompanyView.id;
            this.currentUserCompany.supplier_name = currentUserCompanyView.name;
            this.normalizedCurrentUserCompanyName = this.currentUserCompany.supplier_name.toLowerCase();
        }

        if (this.showLabel) {
            this.floatLabel = 'always';
        }

        this.appContext.selectedTRSupplier.subscribe(supplier => {
            if (supplier) {
                this.existingValue = supplier;
                this.checkExistingValue();
            } else {
                this.existingValue = undefined;
                this.supplierSearchText = undefined;
                this.selectedItem = undefined;
            }
        });
        this.checkExistingValue();
    }

    checkExistingValue(): void {
        if (this.existingValue) {
            if (this.existingValue.supplier_id === this.suppliersService.SUPPLIER_CANNOT_DISCLOSE) {
                this.supplierSearchText = this.cannotDiscloseSupplier;
            } else {
                this.supplierSearchText = this.existingValue;
            }
            this.selectedItem = this.supplierSearchText;
        }
    }

    onSelection(selectValue: ITtSupplierSearchModule | string): void {
        const selectedValueAsObject = selectValue as ITtSupplierSearchModule;
        if (selectValue === this.ADD_NEW_SUPPLIER_OPTION) {
            this.analyticsAddNewSupplierSelected();
            this.openAddSupplierModal();
        } else if (selectedValueAsObject.supplier_id === this.suppliersService.SUPPLIER_CANNOT_DISCLOSE) {
            this.analyticsIDontWishToProvideSelected();
            this.openCollectSupplierInfoModal(selectedValueAsObject);
        } else {
            this.sendSupplierSelectionEvent(selectedValueAsObject);
        }
    }

    sendSupplierSelectionEvent(value: ITtSupplierSearchModule): void {
        this.populateAutoSuggestList();
        this.selectedItem = value;
        const selectedSupplier: ITtSupplierSearchModule = {
            supplier_id: value.supplier_id,
            supplier_name: value.supplier_name,
            supplier_verification_status: value.supplier_verification_status,
            supplier_association_status: value.supplier_association_status
        };
        if (value.supplier_other_info) {
            selectedSupplier.supplier_other_info = value.supplier_other_info;
        } else {
            delete selectedSupplier.supplier_other_info;
        }
        this.selectionChange.emit(selectedSupplier);
    }

    search(): void {
        if (!this.supplierSearchText) {
            this.searchTextChange.emit(true);
        }
        this.populateAutoSuggestList();
    }

    private getTheSupplierName(supplierDetails: ITtSupplierSearchModule): string {
        return typeof supplierDetails === 'string' ? supplierDetails : supplierDetails.supplier_name;
    }

    populateAutoSuggestList(): void {
        this.fetchingSuppliers = true;
        const payload = {
            pagination: {
                size: 1000
            },
            sort: {
                sortBy: 'supplier_name.sort',
                sortOrder: 'asc'
            },
            module: 'SUPPLIER'
        };
        let searchText: string;
        if (this.supplierSearchText) {
            searchText = this.getTheSupplierName(this.supplierSearchText);
        }

        if (searchText) {
            payload['freeHand'] = searchText;
        }

        this.supplierSearchService.getAllSuppliers(payload).subscribe(response => {
            if (response['data'].searchResponse) {
                this.searchOptions = response['data']['searchResponse'];
            }
            this.fetchingSuppliers = false;
        });

        this.searchCurrentUserCompany(payload['freeHand']);
    }

    searchCurrentUserCompany(searchText: string): void {
        if (searchText) {
            var normalizedSearchText = searchText.toLowerCase();
            if (this.normalizedCurrentUserCompanyName.includes(normalizedSearchText)) {
                this.showCurrentUserCompany = true;
            } else {
                this.showCurrentUserCompany = false;
            }
        } else {
            this.showCurrentUserCompany = true;
        }
    }

    getDisplayName(item: ITtSupplierSearchModule): string {
        if (item) {
            return item.supplier_name;
        }
    }

    openAddSupplierModal(): void {
        const DIALOG_DATA: IAddSupplierModelData = getAddSupplierModelDefaultTemplate();
        // Analytics
        DIALOG_DATA.origin = this.origin;
        this.analyticsService.trackEvent(amplitude.supplier.addSupplierClicked, {
            Origin: this.origin,
            Action: amplitude.supplier.addSupplierClicked
        });

        const dialogRef = this.dialog.open(AddSupplierV2ModalComponent, {
            data: DIALOG_DATA
        });

        dialogRef
            .afterClosed()
            .pipe(take(1))
            .subscribe((modelData: IAddSupplierResponse) => {
                this.autocomplete.closePanel();
                if (modelData.status === 'SUCCESS') {
                    const result = modelData.data;
                    if (result) {
                        this.supplierSearchText = {
                            supplier_name: result?.name,
                            supplier_id: result?.id,
                            supplier_verification_status: result?.verificationStatus,
                            supplier_association_status: result?.associationStatus
                        };
                        this.onSelection(this.supplierSearchText);
                    }
                }
            });
    }

    openCollectSupplierInfoModal(value: ITtSupplierSearchModule): void {
        const dialogRef = this.dialog.open(CollectSupplierInfoModalComponent, { disableClose: true });
        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                value.supplier_other_info = result;
            } else {
                delete value.supplier_other_info;
            }
            this.autocomplete.closePanel();
            this.sendSupplierSelectionEvent(value);
        });
    }

    checkSelectedOption(event: FocusEvent): void {
        if (
            event &&
            event.target['nodeName'] === 'INPUT' &&
            (event.relatedTarget === null ||
                (event.relatedTarget && event.relatedTarget['nodeName'] !== 'MAT-OPTION')) &&
            this.supplierSearchText &&
            this.getTheSupplierName(this.supplierSearchText) !== this.ADD_NEW_SUPPLIER_OPTION &&
            this.supplierSearchText.supplier_id !== this.cannotDiscloseSupplier.supplier_id &&
            (!this.selectedItem || this.selectedItem.supplier_id !== this.supplierSearchText.supplier_id)
        ) {
            this.toastr.error('Please choose a valid option');
            this.supplierSearchText = undefined;
            this.selectedItem = JSON.parse(JSON.stringify(this.defaultValue));
            this.selectionChange.emit(this.selectedItem);
        }
    }

    ANALYTICS_EVENT_SUPPLIER_SEARCH = 'Supplier-Search';
    analyticsAddNewSupplierSelected() {
        let analyticsOptions = {};
        this.analyticsService.trackEvent(
            this.ANALYTICS_EVENT_SUPPLIER_SEARCH + ' Add-New-Supplier#Selected',
            analyticsOptions
        );
    }

    analyticsIDontWishToProvideSelected() {
        let analyticsOptions = {};
        this.analyticsService.trackEvent(
            this.ANALYTICS_EVENT_SUPPLIER_SEARCH + ' I-dont-wish-to-provide#Selected',
            analyticsOptions
        );
    }
}
