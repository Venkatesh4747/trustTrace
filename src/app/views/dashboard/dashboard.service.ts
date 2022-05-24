import { CommonServices } from './../../shared/commonServices/common.service';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { UtilsService } from '../../shared/utils/utils.service';
import { LocalizationService } from '../../shared/utils/localization.service';
import { ChartOptions, ChartData } from './dashboard.model';

@Injectable()
export class DashboardService {
    constructor(
        private http: HttpClient,
        private utilService: UtilsService,
        private localeService: LocalizationService,
        private commonService: CommonServices
    ) {}

    getChartConfig(): Observable<any> {
        const url = environment.api.charts.getConfigV2;
        return this.http.get(url);
    }
    getFavConfig(): Observable<any> {
        const url = environment.api.charts.getFavConfig;
        return this.http.get(url);
    }
    public createFavChart(payload: any): Observable<any> {
        return this.http.post(environment.api.charts.createFavChart, payload);
    }

    getChartFilters(itemId: string, fieldId: string): Observable<any> {
        let url = environment.api.charts.getFilters;
        url = url.replace('$itemId', itemId);

        if (fieldId) {
            url = url.replace('$customFieldId', fieldId);
        } else {
            url = url.replace('?customFieldId=$customFieldId', '');
        }

        return this.http.get(url);
    }

    getChartData(payload) {
        // Get Chart Data
        const url = environment.api.charts.getChartData;
        return this.http.post(url, payload);
    }

    getChartInfo(category, criteria, filterCriteria) {
        let url = environment.api.charts.getInfo;
        url = category ? url.replace('$category', category) : url.replace('$category', '');
        url = criteria ? url.replace('$criteria', criteria) : url.replace('$criteria', '');
        url = filterCriteria ? url.replace('$filterCriteria', filterCriteria) : url.replace('$filterCriteria', '');
        return this.http.get(url);
    }

    getSupplierInfo(filter1?, filter2?): Observable<any> {
        let url = environment.api.dashboard.getSupplierInfo;
        if (filter1 !== undefined) {
            url = url.replace('$selectionOption', filter1);
        } else {
            url = url.replace('$selectionOption', '');
        }
        if (filter2 !== undefined) {
            url = url.replace('$filterOption', filter2);
        } else {
            url = url.replace('$filterOption', '');
        }
        return this.http.get(url);
    }

    getStyleInfo(filter1?, filter2?, option?): Observable<any> {
        let url = environment.api.dashboard.getStyleInfo;
        if (filter1 !== undefined) {
            url = url.replace('$1', filter1);
        } else {
            url = url.replace('?filter1=$1', '');
        }
        if (filter2 !== undefined) {
            url = url.replace('$2', filter2);
        } else {
            url = url.replace('&filter2=$2', '');
        }
        if (option !== undefined) {
            url = url.replace('$3', option);
        } else {
            url = url.replace('&option=$3', '');
        }
        return this.http.get(url);
    }

    downloadChartImage(url, data) {
        return this.http.post(url, data, { responseType: 'text' });
    }

    getCurrentFilterSelection(filter_session) {
        const tempFilterOptions = {};
        const options = this.utilService.getSessionStorageValue(filter_session);
        if (options) {
            Object.keys(options).forEach(filterOption => {
                if (options[filterOption].length > 0) {
                    tempFilterOptions[filterOption] = options[filterOption];
                }
            });
        }
        return tempFilterOptions;
    }

    populateDefaultYearFilter(chartFilters, filterOptions, chartType) {
        if (filterOptions['Year'] && chartFilters['Year'].length > 0) {
            const latestYear = chartFilters['Year'][0]['value'];

            if (filterOptions['Year'].indexOf(`${latestYear}`) === -1) {
                filterOptions['Year'].push(`${latestYear}`);
            }
            if (chartType === 'LINE') {
                let i = 1;
                while (i <= 4) {
                    if (filterOptions['Year'].indexOf(`${latestYear - i}`) === -1) {
                        filterOptions['Year'].push(`${latestYear - i}`);
                    }
                    i = i + 1;
                }
            }
        }
    }

    //chart export

    exportChartDataAsExcel(payload) {
        const url = environment.api.charts.exportChartData;
        return this.http.post(url, payload, {
            responseType: 'blob' as 'blob'
        });
    }

