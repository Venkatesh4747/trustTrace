import { AfterViewInit, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import * as FileSaver from 'file-saver';
import * as Highcharts from 'highcharts';
import { Subscription } from 'rxjs';
import { ContextService } from '../../../shared/context.service';
import { CHART_DATA } from '../chart-thumbnail/chart-thumbnail.const';
import { environment } from './../../../../environments/environment';
import { CommonServices } from './../../../shared/commonServices/common.service';
import { LocalizationService } from './../../../shared/utils/localization.service';
import { DashboardService } from './../dashboard.service';
import { AuthService } from '../../../core';
import { CustomToastrService } from '../../../shared/commonServices/custom-toastr.service';

@Component({
    selector: 'app-chart-detail',
    templateUrl: './chart-detail.component.html',
    styleUrls: ['./chart-detail.component.scss']
})
export class ChartDetailComponent implements OnInit, AfterViewInit {
    @Input() chartConfig;
    @Input() filter_session;
    @Input() itemId;
    @Input() fieldId: string = '';
    @Output() favorites = new EventEmitter<any>();
    status: boolean = true;

    today = new Date();
    dd;
    mm;
    yyyy;
    date;
    todayStr;

    CHART_DATA = CHART_DATA;
    Highcharts = Highcharts; // required
    chartConstructor = 'chart'; // optional string, defaults to 'chart'
    favoriteConfig: any = [];
    env = environment;
    exportUrl = environment.EXPORT_IMAGE_HIGHCHART_URL;

    // Chart Config
    getChartDetails: Subscription;

    chartOptions: any;
    showNoDataChart = false;
    pageLoading = false;

    menuOptions = [
        {
            enabled: true,
            name: 'Export as Excel(*.xlsx)'
        },
        {
            enabled: this.authService.canEnableOptions,
            name: 'Export as csv(*.csv)'
        },
        {
            enabled: this.authService.canEnableOptions,
            name: 'Download as .pdf'
        },
        {
            enabled: true,
            name: 'Download as .jpeg'
        }
    ];

    fileType = {
        excel: 'application/pdf',
        csv: 'text/csv',
        pdf: 'application/pdf',
        jpeg: 'image/jpeg'
    };

    downloadType = {
        excel: 'application/pdf',
        csv: 'text/csv',
        pdf: 'application/pdf',
        jpeg: 'image/jpeg'
    };

    constructor(
        private dashboardService: DashboardService,
        private commonServices: CommonServices,
        private localeService: LocalizationService,
        private appContext: ContextService,
        private toastrService: CustomToastrService,
        private authService: AuthService
    ) {}

    ngOnInit() {
        this.dd = String(this.today.getDate()).padStart(2, '0');
        this.mm = String(this.today.getMonth() + 1).padStart(2, '0'); //January is 0!
        this.yyyy = this.today.getFullYear();
        this.todayStr = this.mm + '_' + this.dd + '_' + this.yyyy;
        this.pageLoading = true;
        this.generateChart(this.chartConfig);
        // Disable chart menu option export as excel for food industry for a while
        const domain = window.location.hostname;
        if (domain.indexOf('food') >= 0) {
            this.menuOptions[0].enabled = false;
        }
        //Disable chart menu option Download as .jpeg for table chart
        if (this.chartConfig.chartType === 'TABLE') {
            this.menuOptions[3].enabled = false;
        }
        this.getFavConifg();
    }

    isFavorite(): void {
        this.favoriteConfig.forEach(element => {
            if (element.displayName === this.chartConfig.nameX) {
                this.status = false;
            }
        });
    }

    ngAfterViewInit() {
        // Draw a chart
        // Highcharts.chart(`container-${this.index}`, this.chartOptions);
        if (this.chartConfig.chartType !== 'TABLE') {
            this.setHighChartInContainer();
        }
    }

    handleBackClick() {
        this.appContext.chartDetailData.next({});
        this.appContext.showChartDetail.next(false);
    }

    setHighChartInContainer() {
        if (!this.showNoDataChart) {
            // Draw a chart
            Highcharts.chart('container', this.chartOptions);
        }
    }

    // Dynamic Chart
    generateChart(data) {
        this.appContext.showChartDetail.next(true);
        this.showNoDataChart = false;
        if (data.payload.x.length === 0 || data.payload.series.length === 0) {
            this.showNoDataChart = true;
            this.menuOptions[0].enabled = false;
            this.menuOptions[this.menuOptions.length - 1].enabled = false;
        } else {
            this.menuOptions[0].enabled = true;
            this.menuOptions[this.menuOptions.length - 1].enabled = true;
            this.chartOptions = this.dashboardService.getFormattedChartData(data, false);
        }
        this.pageLoading = false;
    }

    getCategoriesLocaleName(data) {
        if (Array.isArray(data)) {
            const displayText = [];
            data.map(item => {
                displayText.push(this.localeService.getDisplayText(item));
            });
            return displayText;
        } else {
            return this.localeService.getDisplayText(data);
        }
    }

    downloadChartImage() {
        const data = {
            options: JSON.stringify(this.chartOptions),
            filename: this.chartConfig.nameX,
            type: 'image/jpeg',
            async: true
        };
        this.dashboardService.downloadChartImage(this.exportUrl, data).subscribe(response => {
            const downloadLink = `${this.exportUrl}${response}`;
            this.commonServices.downloadImage(downloadLink, this.chartConfig.nameX);
        });
    }

    onMenuSelect(option: string) {
        const fileType = this.fileType;
        const downloadType = this.downloadType;
        switch (option) {
            // Download Excel
            case this.menuOptions[0].name:
                this.downloadChartDataAsExcel();
                break;
            case this.menuOptions[1].name:
            case this.menuOptions[2].name:
                break;

            // Download as .jpeg
            case this.menuOptions[3].name:
                this.downloadChartImage();
                break;
        }
    }
    downloadChartDataAsExcel() {
        const filterOption = this.dashboardService.getCurrentFilterSelection(this.filter_session);

        const payload = {
            itemId: this.itemId,
            customFieldId: this.fieldId,
            filter: filterOption
        };
        this.dashboardService.exportChartDataAsExcel(payload).subscribe(
            (response: any) => {
                const blob = new Blob([response], { type: 'application/octet-stream' });
                let fileName = this.chartConfig.nameX.split(' ').join('_') + '_' + this.todayStr + '_' + '.xlsx';
                FileSaver.saveAs(blob, fileName);
            },
            error => {
                this.onDownloadErrorHandle(error);
            }
        );
    }

    private onDownloadErrorHandle(data: any): void {
        if (data.hasOwnProperty('error') && data.error.hasOwnProperty('error')) {
            this.toastrService.error(`Failed to download file. Error: ${data.error.error}`);
        } else {
            this.toastrService.error(`Failed to download file. Please try again later.`);
        }
    }

    getTableClassName() {
        switch (this.chartOptions.columnData[0]['data'].length) {
            case 1:
                return 'one-column-table';
            case 2:
                return 'two-column-table';
            case 3:
                return 'three-column-table';
            case 4:
                return 'four-column-table';
        }
    }
    getFavConifg(): void {
        this.dashboardService.getFavConfig().subscribe(
            favConfigResp => {
                this.favoriteConfig = favConfigResp['data']['config'];
                this.favorites.emit(this.favoriteConfig);
                this.isFavorite();
            },
            failResponse => {
                this.toastrService.info(this.env.error_messages.no_authorization, 'Insufficient Permission');
            }
        );
    }

    clickEvent(chartConfig): void {
        this.dashboardService.createFavChart(chartConfig).subscribe(
            favConfigResp => {
                if (this.status) {
                    this.toastrService.success('Added to favorites', 'Success');
                    this.status = false;
                } else {
                    this.toastrService.success('Removed from favorites', 'Success');
                    this.status = true;
                }
                this.getFavConifg();
            },
            failResponse => {
                this.toastrService.error('Unable to add chart to favorites, Failed');
            }
        );
    }
}
