import { AfterViewInit, Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import * as Highcharts from 'highcharts';
import { Subscription, Subject } from 'rxjs';
import { environment } from './../../../../environments/environment';
import { CommonServices } from './../../../shared/commonServices/common.service';
import { ContextService } from './../../../shared/context.service';
import { DashboardService } from './../dashboard.service';
import { CHART_DATA } from './chart-thumbnail.const';
import { LocalizationService } from '../../../shared/utils/localization.service';
import { SassHelperComponent } from '../../../../styles/sass-helper/sass-helper.component';
import { CustomToastrService } from '../../../shared/commonServices/custom-toastr.service';

@Component({
    selector: 'app-chart-thumbnail',
    templateUrl: './chart-thumbnail.component.html',
    styleUrls: ['./chart-thumbnail.component.scss']
})
export class ChartThumbnailComponent implements OnInit, AfterViewInit {
    @Input() index: number;
    @Input() title: string;
    @Input() type: string;
    @Input() id: string;
    @Input() fieldId: string = '';
    @Output() showDetailChart = new EventEmitter();
    @Input() thumbnailViewChanged: Subject<any>;

    @ViewChild(SassHelperComponent, { static: true })
    private sassHelper: SassHelperComponent;

    CHART_DATA = CHART_DATA;

    Highcharts = Highcharts; // required
    chartConstructor = 'chart'; // optional string, defaults to 'chart'
    exportUrl = environment.EXPORT_IMAGE_HIGHCHART_URL;

    // Chart Config
    getChartDetails: Subscription;

    env = environment;
    dataFetchInitiated = false;
    showNoDataChart = false;
    dataPresent = true;
    pageLoading = true;
    shouldLoadFirst = false;
    chartData: any;
    chartOptions: any;
    menuOptions = [
        {
            enabled: false,
            name: 'Export as Excel(*.xlsx)'
        },
        {
            enabled: false,
            name: 'Export as csv(*.csv)'
        },
        {
            enabled: false,
            name: 'Download as .pdf'
        },
        {
            enabled: false,
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
        private appContext: ContextService,
        private localizationService: LocalizationService,
        private toastService: CustomToastrService
    ) {}

    ngOnInit() {}

    ngAfterViewInit() {
        this.loadInitialCharts();
        this.thumbnailViewChanged.subscribe(event => {
            this.loadData();
        });
    }

    loadInitialCharts() {
        var totalHeight = window.innerHeight || document.documentElement.clientHeight;
        var chartCategoriesHeader = document.getElementById('chart-categories');
        var chartThumbnailWrapperTop = chartCategoriesHeader.getBoundingClientRect().bottom;
        var chartThumbnailHeight = this.sassHelper.readProperty('chart-thumbnail-height');
        if (chartThumbnailHeight.endsWith('px')) {
            chartThumbnailHeight = chartThumbnailHeight.substring(0, chartThumbnailHeight.length - 2);
        }
        var chartsToLoadFirstCount = (totalHeight - chartThumbnailWrapperTop) / Number(chartThumbnailHeight);
        if (this.index < Math.ceil(chartsToLoadFirstCount) * 4) {
            this.getChartData();
        }
    }
    downloadChartImage() {
        const data = {
            options: JSON.stringify(this.chartOptions),
            filename: this.title,
            type: 'image/jpeg',
            async: true
        };
        this.dashboardService.downloadChartImage(this.exportUrl, data).subscribe(response => {
            const downloadLink = `${this.exportUrl}${response}`;
            this.commonServices.downloadImage(downloadLink, this.title);
        });
    }

    loadData() {
        if (!this.dataFetchInitiated && this.isElementInViewport()) {
            this.getChartData();
        }
    }

    isElementInViewport() {
        var element = document.getElementById('chart-thumbnail-wrapper-' + this.id);
        if (!element) {
            return false;
        }
        var rect = element.getBoundingClientRect();
        return rect.top < (window.innerHeight || document.documentElement.clientHeight);
    }

    onMenuSelect(option: string) {
        const fileType = this.fileType;
        const downloadType = this.downloadType;
        switch (option) {
            case this.menuOptions[0].name:
            case this.menuOptions[1].name:
            case this.menuOptions[2].name:
                break;

            // Download as .jpeg
            case this.menuOptions[3].name:
                this.downloadChartImage();
                break;
        }
    }

    onChartClick() {
        const data = {
            id: this.id,
            fieldId: this.fieldId,
            type: this.type
        };
        this.appContext.chartDetailData.next(data);
        this.appContext.showChartDetail.next(true);
    }

    getChartData() {
        this.dataFetchInitiated = true;
        this.dashboardService.getChartFilters(this.id, this.fieldId).subscribe(
            response => {
                this.localizationService.addToMasterData(response.data['masterData']);
                var chartFilters = (chartFilters = response['data']['filter_data']);
                var filterOptions = {};
                for (const key in chartFilters) {
                    if (chartFilters.hasOwnProperty(key)) {
                        filterOptions[key] = [];
                    }
                }
                this.dashboardService.populateDefaultYearFilter(chartFilters, filterOptions, this.type);
                const payload = {
                    itemId: this.id,
                    customFieldId: this.fieldId,
                    filter: filterOptions
                };
                this.dashboardService.getChartData(payload).subscribe(response => {
                    const data = response['data'];
                    this.localizationService.addToMasterData(data['masterData']);
                    this.chartData = data['data'];
                    if (
                        !this.chartData.payload ||
                        !this.chartData.payload.x ||
                        this.chartData.payload.x.length === 0 ||
                        this.chartData.payload.series.length === 0
                    ) {
                        this.dataPresent = false;
                        this.showNoDataChart = true;
                    } else {
                        this.generateChart(this.chartData);
                    }
                    this.pageLoading = false;
                });
            },
            failResponse => {
                if (failResponse.error.message === 'Access is denied') {
                    this.toastService.info(this.env.error_messages.no_authorization, 'Insufficient Permission');
                }
                this.pageLoading = false;
            }
        );
    }

    // Dynamic Chart
    generateChart(chartResponse) {
        this.chartOptions = this.dashboardService.getFormattedChartData(chartResponse, true);

        if (this.type !== 'TABLE') {
            Highcharts.chart(`container-${this.index}`, this.chartOptions);
        }
    }
}