    getFormattedChartData(chartResponse, isThumbnailRequest) {
        const chartType = chartResponse.chartType;
        const chartData = chartResponse;

        var chartOptions = {};
        switch (chartType) {
            case 'PIE':
                chartOptions = this.generatePieChart(chartData, isThumbnailRequest);
                break;
            case 'BAR':
                chartOptions = this.generateBarChart(chartData, isThumbnailRequest);
                break;
            case 'STACK':
                chartOptions = this.generateStackedColumnChart(chartData, isThumbnailRequest);
                break;
            case 'FIXED_PLACEMENT':
                chartOptions = this.generateFixedPlacementChart(chartData, isThumbnailRequest);
                break;
            case 'LINE':
                chartOptions = this.generateLineChart(chartData, isThumbnailRequest);
                break;
            case 'SPIDER_WEB':
                chartOptions = this.generateSpiderWebChart(chartData, isThumbnailRequest);
                break;
            case 'GROUP_BAR':
                chartOptions = this.generateGroupBarChart(chartData, isThumbnailRequest);
                break;
            case 'TABLE':
                chartOptions = this.generateTable(chartData, isThumbnailRequest);
                break;
            case 'SCATTER_PLOT':
                chartOptions = this.generateScatterPlot(chartData, isThumbnailRequest);
                break;
            default:
                chartOptions = this.generateBarChart(chartData, isThumbnailRequest);
                break;
        }
        return chartOptions;
    }

    generateStackedColumnChart(chartData, isThumbnailRequest) {
        var chartOptions = {
            chart: {
                type: 'column'
            },
            title: {
                text: ''
            },
            xAxis: {
                categories: this.getCategoriesLocaleName(chartData.payload.x)
            },
            // To hide highcharts.com text at the bottom
            credits: {
                enabled: false
            },
            tooltip: {
                headerFormat: '<b>{point.x}</b><br/>',
                pointFormatter: function() {
                    if (chartData.stackLabels) {
                        return this.series.name + ':' + this.y + '<br>Total:' + this.stackTotal;
                    } else {
                        return this.series.name + ':' + this.y;
                    }
                }
            },
            series: chartData.payload.series
        };
        //COLOR (if no property found uses default colors)
        if (chartData.hasOwnProperty('colors')) chartOptions['colors'] = chartData.colors;
        if (isThumbnailRequest) {
            chartOptions['legend'] = {
                enabled: false
            };

            chartOptions['yAxis'] = {
                min: 0,
                title: {
                    text: ''
                }
            };

            chartOptions['plotOptions'] = {
                column: {
                    grouping: false,
                    shadow: false,
                    borderWidth: 0
                }
            };
        } else {
            chartOptions['legend'] = {
                align: 'right',
                verticalAlign: 'top',
                layout: 'vertical',
                x: 0,
                y: 100,
                itemMarginTop: 10
            };

            chartOptions['yAxis'] = {
                min: 0,
                title: {
                    text: chartData.nameY
                },
                stackLabels: {
                    enabled: chartData.stackLabels,
                    style: {
                        fontWeight: 'bold'
                    }
                }
            };

            chartOptions['plotOptions'] = {
                column: {
                    stacking: 'normal',
                    dataLabels: {
                        enabled: chartData.stackLabels,
                        formatter: function() {
                            if (this.y !== 0) {
                                return this.y;
                            }
                        }
                    }
                }
            };
        }
        return chartOptions;
    }

    generateScatterPlot(chartData: ChartData, isThumbnailRequest: boolean): ChartOptions {
        return {
            chart: {
                type: 'scatter',
                text: '',
                enabled: true
            },
            title: {
                text: '',
                enabled: true,
                type: ''
            },
            subtitle: {
                text: '',
                enabled: true,
                type: ''
            },
            credits: {
                enabled: false,
                type: '',
                text: ''
            },
            xAxis: {
                title: {
                    enabled: true,
                    text: this.getCategoriesLocaleName(chartData.payload.x),
                    type: ''
                }
            },
            yAxis: {
                title: {
                    enabled: true,
                    text: chartData.nameY,
                    type: ''
                }
            },
            legend: {
                enabled: false,
                type: '',
                text: ''
            },
            plotOptions: {
                scatter: {
                    marker: {
                        radius: 5,
                        states: {
                            hover: {
                                enabled: true,
                                lineColor: 'rgb(100,100,100)'
                            }
                        }
                    },
                    states: {
                        hover: {
                            marker: {
                                enabled: false
                            }
                        }
                    },
                    tooltip: {
                        headerFormat: '',
                        pointFormatter: function() {
                            return `${this.series.name[0]}: ${this.title}<br>
                                    ${this.series.name[1]}: ${this.x} <br>
                                    ${this.series.name[2]}: ${this.y} <br>
                                    ${this.series.name[3]}: ${this.value1}<br>
                                    ${this.series.name[4]}: ${this.value2}`;
                        }
                    }
                }
            },
            series: [
                {
                    name: chartData.payload.header,
                    color: 'rgba(223, 83, 83, .5)',
                    data: chartData.payload.series
                }
            ]
        };
    }

