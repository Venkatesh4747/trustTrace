import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProductsService } from '../../products.service';
import { IIntegrationSummaryDetail } from '../integration.model';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { saveAs } from 'file-saver';
import { CustomToastrService } from '../../../../shared/commonServices/custom-toastr.service';
import { environment } from '../../../../../environments/environment';
@Component({
    selector: 'app-integration-product-detail',
    templateUrl: './integration-product-detail.component.html',
    styleUrls: ['./integration-product-detail.component.scss']
})
export class IntegrationProductDetailComponent implements OnInit {
    productNumber: string;
    pageLoading: boolean;

    integrationInfo = { summary: [] };
    integrationSummaryDetail: IIntegrationSummaryDetail;

    integrationLogsDetail: any;
    integrationlogsFormGroup: FormGroup;

    constructor(
        private activatedRoute: ActivatedRoute,
        private productService: ProductsService,
        private formBuilder: FormBuilder,
        private toastrService: CustomToastrService
    ) {}

    ngOnInit(): void {
        this.pageLoading = true;

        this.integrationlogsFormGroup = this.formBuilder.group({
            files: this.formBuilder.array([])
        });

        this.productNumber = this.activatedRoute.snapshot.queryParams['productNumber'];
        this.productService.getProductionIntegrationDetailData(this.productNumber).subscribe(
            data => {
                this.integrationSummaryDetail = data.latestProductData;
                this.integrationLogsDetail = data.integrationStatus;
                this.summaryDetails();
                this.integrationLogsDetails();
                this.pageLoading = false;
            },
            () => {
                this.pageLoading = false;
                this.toastrService.error('Unable to load product', 'Server Error');
            }
        );
    }

    summaryDetails(): void {
        this.integrationInfo = {
            summary: [
                {
                    title: 'EAN',
                    value: this.integrationSummaryDetail.product_number
                },
                {
                    title: 'Product Name',
                    value: this.integrationSummaryDetail.product_name
                },
                {
                    title: 'Country of Packaging',
                    value: this.integrationSummaryDetail.country_of_packaging
                },
                {
                    title: 'Brand Name',
                    value: this.integrationSummaryDetail.brand_name
                },
                {
                    title: 'Supplier Name',
                    value: this.integrationSummaryDetail.supplier_name
                },
                {
                    title: 'Product Label',
                    value: this.integrationSummaryDetail.product_labels
                },
                {
                    title: 'Category',
                    value: this.integrationSummaryDetail.category
                },
                {
                    title: 'Sub Category',
                    value: this.integrationSummaryDetail.sub_category
                },
                {
                    title: 'Segment Name',
                    value: this.integrationSummaryDetail.segment_name
                },
                {
                    title: 'Sub Segment Name',
                    value: this.integrationSummaryDetail.sub_segment_name
                },
                {
                    title: 'Team',
                    value: this.integrationSummaryDetail.team
                },
                {
                    title: 'Active',
                    value: this.integrationSummaryDetail.active
                },
                {
                    title: 'Regional',
                    value: this.integrationSummaryDetail.regional
                },
                {
                    title: 'T Date',
                    value: this.integrationSummaryDetail.t_date
                },
                {
                    title: 'PLU',
                    value: this.integrationSummaryDetail.plu
                },
                {
                    title: 'Size Description',
                    value: this.integrationSummaryDetail.size_desc
                }
            ]
        };
    }

    integrationLogsDetails(): void {
        this.integrationLogsDetail = this.integrationLogsDetail.map(integrationStatus => {
            const data = {
                ...integrationStatus,
                files: integrationStatus.files.map(fn => ({
                    id: fn,
                    value: fn.match(/([^\/]+)(?=\.\w+$)/)[0]
                }))
            };
            if (data.status === 'ERROR') {
                data.files.push({ id: data.id, value: 'Log' });
            }
            return data;
        });

        const formArray = this.integrationlogsFormGroup.controls.files as FormArray;
        this.constructFormArray(formArray);
    }

    constructFormArray(parentFormArray: FormArray): void {
        this.integrationLogsDetail?.forEach(() => {
            const formGroup = this.formBuilder.group({ filePath: [''] });
            parentFormArray.push(formGroup);
        });
    }

    downloadData(position: number): void {
        this.pageLoading = true;
        this.toastrService.info('Requesting file. Please wait');
        let filePath = Object.values(this.integrationlogsFormGroup.get('files').value[position])
            .pop()
            .toString();
        let fileExtensionType = filePath.split('.')[1];
        if (!fileExtensionType) {
            fileExtensionType = 'json';
        }
        let fileName = filePath.split('/').length === 1 ? this.productNumber : filePath.match(/([^\/]+)(?=\.\w+$)/)[0];
        fileName = fileExtensionType === 'json' ? fileName : `${fileName}.${fileExtensionType}`;
        this.productService.downloadintegrationLogData({ fileId: filePath }).subscribe(
            data => {
                let blob = new Blob([data], { type: environment.downloadFileType[fileExtensionType] });
                saveAs(blob, fileName);
                this.pageLoading = false;
            },
            () => {
                this.pageLoading = false;
                this.toastrService.error('Unable to download file', 'Server Error');
            }
        );
    }

    disableDownload(position: number): boolean {
        if (!this.integrationlogsFormGroup.get('files').value[position].filePath) {
            return true;
        }
        return false;
    }
}
