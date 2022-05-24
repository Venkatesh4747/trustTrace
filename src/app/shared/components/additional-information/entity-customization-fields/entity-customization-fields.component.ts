import { Component, OnInit, Input, AfterViewInit } from '@angular/core';
import * as FileSaver from 'file-saver';
import { CommonServices } from './../../../commonServices/common.service';
import { IFileInfo } from '../additional-information.model';
import { environment } from './../../../../../environments/environment';
import { UtilsService } from '../../../../shared/utils/utils.service';
import { DashboardService } from '../../../../views/dashboard/dashboard.service';
import { LocalizationService } from './../../../utils/localization.service';
import * as Highcharts from 'highcharts';
import { CustomToastrService } from '../../../../shared/commonServices/custom-toastr.service';
let More = require('highcharts/highcharts-more');
More(Highcharts);

@Component({
    selector: 'app-entity-customization-fields',
    templateUrl: './entity-customization-fields.component.html',
    styleUrls: ['./entity-customization-fields.component.scss']
})
export class EntityCustomizationFieldsComponent implements OnInit, AfterViewInit {
    @Input() fieldData: any;
    @Input() responseValues: any;

    env = environment;
    fileInfos: IFileInfo[];

    // Table field
    tableHeaders = [];
    tableData = [];
    tableRows = [];

    Highcharts = Highcharts; // required
    chartOptions: any;
    chartData: any;

    dataVal: any;

    constructor(
        public commonServices: CommonServices,
        private toastr: CustomToastrService,
        public utilService: UtilsService,
        private dashboardService: DashboardService,
        public localeService: LocalizationService
    ) {}

    ngOnInit() {
        // Process 'FILE' type field
        if (
            this.fieldData &&
            this.fieldData.displayConfig.type === 'FILE' &&
            this.responseValues !== null &&
            this.responseValues[this.fieldData.fieldId] &&
            this.responseValues[this.fieldData.fieldId][0] !== null
        ) {
            this.processFileType();
        }

        // Process 'TABLE' type field
        if (
            this.fieldData &&
            this.fieldData.displayConfig.type === 'TABLE' &&
            this.responseValues !== null &&
            this.responseValues[this.fieldData.fieldId] &&
            this.responseValues[this.fieldData.fieldId][0] !== null
        ) {
            this.dataVal = JSON.parse(this.responseValues[this.fieldData.fieldId]);
            this.tableRows = this.dataVal['rows'];

            // Get table headers
            if (this.fieldData.displayConfig.options) {
                this.fieldData.displayConfig.options.forEach(option => {
                    this.tableHeaders.push(option.key);
                });
            }
        }

        if (
            this.fieldData &&
            this.fieldData.displayConfig.type === 'SPIDER_WEB' &&
            this.responseValues !== null &&
            this.responseValues[this.fieldData.fieldId] &&
            this.responseValues[this.fieldData.fieldId][0] !== null
        ) {
            this.dataVal = JSON.parse(this.responseValues[this.fieldData.fieldId][0]);
            if (this.dataVal) {
                this.chartOptions = this.dashboardService.getFormattedChartData(this.dataVal['data'], false);
            }
        }
    }

    ngAfterViewInit() {
        if (this.chartOptions) {
            setTimeout(() => {
                // Draw a chart
                Highcharts.chart(`container-${this.fieldData.fieldId}`, this.chartOptions);
            }, 300);
        }
    }

    getFileName(fileId: string) {
        let fileInfo: IFileInfo;

        if (fileId) {
            this.commonServices.getFileName(fileId).subscribe(response => {
                const fileName = response['data']
                    .split('_')
                    .splice(1)
                    .join('');
                fileInfo = {
                    fileName: [],
                    id: ''
                };
                fileInfo.fileName.push(fileName);
                fileInfo.id = fileId;

                if (!this.fileInfos) {
                    this.fileInfos = [];
                }

                this.fileInfos.push(fileInfo);
            });
        }
    }

    processFileType() {
        if (
            this.responseValues &&
            this.responseValues !== null &&
            this.responseValues[this.fieldData.fieldId] &&
            (this.responseValues[this.fieldData.fieldId][0] !== null ||
                this.responseValues[this.fieldData.fieldId][0] !== '')
        ) {
            const fileIds = this.responseValues[this.fieldData.fieldId];

            for (let i = 0; i < fileIds.length; i++) {
                this.getFileName(fileIds[i]);
            }
        }
    }

    downloadFile(fileId: string, fileName: string) {
        this.toastr.info('Requesting file. Please wait');
        this.commonServices.downloadFile(fileId).subscribe(
            response => {
                const blob = new Blob([response], { type: 'application/octet-stream' });
                FileSaver.saveAs(blob, fileName);
                this.toastr.success('File downloaded successfully.', 'Success');
            },
            () => {
                this.toastr.error('File could not be downloaded. Please try after some time.', 'Failed');
            }
        );
    }
}