    generatePieChart(chartData, isThumbnailRequest) {
        var chartOptions = {
            chart: {
                type: 'pie'
            },
            // Loading
            loading: {
                hideDuration: 1000,
                showDuration: 1000
            },
            title: {
                text: ''
            },
            series: chartData.payload.series,
            tooltip: {
                useHTML: true,
                pointFormat:
                    '<span style="color:{point.color}">\u25A0</span><b>&nbsp;{point.y}&nbsp;({point.percentage:.1f}%)</b>'
            },
            plotOptions: {
                pie: {
                    allowPointSelect: true,
                    cursor: 'pointer',
                    showInLegend: true
                },
                series: {
                    cursor: 'pointer',
                    dataLabels: {
                        format: '<b>{point.name}<b><br><b>{point.percentage:.1f} %<b>',
                        enabled: true,
                        formatter: function() {
                            return Math.round(this.percentage * 100) / 100 + ' %';
                        }
                    }
                }
            },
            // To hide highcharts.com text at the bottom
            credits: {
                enabled: false
            }
        };

        if (isThumbnailRequest) {
            chartOptions['legend'] = {
                enabled: false
            };

            chartOptions['yAxis'] = {
                title: {
                    text: ''
                }
            };
        } else {
            chartOptions['legend'] = {
                align: 'right',
                verticalAlign: 'top',
                layout: 'vertical',
                x: 0,
                y: 100,
                itemMarginTop: 10
            };

            chartOptions['yAxis'] = {
                title: {
                    text: chartData.nameY
                }
            };
        }
        return chartOptions;
    }

    generateBarChart(chartData, isThumbnailRequest) {
        var chartOptions = {
            chart: {
                type: 'column'
            },
            title: {
                text: ''
            },
            xAxis: {
                categories: this.getCategoriesLocaleName(chartData.payload.x),
                crosshair: true
            },
            // To hide highcharts.com text at the bottom
            credits: {
                enabled: false
            },
            plotOptions: {
                column: {
                    pointPadding: 0.2,
                    borderWidth: 0,
                    colorByPoint: true
                }
            },
            series: [
                {
                    name: chartData.payload.series[0].name,
                    data: chartData.payload.series[0].data
                }
            ],
            legend: {
                enabled: false
                // align: 'right',
                // verticalAlign: 'top',
                // layout: 'vertical',
                // x: 0,
                // y: 100,
                // itemMarginTop: 10
            }
        };

        //COLOR (if no property found uses default colors)
        chartOptions['colors'] = chartData.hasOwnProperty('colors')
            ? chartData.colors
            : environment.defaultChartColorPalettes;

        if (isThumbnailRequest) {
            chartOptions['yAxis'] = {
                title: {
                    text: ''
                }
            };
        } else {
            chartOptions['yAxis'] = {
                min: 0,
                tickInterval: 1,
                title: {
                    text: chartData.nameY
                }
            };
        }
        return chartOptions;
    }

    generateFixedPlacementChart(chartData, isThumbnailRequest) {
        var chartOptions = {
            chart: {
                type: 'column'
            },
            title: {
                text: ''
            },
            xAxis: {
                categories: this.getCategoriesLocaleName(chartData.payload.x)
            },
            // To hide highcharts.com text at the bottom
            credits: {
                enabled: false
            },
            tooltip: {
                shared: true
            },
            plotOptions: {
                column: {
                    grouping: false,
                    shadow: false,
                    borderWidth: 0
                }
            },
            series: chartData.payload.series
        };

        if (isThumbnailRequest) {
            chartOptions['legend'] = {
                enabled: false
            };

            chartOptions['yAxis'] = {
                title: {
                    text: ''
                }
            };
        } else {
            chartOptions['legend'] = {
                enabled: false,
                align: 'right',
                verticalAlign: 'top',
                layout: 'vertical',
                x: 0,
                y: 100,
                itemMarginTop: 10
            };

            chartOptions['yAxis'] = {
                title: {
                    text: chartData.nameY
                }
            };
        }
        return chartOptions;
    }

