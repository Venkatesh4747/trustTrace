import { Component, Input, OnInit, EventEmitter, Output } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { LocalizationService } from './../../../shared/utils/localization.service';
import { UtilsService } from './../../../shared/utils/utils.service';
import { DashboardService } from './../dashboard.service';

@Component({
    selector: 'app-charts',
    templateUrl: './charts.component.html',
    styleUrls: ['./charts.component.scss']
})
export class ChartsComponent implements OnInit {
    @Input() chartDetailData;
    @Output() favorites = new EventEmitter<any>();
    @Output() chartName = new EventEmitter<any>();
    env = environment;
    filter_session = 'chart_filters';
    chartFilters = {};
    chartConfig = {};
    showFilterBar = false;
    isFetchingChartData = true;
    pageLoading = false;
    pageLoadingSpinner = true;
    optionsParam = { key: 'key', value: 'value', groupKey: 'group_1_id', groupValue: 'group_1_value' };

    constructor(
        private dashboardService: DashboardService,
        private utils: UtilsService,
        private localizationService: LocalizationService
    ) {}

    ngOnInit() {
        this.pageLoading = true;
        this.filter_session = this.filter_session + '_' + this.chartDetailData.id;
        this.getChartFilters();
    }

    getChartFilters() {
        this.dashboardService
            .getChartFilters(this.chartDetailData.id, this.chartDetailData.fieldId)
            .subscribe(chartFiltersResp => {
                this.localizationService.addToMasterData(chartFiltersResp.data['masterData']);
                this.chartFilters = chartFiltersResp['data']['filter_data'];
                if (this.chartFilters['Year']) {
                    this.setFilterOptions();
                }
                setTimeout(() => {
                    this.getChartData();
                });
                this.showFilterBar = true;
            });
    }

    setFilterOptions() {
        let sessionStoragefilterOptions = this.updateFiltersSelection();

        if (!sessionStoragefilterOptions) {
            sessionStoragefilterOptions = {};
            sessionStoragefilterOptions['Year'] = [];
        }

        if (sessionStoragefilterOptions['Year'] && this.chartFilters['Year'].length > 0) {
            const latestYear = this.chartFilters['Year'][0]['value'];

            if (sessionStoragefilterOptions['Year'].indexOf(`${latestYear}`) === -1) {
                sessionStoragefilterOptions['Year'].push(`${latestYear}`);
            }
            if (this.chartDetailData.type === 'LINE') {
                let i = 1;
                while (i <= 4) {
                    if (sessionStoragefilterOptions['Year'].indexOf(`${latestYear - i}`) === -1) {
                        sessionStoragefilterOptions['Year'].push(`${latestYear - i}`);
                    }
                    i = i + 1;
                }
            }
        }

        this.utils.setSessionStorageValue(this.filter_session, sessionStoragefilterOptions);
    }

    updateFiltersSelection() {
        return this.utils.getSessionStorageValue(this.filter_session);
    }

    getChartData() {
        this.pageLoading = true;
        const payload = {
            itemId: this.chartDetailData.id,
            customFieldId: this.chartDetailData.fieldId,
            filter: this.getFilteredOptions()
        };
        this.isFetchingChartData = true;
        this.dashboardService.getChartData(payload).subscribe(response => {
            const data = response['data'];
            this.localizationService.addToMasterData(data['masterData']);
            this.chartConfig = data['data'];
            this.chartName.emit(this.chartConfig);
            this.isFetchingChartData = false;
            this.pageLoading = false;
        });
    }

    getFilteredOptions() {
        const tempFilterOptions = {};
        const options = this.utils.getSessionStorageValue(this.filter_session);
        if (options) {
            Object.keys(options).forEach(filterOption => {
                if (options[filterOption].length > 0) {
                    tempFilterOptions[filterOption] = options[filterOption];
                }
            });
        }
        return tempFilterOptions;
    }

    updateFavCharts(event): void {
        this.favorites.emit(event);
    }
}
