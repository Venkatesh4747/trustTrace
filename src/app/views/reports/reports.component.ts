import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import FileSaver from 'file-saver';
import { environment as env } from '../../../environments/environment';
import { IModulesDetail, IReport, IReportDetail } from './reports.model';
import { ReportsService } from './reports.service';
import { AuthService } from '../../core';
import { CustomToastrService } from '../../shared/commonServices/custom-toastr.service';

@Component({
    selector: 'app-reports',
    templateUrl: './reports.component.html',
    styleUrls: ['./reports.component.scss']
})
export class ReportsComponent implements OnInit {
    public env = env;

    modules: IModulesDetail[];
    selectedModule: IModulesDetail;
    reports: IReport[];

    pageLoading: boolean = true;
    isFetchingReports: boolean = true;

    supportedFormatTypes = ['PDF', 'EXCEL', 'CSV'];
    supportedFormatExtension = {
        PDF: 'pdf',
        EXCEL: 'xls',
        CSV: 'csv',
        ZIP: 'zip'
    };

    FETCH_SIZE = 50;

    totalCountFlag = false;
    totalCount = 0;

    pagination = {
        from: 0,
        size: this.FETCH_SIZE
    };

    get checkAccess(): (name: string) => boolean {
        return this.authService.haveAccess.bind(this.authService);
    }

    constructor(
        private reportsService: ReportsService,
        private toastr: CustomToastrService,
        private titleService: Title,
        private authService: AuthService
    ) {
        this.titleService.setTitle('TrusTrace | Reports');
    }

    ngOnInit() {
        this.fetchModules();
    }

    handleModuleSelection(option): void {
        this.selectedModule = option;
        this.fetchReports();
    }

    fetchModules(): void {
        this.reportsService.getModules().subscribe(
            modules => {
                this.pageLoading = false;
                this.modules = modules;
                this.handleModuleSelection(this.modules[0]);
            },
            failResponse => {
                this.toastr.error('Modules could not be fetched.', 'Failed');
                this.pageLoading = false;
            }
        );
    }

    fetchReports(): void {
        this.isFetchingReports = true;
        this.reportsService.getReports(this.selectedModule.id).subscribe(
            reports => {
                this.reports = reports;
                this.isFetchingReports = false;
            },
            failResponse => {
                this.toastr.error('Reports could not be fetched. Please try after some time.', 'Failed');
                this.isFetchingReports = false;
            }
        );
    }

    doesScheduledReportTypeSupported(formatValue: string, index: number): boolean {
        if (this.reports[index].latestScheduledReport.outputFormat) {
            return this.reports[index].latestScheduledReport.outputFormat.some(
                format => format['type'] === formatValue
            );
        } else {
            return false;
        }
    }

    doesOnDemandReportTypeSupported(formatValue: string, index: number): boolean {
        //enable option for demo account user
        if (this.authService.canEnableOptions) return true;

        if (this.reports[index].latestOnDemandReport.outputFormat) {
            return this.reports[index].latestOnDemandReport.outputFormat.some(format => format['type'] === formatValue);
        } else {
            return false;
        }
    }

    onScroll(state: string): void {
        switch (state) {
            case 'back':
                if (this.pagination.from >= this.FETCH_SIZE) {
                    this.pagination.from = this.pagination.from - this.FETCH_SIZE;
                }
                break;
            case 'next':
                this.pagination.from = this.pagination.from + this.FETCH_SIZE;
                break;
            default:
                console.log('Pagination: Unknown state');
                break;
        }
        this.fetchModules();
    }

    downloadReportFile(reportName: string, report: IReportDetail, format: string, supportZIPReports: boolean): void {
        this.pageLoading = true;
        format = supportZIPReports ? 'ZIP' : format;
        this.reportsService.getReportFile(report.id, format).subscribe(
            response => {
                const blob = new Blob([response], { type: 'application/octet-stream' });
                const dateString = new Date(report.createTs).toISOString().slice(0, 10);
                FileSaver.saveAs(blob, `${reportName}-${dateString}.${this.supportedFormatExtension[format]}`);
                this.pageLoading = false;
            },
            failResponse => {
                this.toastr.error('Could not download report file. Please try after sometime.', 'Failed');
                this.pageLoading = false;
            }
        );
    }
}
