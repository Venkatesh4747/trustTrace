import { CustomToastrService } from './../../shared/commonServices/custom-toastr.service';
import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import FileSaver from 'file-saver';
import { forkJoin, Subscription } from 'rxjs';
import { environment } from './../../../environments/environment';
import { AnalyticsService } from './../../core/analytics/analytics.service';
import { CommonServices } from './../../shared/commonServices/common.service';
import { ContextService } from './../../shared/context.service';
import { UtilsService } from './../../shared/utils/utils.service';
import { IIntegrationCode, IIntegrationLogDetail } from './integration-logs.model';
import { IntegrationLogsService } from './integration-logs.service';

@Component({
    selector: 'app-integration-logs',
    templateUrl: './integration-logs.component.html',
    styleUrls: ['./integration-logs.component.scss']
})
export class IntegrationLogsComponent implements OnInit {
    env = environment;

    refresh: Subscription;

    pageLoading: boolean = true;
    isLogsAvailable: boolean = true;
    fetchingLogs: boolean = true;
    totalCountFlag: boolean = false;
    closeSortByFilter: boolean = false;

    totalCount = 0;
    FETCH_SIZE = 50;
    height = 200;

    logsFilters: any = {};
    sortByFilter = {
        sortBy: 'name',
        sortOrder: 'asc'
    };
    pagination = {
        from: 0,
        size: this.FETCH_SIZE
    };
    optionsParam = { key: 'id', value: 'value' };

    logs: IIntegrationLogDetail[] = [];
    sortByValues = [
        {
            key: 'name',
            value: 'Name'
        },
        {
            key: 'update_ts',
            value: 'Newly Added'
        }
    ];

    searchText: string = '';
    filter_session = 'integration_logs_filters';
    sortBy_session = 'integration_logs_sort';
    ANALYTICS_EVENT_INTEGRATION_LOGS_MANAGEMENT = 'Integration Logs';
    ANALYTICS_ACTION_INTEGRATION_LOGS_MANAGEMENT_VIEWED = 'Integration Logs Page Viewed';
    module = 'INTEGRATION_LOG';
    constructor(
        private toastr: CustomToastrService,
        private logsService: IntegrationLogsService,
        private commonServices: CommonServices,
        private utilsService: UtilsService,
        private titleService: Title,
        private analyticsService: AnalyticsService,
        private appContext: ContextService
    ) {
        this.titleService.setTitle('TrusTrace | Integration Logs');
    }

    ngOnInit() {
        const analyticsOptions = {};
        analyticsOptions[
            this.analyticsService.PROPERTY_ACTION_PERFORMED
        ] = this.ANALYTICS_ACTION_INTEGRATION_LOGS_MANAGEMENT_VIEWED;
        this.analyticsService.trackEvent(this.ANALYTICS_EVENT_INTEGRATION_LOGS_MANAGEMENT, analyticsOptions);
        this.initialize();
        this.refresh = this.appContext.cardViewRefresh.subscribe(refresh => {
            if (refresh) {
                this.logs = [];
                this.initialize();
            }
        });
    }

    initialize() {
        this.fetchingLogs = true;
        this.logs = [];
        if (this.utilsService.getSessionStorageValue(this.sortBy_session)) {
            this.sortByFilter = this.commonServices.getSortbyFilteredOptions(this.sortBy_session);
        } else {
            this.setSortByFilter();
        }

        const payload = this.getSearchPayload();
        forkJoin([this.logsService.getLogsFilter(), this.logsService.getLogs(payload, this.pagination)]).subscribe(
            response => {
                const filtersData = response[0]['data'];
                const posData = response[1]['data'];
                this.processLogsFilters(filtersData);
                this.processLogsResponse(posData);
                this.fetchingLogs = false;
            }
        );
    }

    setSortByFilter() {
        switch (this.sortByFilter.sortBy) {
            case this.sortByValues[0].key:
                this.sortByFilter.sortOrder = 'desc';
                break;
            case this.sortByValues[1].key:
                this.sortByFilter.sortOrder = 'desc';
                break;
        }
        this.utilsService.setSessionStorageValue(this.sortBy_session, this.sortByFilter);
    }

