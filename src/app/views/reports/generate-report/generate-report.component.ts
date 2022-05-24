import { AuthService } from './../../../core/user/auth.service';
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CommonServices } from '../../../shared/commonServices/common.service';
import { InformationConfirmDialogComponent } from '../../../shared/modals/information-confirm-dialog/information-confirm-dialog.component';
import {
    IDateRange,
    IGenerateReportPayload,
    IModulesDetail,
    IReportConfig,
    IFilterConfig,
    IFilter
} from '../reports.model';
import { ReportsService } from '../reports.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CustomToastrService } from '../../../shared/commonServices/custom-toastr.service';

@Component({
    selector: 'app-generate-report',
    templateUrl: './generate-report.component.html',
    styleUrls: ['./generate-report.component.scss']
})
export class GenerateReportComponent implements OnInit {
    pageLoading = true;
    modules: IModulesDetail[];
    reportConfigs: IReportConfig[];
    filterConfigs: IFilterConfig[];
    dateFilters: string[];

    filters: IFilter = {
        name: '',
        value: []
    };
    generateReportPayload: IGenerateReportPayload = {
        report: '',
        filterInput: {},
        filter: [],
        dateFilter: [],
        brandContextId: ''
    };

    config = {
        reportType: undefined,
        report: undefined
    };

    reportTypeParams = {
        key: 'id',
        value: 'name',
        selectedKey: 'id'
    };
    parameters = {
        key: 'id',
        value: 'name',
        selectedKey: 'id'
    };

    dateRanges: IDateRange[] = [
        { id: '0', value: 'Last 30 days', disableInputFields: true, config: { action: 'sub', days: 30 } },
        { id: '1', value: 'Custom date', disableInputFields: false, config: { action: 'custom', days: 30 } }
    ];
    selectedDateRange;
    reportMaxDays;
    isDateFilterNeeded: boolean = true;

    constructor(
        private reportsService: ReportsService,
        private toastr: CustomToastrService,
        public commonServices: CommonServices,
        private dialog: MatDialog,
        private router: Router,
        private route: ActivatedRoute,
        private authService: AuthService
    ) {}

    ngOnInit(): void {
        this.fetchModules();
        this.generateReportPayload.brandContextId =
            this.authService.user.brandsAssociated.length > 0
                ? this.authService.user.brandsAssociated[0]
                : '000000000000000000000000';
    }

    fetchModules(): void {
        this.reportsService.getModules().subscribe(
            modules => {
                this.modules = modules;
                this.pageLoading = false;
            },
            failResponse => {
                this.toastr.error('Modules could not be fetched.', 'Failed');
                this.pageLoading = false;
            }
        );
    }

    fetchReportConfigs(module: string): void {
        this.pageLoading = true;
        this.reportsService.getReportConfigs(module).subscribe(
            configs => {
                this.reportConfigs = configs;
                this.pageLoading = false;
            },
            failResponse => {
                this.toastr.error('Modules could not be fetched.', 'Failed');
                this.pageLoading = false;
            }
        );
    }

    fetchFilterConfigs(processor: string): void {
        this.reportsService.getFilterConfigs(processor).subscribe(
            configs => {
                if (configs && configs.filters) {
                    this.filterConfigs = configs.filters;
                    Object.keys(this.filterConfigs).forEach(filter => {
                        this.filters = {
                            name: '',
                            value: []
                        };
                        this.filters.name = filter;
                        this.generateReportPayload.filter.push(this.filters);
                    });
                }
                if (configs && configs.date_filters) {
                    this.dateFilters = configs.date_filters;
                }
                this.pageLoading = false;
            },
            () => {
                this.toastr.error('Filters could not be fetched.', 'Failed');
                this.pageLoading = false;
            }
        );
    }

    onChooseReport(report: IReportConfig): void {
        this.generateReportPayload.report = report.processor;
        this.reportMaxDays = report.maxDays;
        this.fetchFilterConfigs(report.processor);
        this.isDateFilterNeeded = report.dateFilterNeeded === false ? false : true;
    }

    onChooseReportType(module: IModulesDetail): void {
        this.fetchReportConfigs(module.id);
    }

    handleDateRangeSelection(eventData: any): void {
        this.selectedDateRange = eventData;
        this.generateReportPayload.filterInput = {
            date: this.selectedDateRange
        };
    }

    handleCustomDateRangeSelection(eventData: any, filter: string): void {
        this.selectedDateRange = eventData;
        this.generateReportPayload.filterInput = {
            date: this.selectedDateRange
        };
        if (filter) {
            let filterInput = {
                name: filter,
                date: this.selectedDateRange
            };
            this.generateReportPayload.dateFilter.push(filterInput);
        }
    }

    getPlaceHolder(filter: string): string {
        return `Type to select ${filter}`;
    }

    generateNewReport(): void {
        this.pageLoading = true;
        this.reportsService.generateReport(this.generateReportPayload).subscribe(
            response => {
                this.pageLoading = false;
                this.openConfirmationDialog();
                this.config = {
                    reportType: undefined,
                    report: undefined
                };
                this.generateReportPayload = {
                    report: '',
                    filterInput: {},
                    filter: [],
                    dateFilter: [],
                    brandContextId: ''
                };
            },
            failResponse => {
                this.toastr.error('Could not generate report. Please try after sometime.', 'Failed');
                this.pageLoading = false;
            }
        );
    }

    openConfirmationDialog(): void {
        const confirmationDialog = this.dialog.open(InformationConfirmDialogComponent, {
            width: '372px',
            panelClass: 'generate-report-confirmation-dialog',
            data: {
                title: `${this.commonServices.getTranslation('Generating Report')}...`,
                msg: this.commonServices.getTranslation(
                    'Report will be generated and you can access it from Reports page in less than 10 minutes'
                ),
                buttonText: 'Close',
                class: 'generate-report-confirmation-dialog',
                showClose: false,
                isMultiple: false
            }
        });
        confirmationDialog.afterClosed().subscribe(result => {
            this.router.navigate(['../'], { relativeTo: this.route });
        });
    }
}