    generateLineChart(chartData, isThumbnailRequest) {
        var chartOptions = {
            title: {
                text: ''
            },
            xAxis: {
                categories: this.getCategoriesLocaleName(chartData.payload.x)
            },
            credits: {
                enabled: false
            },
            series: chartData.payload.series
        };

        if (isThumbnailRequest) {
            chartOptions['legend'] = {
                enabled: false
            };

            chartOptions['yAxis'] = {
                title: {
                    text: ''
                }
            };
        } else {
            chartOptions['legend'] = {
                align: 'right',
                verticalAlign: 'top',
                layout: 'vertical',
                x: 0,
                y: 100,
                itemMarginTop: 10
            };

            chartOptions['yAxis'] = {
                title: {
                    text: chartData.nameY
                }
            };
        }
        return chartOptions;
    }

    generateSpiderWebChart(chartData, isThumbnailRequest) {
        this.processSeriesName(chartData);
        var chartOptions = {
            chart: {
                polar: true,
                type: 'line'
            },
            title: {
                text: this.commonService.getTranslation(chartData.name),
                x: 0
            },
            xAxis: {
                categories: this.getCategoriesLocaleNameTranslated(chartData.payload.x),
                tickmarkPlacement: 'on',
                lineWidth: 0
            },
            // To hide highcharts.com text at the bottom
            credits: {
                enabled: false
            },
            pane: {
                size: '70%'
            },
            plotOptions: {
                column: {
                    grouping: false,
                    shadow: false,
                    borderWidth: 0
                }
            },
            series: chartData.payload.series,
            tooltip: {
                shared: true,
                pointFormat: '<span style="color:{series.color}">{series.name}: <b>{point.y:,.f}</b><br/>'
            },
            yAxis: {
                title: {
                    text: ''
                },
                plotBands: [],
                reversed: false,
                min: 0,
                max: 6,
                allowDecimals: true,
                tickInterval: 1,
                tickAmount: 7,
                tickLength: 10,
                gridLineInterpolation: 'polygon',
                lineWidth: 0,
                tickmarkPlacement: 'between',
                tickPixelInterval: 100,
                tickPosition: 'outside',
                labels: {
                    enabled: true
                    // format: 'Level {value}',
                    // y: 45
                }
            }
        };
        if (isThumbnailRequest) {
            chartOptions['legend'] = {
                enabled: false
            };
        } else {
            chartOptions['legend'] = {
                align: 'center',
                verticalAlign: 'bottom',
                itemWidth: chartData.payload.series.length > 3 ? 150 : undefined
            };
        }
        return chartOptions;
    }

    generateGroupBarChart(chartData, isThumbnailRequest) {
        var chartOptions = {
            chart: {
                type: 'column'
            },
            title: {
                text: ''
            },
            xAxis: {
                categories: this.getCategoriesLocaleName(chartData.payload.x),
                crosshair: true
            },
            // To hide highcharts.com text at the bottom
            credits: {
                enabled: false
            },
            plotOptions: {
                column: {
                    pointPadding: 0.2,
                    borderWidth: 0
                }
            },
            colors: ['#058DC7', '#50B432'],
            series: chartData.payload.series,
            legend: {
                enabled: true
            }
        };

        if (isThumbnailRequest) {
            chartOptions['yAxis'] = {
                title: {
                    text: ''
                }
            };
        } else {
            chartOptions['yAxis'] = {
                min: 0,
                title: {
                    text: chartData.nameY
                }
            };
        }
        return chartOptions;
    }

    generateTable(chartData, isThumbnailRequest) {
        var chartOptions = {
            headers: chartData.payload.x,
            columnData: chartData.payload.series
        };

        return chartOptions;
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

    getCategoriesLocaleNameTranslated(data) {
        if (Array.isArray(data)) {
            const displayText = [];
            data.map(item => {
                displayText.push(this.commonService.getTranslation(this.localeService.getDisplayText(item)));
            });
            return displayText;
        } else {
            return this.commonService.getTranslation(this.localeService.getDisplayText(data));
        }
    }

    processSeriesName(chartData: any) {
        if (chartData) {
            chartData.payload.series.forEach(series => {
                series['name'] = this.commonService.getTranslation(this.localeService.getDisplayText(series['name']));
            });
        }
    }
}