    isAGroup(value) {
        return value.type && value.type === 'group';
    }

    removeSpace(key: any) {
        return 'integration-logs-' + key.replace(/ /g, '-');
    }

    refreshFilter() {
        this.fetchLogsFilters();
    }

    resetPagination() {
        this.logs = [];
        this.pagination = {
            from: 0,
            size: this.FETCH_SIZE
        };
    }

    getFilteredOptions() {
        const tempFilterOptions = {};
        const options = this.utilsService.getSessionStorageValue(this.filter_session);
        if (options) {
            Object.keys(options).forEach(filterOption => {
                if (options[filterOption].length > 0) {
                    tempFilterOptions[filterOption] = options[filterOption];
                }
            });
        }
        return tempFilterOptions;
    }

    getSearchPayload() {
        const payload = {
            module: this.module,
            filter: this.getFilteredOptions()
            // sort: this.commonServices.getSortbyFilteredOptions(this.sortBy_session),
            // pagination: this.pagination
        };

        if (this.searchText !== '') {
            payload['freeHand'] = this.searchText;
        }

        return payload;
    }

    processLogsResponse(data: any) {
        if (data['ttIntegrationLogList'].length > 0) {
            const _logs = [];
            data['ttIntegrationLogList'].forEach(searchResult => {
                const _searchResult = JSON.parse(JSON.stringify(searchResult));
                _logs.push(_searchResult);
            });
            this.logs = JSON.parse(JSON.stringify(_logs));
        }

        this.totalCount = data.count;
        this.closeSortByFilter = false;
        this.pageLoading = false;
    }

    processLogsFilters(data: any) {
        this.logsFilters = data;
        this.pageLoading = false;
    }

    getAllLogs() {
        this.pageLoading = true;

        this.logsService.getLogs(this.getSearchPayload(), this.pagination).subscribe(
            response => {
                const data = response['data'];
                this.processLogsResponse(data);
            },
            () => {
                this.toastr.error(
                    this.env.error_messages.could_not_fetch_data.message,
                    this.env.error_messages.could_not_fetch_data.title
                );
                this.pageLoading = false;
            }
        );
    }

    fetchLogsFilters() {
        this.pageLoading = true;
        this.logsService.getLogsFilter().subscribe(response => {
            this.processLogsFilters(response['data']);
        });
    }

    handleFilterSelection() {
        this.resetPagination();
        this.getAllLogs();
    }

    resetAllFilters() {
        this.utilsService.setSessionStorageValue(this.filter_session, {});
        this.appContext.resetFilterOptions.next(true);
        this.fetchLogsFilters();
        this.handleFilterSelection();
    }

    handleSortBy(event) {
        this.setSortByFilter();
        this.resetPagination();
        this.getAllLogs();
    }

    searchIntegrationLogs(event) {
        if (event.key === 'Enter') {
            this.resetPagination();
            this.getAllLogs();
        }
    }

    onScroll(state: string) {
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
        this.getAllLogs();
    }

    downloadLogs(id: string) {
        this.pageLoading = true;

        this.logsService.downloadLogs(id).subscribe(
            response => {
                const blob = new Blob([response], { type: 'application/octet-stream' });
                FileSaver.saveAs(blob, `${id}.json`);
                this.toastr.success('File downloaded successfully.', 'Success');
                this.pageLoading = false;
            },
            () => {
                this.toastr.error('File could not be downloaded. Please try after some time.', 'Failed');
                this.pageLoading = false;
            }
        );
    }

    rerunLogs(id: string) {
        this.pageLoading = true;

        this.logsService.rerunLogs(id).subscribe(
            response => {
                this.pageLoading = false;
            },
            () => {
                this.toastr.error('Something went wrong. Please try after sometime.', 'Error!');
                this.pageLoading = false;
            }
        );
    }

    getIntegrationCode(integrationCode: IIntegrationCode) {
        const codes = Object.keys(integrationCode);
        let values = [];

        codes.forEach(code => {
            if (code !== 'value') {
                values.push(integrationCode[code]);
            }
        });

        values.unshift(integrationCode.value);

        return values.join(',');
    }
}
