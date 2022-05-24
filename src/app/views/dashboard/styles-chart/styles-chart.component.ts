import { Component, Input, OnInit } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { LocalizationService } from './../../../shared/utils/localization.service';
import { UtilsService } from './../../../shared/utils/utils.service';
import { DashboardService } from './../dashboard.service';

@Component({
    selector: 'app-styles-chart',
    templateUrl: './styles-chart.component.html',
    styleUrls: ['./styles-chart.component.scss']
})
export class StylesChartComponent implements OnInit {
    @Input() showChartDetail;
    @Input() chartData?;
    env = environment;
    chartItems;
    filter_session = 'chart_filters';
    filterOptions = {};
    chartFilters = {};
    chartConfig = {};
    // showChartDetail = false;
    showFilterBar = false;
    pageLoading = false;
    isFetchingChartData = true;
    itemId;
    chartType;
    fieldId;

    constructor(
        private dashboardService: DashboardService,
        private utils: UtilsService,
        private localizationService: LocalizationService
    ) {}

    ngOnInit() {
        this.pageLoading = true;
        this.dashboardService.getChartConfig().subscribe(chartConfig => {
            const data = chartConfig['data'];
            this.chartItems = data['config'][0]['items'];
            this.pageLoading = false;
        });

        if (this.showChartDetail) {
            this.itemId = this.chartData.id;
            this.fieldId = this.chartData.customFieldId;
            this.chartType = this.chartData.type;
            this.getChartFilters();
        }
    }

    getChartFilters() {
        this.pageLoading = true;
        this.dashboardService.getChartFilters(this.itemId, this.fieldId).subscribe(chartFiltersResp => {
            this.localizationService.addToMasterData(chartFiltersResp.data['masterData']);
            const chartFilters = chartFiltersResp['data']['filter_data'];
            this.chartFilters = {};
            for (const key in chartFilters) {
                if (chartFilters.hasOwnProperty(key)) {
                    this.filterOptions[key] = [];
                    this.chartFilters[key] = [];
                    chartFilters[key].forEach(option => {
                        this.chartFilters[key].push(option.value);
                    });
                }
            }
            this.setFilterOptions();
            this.getChartData();
            this.showFilterBar = true;
            this.pageLoading = false;
        });
    }

    setFilterOptions() {
        const currentYear = new Date().getFullYear();
        this.filterOptions = this.updateFiltersSelection();

        if (this.filterOptions['Year'].indexOf(`${currentYear}`) === -1) {
            this.filterOptions['Year'].push(`${currentYear}`);
        }
        if (this.chartType === 'LINE') {
            let i = 1;
            while (i <= 4) {
                if (this.filterOptions['Year'].indexOf(`${currentYear - i}`) === -1) {
                    this.filterOptions['Year'].push(`${currentYear - i}`);
                }
                i = i + 1;
            }
        }
        this.utils.setSessionStorageValue(this.filter_session, this.filterOptions);
    }

    updateFiltersSelection() {
        return this.utils.getSessionStorageValue(this.filter_session) || {};
    }

    getChartData() {
        this.pageLoading = true;
        this.filterOptions = this.updateFiltersSelection();
        const payload = {
            itemId: this.itemId,
            filter: this.getFilteredOptions()
        };
        // if (this.searchText !== '') {
        //     payload['freeHand'] = this.searchText;
        // }
        this.isFetchingChartData = true;
        this.dashboardService.getChartData(payload).subscribe(response => {
            const data = response['data'];
            this.localizationService.addToMasterData(data['masterData']);
            this.chartConfig = data['data'];
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
}
