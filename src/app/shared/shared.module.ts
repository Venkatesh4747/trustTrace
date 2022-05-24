import { CustomizationInfoComponent } from './components/additional-information/customization-info/customization-info.component';
import { AdditionalInformationComponent } from './components/additional-information/additional-information.component';
import { DragScrollModule } from 'ngx-drag-scroll';
import { PopoverModule } from 'ngx-bootstrap/popover';
import { ContextService } from './context.service';
import { CommonModule, DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { NgxMaterialTimepickerModule } from 'ngx-material-timepicker';
import { RouterModule } from '@angular/router';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { CarouselModule } from 'ngx-bootstrap/carousel';
import { StorageServiceModule } from 'ngx-webstorage-service';
import { BreadcrumbComponent } from './breadcrumb/breadcrumb.component';
import { CarouselBasicComponent } from './carousel-basic/carousel-basic.component';
import { CommonServices } from './commonServices/common.service';
import { RouterHistoryService } from './commonServices/router-history.service';
import { AddressComponent } from './components/address/address.component';
import { CardInputSingleComponent } from './components/card-input-single/card-input-single.component';
import { ChipCardComponent } from './components/chip-card/chip-card.component';
import { ChipInputComponent } from './components/chip-input/chip-input.component';
import { ContactInfoComponent } from './components/contact-info/contact-info.component';
import { FilterBarComponent } from './components/filter-bar/filter-bar.component';
import { ImageUploadService } from './components/image-upload/image-upload.service';
import { InlineEditComponent } from './components/inline-edit/inline-edit.component';
import { MultiSelectAndSearchComponent } from './components/multi-select-and-search/multi-select-and-search.component';
import { TodoTaskComponent } from './components/todo-task/todo-task.component';
import { TTDropdownSearchComponent } from './components/tt-dropdown-search/tt-dropdown-search.component';
import { TTDropdownSearchV2Component } from './components/tt-dropdown-search-v2/tt-dropdown-search-v2.component';
import { TranslateDirective } from './directives/translate.directive';
import { FooterComponent } from './footer/footer.component';
import { FullPageLoaderComponent } from './full-page-loader/full-page-loader.component';
import { AddSupplierModalComponent } from './modals/add-supplier/add-supplier.component';
import { ConfirmDialogComponent } from './modals/confirm-dialog/confirm-dialog.component';
import { FacilityComponent } from './modals/facility/facility.component';
import { ProductFlowModalComponent } from './modals/product-flow-modal/product-flow-modal.component';
import { StylesModalComponent } from './modals/styles-modal/styles-modal.component';
import { TRModalComponent } from './modals/TRModal/TRModal.component';
import { HighlightTextPipe } from './pipes/highlight-text.pipe';
import { KeysPipe } from './pipes/keys.pipe';
import { ArrayObjectsToStringPipe } from './pipes/array-objects-to-string.pipe';
import { RemoveElementInArrayPipe } from './pipes/remove-element.pipe';
import { SearchFilter } from './pipes/search.pipe';
import { ExpandCollapse } from './pipes/expandCollapse.pipe';
import { SortByFilterPipe } from './pipes/sort-by-filter.pipe';
import { UniqueFilterPipe } from './pipes/unique-filter.pipe';
import { QrCodeService } from './components/qr-code/qr-code.service';
import { SecuredImgComponent } from './secured-img/secured-img.component';
import { SideNavigationComponent } from './side-navigation/side-navigation.component';
import { SideNavigationService } from './side-navigation/side-navigation.service';
import { SpinnerComponent } from './spinner/spinner.component';
import { TopNavigationComponent } from './top-navigation/top-navigation.component';
import { LocalizationService } from './utils/localization.service';
import { TTMultiSelectSearchComponent } from './components/tt-multi-select-search/tt-multi-select-search.component';
import { TTMultiDropdownSearchComponent } from './components/tt-multi-dropdown-search/tt-multi-dropdown-search.component';
import { SupplyChainFlowComponent } from './modals/supply-chain-flow/supply-chain-flow.component';
import { SassHelperComponent } from '../../styles/sass-helper/sass-helper.component';
import { TtMultiSelectGroupSearchComponent } from './components/tt-multi-select-group-search/tt-multi-select-group-search.component';
import { SafePipe } from './pipes/safe.pipe';
import { TtExpansionListMenuComponent } from './components/tt-expansion-list-menu/tt-expansion-list-menu.component';
import { TtExpansionPanelComponent } from './components/tt-expansion-panel/tt-expansion-panel.component';
import { TtDropdownComponent } from './components/tt-dropdown/tt-dropdown.component';
import { TtRadioGroupComponent } from './components/tt-radio-group/tt-radio-group.component';
import { TtStyleSearchComponent } from './components/tt-som-search/tt-som-search.component';
import { TreeViewComponent } from './components/tree-view/tree-view.component';
import { ChildTreeComponent } from './components/tree-view/child-tree/child-tree.component';
import { AddSupplierV2ModalComponent } from './modals/add-supplier-v2/add-supplier-v2.component';
import { CollectSupplierInfoModalComponent } from './modals/collect-supplier-info/collect-supplier-info.component';
import { TTSupplierSearchComponent } from './components/tt-supplier-search/tt-supplier-search.component';
import { SuppliersService } from '../views/suppliers/suppliers.service';
import { UploadCertificateListComponent } from './modals/upload-certificate-list/upload-certificate-list.component';
import { CertificateManagerComponent } from './components/certificate-manager/certificate-manager.component';
import { ImgComponent } from './components/img/img.component';
import { TruncateTextPipe } from './pipes/truncate-text.pipe';
import { GenerateQrCodeComponent } from './components/generate-qr-code/generate-qr-code.component';
import { NgxPrintModule } from 'ngx-print';
import { NgxQRCodeModule } from '@techiediaries/ngx-qrcode';
import { QrCodeComponent } from './components/qr-code/qr-code.component';
import { ConvertToIdPipe } from './pipes/convert-to-id.pipe';
import { TtTableWithCheckboxComponent } from './components/tt-table-with-checkbox/tt-table-with-checkbox.component';
import { ConfirmationModalComponent } from './modals/confirmation-modal/confirmation-modal.component';
import { CreateUserModalComponent } from './modals/create-user-modal/create-user-modal.component';
import { TooltipModalComponent } from './modals/tooltip-modal/tooltip-modal.component';
import { LotOriginChartComponent } from './modals/lot-origin-chart/lot-origin-chart.component';
import { LotOriginChartTraverserComponent } from './modals/lot-origin-chart/lot-origin-chart-traverser/lot-origin-chart-traverser.component';
import { PasswordValidatorDirective } from './directives/password-validator.directive';
import { UploadTransactionDocumentsComponent } from './modals/upload-transaction-documents/upload-transaction-documents.component';
import { ImagePreloadDirective } from './directives/image-preload.directive';
import { ReferenceIdComponent } from './components/api-reference-id/api-reference-id.component';
import { TtButtonComponent } from './ui-components/tt-button/tt-button.component';
import { SupplierListFormElementComponent } from './components/supplier-list-form-element/supplier-list-form-element.component';
import { SupplierStatusComponent } from './components/supplier-status/supplier-status.component';
import { FormSubmittedSyncDirective } from './directives/formSubmittedSync.directive';
import { EditCustomizationFieldsComponent } from './components/additional-information/edit-customization-fields/edit-customization-fields.component';
import { EditCustomizationInfoComponent } from './components/additional-information/edit-customization-info/edit-customization-info.component';
import { EntityCustomizationFieldsComponent } from './components/additional-information/entity-customization-fields/entity-customization-fields.component';
import { TestAutomationService } from './automation-test-utils/test-automation.service';
import { ConfirmationPromptSingleComponent } from './modals/confirmation-prompt-single/confirmation-prompt-single.component';
import { FilterWithSearchComponent } from './components/filter-with-search/filter-with-search.component';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { ModalModule } from 'ngx-bootstrap/modal';
import { CertificateValidatorComponent } from './components/certificate-validator/certificate-validator.component';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { orderByValuePipe } from './pipes/order-by-value.pipe';
import { TtIconImageComponent } from './ui-components/tt-icon-image/tt-icon-image.component';
import { TtTableComponent } from './ui-components/tt-table/tt-table.component';
import { TtMultiSelectWithSliderComponent } from './components/tt-multi-select-with-slider/tt-multi-select-with-slider.component';
import { CertificateValidationComponent } from './components/certificate-validation/certificate-validation.component';
import { IndustryLabelPipe } from './pipes/industry-label.pipe';
import { CertificateValidationStatusComponent } from './components/certificate-validation-status/certificate-validation-status.component';
import { CardPaginationComponent } from './components/card-pagination/card-pagination.component';
import { ImportDataComponent } from './modals/import-data/import-data.component';
import { ImportComponent } from './modals/import/import.component';
import { ScoreTableComponent } from './modals/score-table/score-table.component';
import { TtDateFilterComponent } from './components/tt-date-filter/tt-date-filter.component';
import { InformationConfirmDialogComponent } from './modals/information-confirm-dialog/information-confirm-dialog.component';
import { TtDateRangeFieldComponent } from './components/tt-date-range-field/tt-date-range-field.component';
import { InfoModalComponent } from './modals/info-modal/info-modal.component';
import { CertificateRenewalWorkflowComponent } from './modals/certificate-renewal-workflow/certificate-renewal-workflow.component';
import { TtMultiSelectAutoCompleteComponent } from './components/tt-multi-select-auto-complete/tt-multi-select-auto-complete.component';
import { NotificationBarComponent } from './components/notification-bar/notification-bar.component';
import { TtDateRangeFieldWithMaxDaysComponent } from './components/tt-date-range-field-with-max-days/tt-date-range-field-with-max-days.component';
import { ConfirmDialogV2 } from './modals/confirm-dialog-v2/confirm-dialog-v2.component';
import { UpperCaseTextOnlyDirective } from './directives/upper-case-text-only.directive';
import { HandlingHttpErrorsService } from './utils/handling-http-errors.service';
import { CustomToastrService } from './commonServices/custom-toastr.service';
import { DeactivateReactivateModalComponent } from './modals/deactivate-reactivate-modal/deactivate-reactivate-modal.component';
import { ScreenshotDirective } from './directives/screenshot.directive';
import { HiggModalComponent } from './modals/higg-modal/higg-modal.component';
import { HiggService } from './commonServices/higg.service';
import { ConfirmDialogTableComponent } from './modals/confirm-dialog-table/confirm-dialog-table.component';
import { SubSupplierDetailsComponent } from '../views/suppliers/sub-supplier-details/sub-supplier-details.component';
import { CertificatesComponent } from './components/certificates/certificates.component';
import { FacilitiesListComponent } from './components/facilities-list/facilities-list.component';
import { ChipListComponent } from './components/chip-list/chip-list.component';
import { GenerateApiKeyComponent } from './components/generate-api-key/generate-api-key.component';
import { GenerateApiKeyService } from './components/generate-api-key/generate-api-key.service';
import { GetFieldLabelPipe } from './pipes/get-field-label.pipe';
import { LongRunningTaskService } from './commonServices/longRunningTask.service';

export function HttpLoaderFactory(http: HttpClient) {
    return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

@NgModule({
    imports: [
        DragScrollModule,
        MatListModule,
        MatButtonModule,
        MatChipsModule,
        MatIconModule,
        MatInputModule,
        MatCheckboxModule,
        MatProgressSpinnerModule,
        MatSelectModule,
        MatRadioModule,
        BsDropdownModule.forRoot(),
        TooltipModule,
        CommonModule,
        RouterModule,
        ModalModule,
        FormsModule,
        ReactiveFormsModule,
        CarouselModule,
        MatDatepickerModule,
        NgxMaterialTimepickerModule,
        MatRadioModule,
        MatAutocompleteModule,
        StorageServiceModule,
        MatExpansionModule,
        MatTooltipModule,
        TranslateModule.forRoot({
            loader: {
                provide: TranslateLoader,
                useFactory: HttpLoaderFactory,
                deps: [HttpClient]
            }
        }),
        NgxPrintModule,
        NgxQRCodeModule,
        MatTableModule,
        TabsModule,
        PopoverModule.forRoot()
    ],
    providers: [
        SideNavigationService,
        CommonServices,
        RouterHistoryService,
        LocalizationService,
        ImageUploadService,
        MultiSelectAndSearchComponent,
        ContextService,
        SuppliersService,
        DatePipe,
        QrCodeService,
        TestAutomationService,
        HandlingHttpErrorsService,
        CustomToastrService,
        HiggService,
        GenerateApiKeyService,
        LongRunningTaskService
    ],
    declarations: [
        SideNavigationComponent,
        TopNavigationComponent,
        FooterComponent,
        BreadcrumbComponent,
        FullPageLoaderComponent,
        TRModalComponent,
        StylesModalComponent,
        AddSupplierModalComponent,
        AddSupplierV2ModalComponent,
        CollectSupplierInfoModalComponent,
        KeysPipe,
        ArrayObjectsToStringPipe,
        SearchFilter,
        ExpandCollapse,
        UniqueFilterPipe,
        RemoveElementInArrayPipe,
        SpinnerComponent,
        CarouselBasicComponent,
        TranslateDirective,
        HighlightTextPipe,
        TodoTaskComponent,
        InlineEditComponent,
        FacilityComponent,
        AddressComponent,
        ConfirmDialogComponent,
        ProductFlowModalComponent,
        ContactInfoComponent,
        SortByFilterPipe,
        orderByValuePipe,
        ChipInputComponent,
        CardInputSingleComponent,
        ChipCardComponent,
        SecuredImgComponent,
        MultiSelectAndSearchComponent,
        FilterBarComponent,
        TTDropdownSearchComponent,
        TTDropdownSearchV2Component,
        TTSupplierSearchComponent,
        TTMultiSelectSearchComponent,
        TTMultiDropdownSearchComponent,
        SupplyChainFlowComponent,
        SassHelperComponent,
        TtMultiSelectGroupSearchComponent,
        SafePipe,
        TtExpansionListMenuComponent,
        TtExpansionPanelComponent,
        TtDropdownComponent,
        TtRadioGroupComponent,
        TtStyleSearchComponent,
        TreeViewComponent,
        ChildTreeComponent,
        UploadCertificateListComponent,
        CertificateManagerComponent,
        ImgComponent,
        TruncateTextPipe,
        TtTableWithCheckboxComponent,
        ConfirmationModalComponent,
        CreateUserModalComponent,
        GenerateQrCodeComponent,
        QrCodeComponent,
        AdditionalInformationComponent,
        CustomizationInfoComponent,
        ConvertToIdPipe,
        TtTableWithCheckboxComponent,
        ConfirmationModalComponent,
        TooltipModalComponent,
        ConvertToIdPipe,
        LotOriginChartComponent,
        LotOriginChartTraverserComponent,
        UploadTransactionDocumentsComponent,
        ImagePreloadDirective,
        PasswordValidatorDirective,
        TtButtonComponent,
        SupplierListFormElementComponent,
        SupplierStatusComponent,
        ReferenceIdComponent,
        FormSubmittedSyncDirective,
        EditCustomizationFieldsComponent,
        EditCustomizationInfoComponent,
        EntityCustomizationFieldsComponent,
        ConfirmationPromptSingleComponent,
        FilterWithSearchComponent,
        CertificateValidatorComponent,
        TtIconImageComponent,
        TtTableComponent,
        TtMultiSelectWithSliderComponent,
        CertificateValidationComponent,
        CertificateValidationStatusComponent,
        IndustryLabelPipe,
        CardPaginationComponent,
        ImportDataComponent,
        ImportComponent,
        ScoreTableComponent,
        TtDateFilterComponent,
        TtDateRangeFieldComponent,
        InfoModalComponent,
        TtMultiSelectAutoCompleteComponent,
        NotificationBarComponent,
        TtDateRangeFieldWithMaxDaysComponent,
        CertificateRenewalWorkflowComponent,
        TtDateFilterComponent,
        TtDateRangeFieldComponent,
        InformationConfirmDialogComponent,
        ConfirmDialogV2,
        UpperCaseTextOnlyDirective,
        ScreenshotDirective,
        HiggModalComponent,
        ConfirmDialogTableComponent,
        DeactivateReactivateModalComponent,
        SubSupplierDetailsComponent,
        CertificatesComponent,
        FacilitiesListComponent,
        ChipListComponent,
        GenerateApiKeyComponent,
        GetFieldLabelPipe
    ],
    exports: [
        GenerateApiKeyComponent,
        DragScrollModule,
        MatExpansionModule,
        MatListModule,
        MatButtonModule,
        MatChipsModule,
        MatIconModule,
        MatInputModule,
        MatCheckboxModule,
        MatSelectModule,
        MatRadioModule,
        MatTooltipModule,
        SideNavigationComponent,
        TopNavigationComponent,
        FooterComponent,
        BreadcrumbComponent,
        FullPageLoaderComponent,
        TRModalComponent,
        StylesModalComponent,
        AddSupplierModalComponent,
        AddSupplierV2ModalComponent,
        CollectSupplierInfoModalComponent,
        KeysPipe,
        ArrayObjectsToStringPipe,
        SearchFilter,
        ExpandCollapse,
        UniqueFilterPipe,
        RemoveElementInArrayPipe,
        SpinnerComponent,
        CarouselBasicComponent,
        TranslateDirective,
        TranslateModule,
        HighlightTextPipe,
        TodoTaskComponent,
        InlineEditComponent,
        MatDatepickerModule,
        NgxMaterialTimepickerModule,
        FacilityComponent,
        AddressComponent,
        ContactInfoComponent,
        SortByFilterPipe,
        orderByValuePipe,
        MatAutocompleteModule,
        ChipInputComponent,
        CardInputSingleComponent,
        ChipCardComponent,
        SecuredImgComponent,
        MultiSelectAndSearchComponent,
        FilterBarComponent,
        TTDropdownSearchComponent,
        TTDropdownSearchV2Component,
        TTSupplierSearchComponent,
        TTMultiSelectSearchComponent,
        TTMultiDropdownSearchComponent,
        SassHelperComponent,
        TtMultiSelectGroupSearchComponent,
        SafePipe,
        TtExpansionListMenuComponent,
        TtExpansionPanelComponent,
        TtDropdownComponent,
        TtRadioGroupComponent,
        TtStyleSearchComponent,
        TreeViewComponent,
        ChildTreeComponent,
        UploadCertificateListComponent,
        CertificateManagerComponent,
        ImgComponent,
        TruncateTextPipe,
        GenerateQrCodeComponent,
        QrCodeComponent,
        AdditionalInformationComponent,
        CustomizationInfoComponent,
        ConvertToIdPipe,
        TtTableWithCheckboxComponent,
        ConfirmationModalComponent,
        CreateUserModalComponent,
        ImagePreloadDirective,
        PasswordValidatorDirective,
        BsDropdownModule,
        TtButtonComponent,
        SupplierListFormElementComponent,
        SupplierStatusComponent,
        ReferenceIdComponent,
        ModalModule,
        FormSubmittedSyncDirective,
        FilterWithSearchComponent,
        ConfirmationPromptSingleComponent,
        MatTableModule,
        CertificateValidatorComponent,
        TtIconImageComponent,
        TtTableComponent,
        TtMultiSelectWithSliderComponent,
        CertificateValidationComponent,
        CertificateValidationStatusComponent,
        IndustryLabelPipe,
        CardPaginationComponent,
        ImportDataComponent,
        ImportComponent,
        ScoreTableComponent,
        TtDateFilterComponent,
        TtDateRangeFieldComponent,
        InfoModalComponent,
        CertificateRenewalWorkflowComponent,
        TtMultiSelectAutoCompleteComponent,
        NotificationBarComponent,
        TtDateRangeFieldWithMaxDaysComponent,
        TtDateFilterComponent,
        TtDateRangeFieldComponent,
        InformationConfirmDialogComponent,
        ConfirmDialogV2,
        UpperCaseTextOnlyDirective,
        ScreenshotDirective,
        PopoverModule
    ]
})
export class SharedModule {}
