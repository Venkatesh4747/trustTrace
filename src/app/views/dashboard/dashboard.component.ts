import { Component, OnInit, HostListener } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { environment as env } from '../../../environments/environment';
import { SideNavigationService } from '../../shared/side-navigation/side-navigation.service';
import { LocalizationService } from '../../shared/utils/localization.service';
import { AuthService } from './../../core/user/auth.service';
import { ContextService } from './../../shared/context.service';
import { DashboardService } from './dashboard.service';
import { AnalyticsService } from '../../core/analytics/analytics.service';
import { MultiIndustryService } from './../../shared/multi-industry-support/multi-industry.service';
import { CustomToastrService } from '../../shared/commonServices/custom-toastr.service';

@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
    public env = env;
    sideNavigation;
    searchText = '';
    selectedCategory = '';
    selectedCriteria = '';
    selectedFilter = '';

    pageLoading = true;
    showNoDataChart = false;
    showChartDetail;

    chartOptions = {};
    chartConfig = [];
    chartData = {};
    chartItems = [];
    dashboardContainerTop: Number;

    panelOpenState = false;
    status: boolean = false;
    favoriteConfig: any = [];
    step: number = -1;
    chartName: string;
    desc: String;
    active: boolean = true;
    index: any = 0;
    categoryName: string;
    favIconActive: boolean = false;
    collapseFlag: boolean = false;

    get isNotFoodIndustry(): boolean {
        return this.multiIndustryService.industry !== 'food';
    }

    thumbnailWrapperTop: Number;
    thumbnailViewChanged: Subject<any> = new Subject();
    constructor(
        private titleService: Title,
        private sideNav: SideNavigationService,
        private dashboardService: DashboardService,
        private localeService: LocalizationService,
        private toastService: CustomToastrService,
        private auth: AuthService,
        private router: Router,
        private appContext: ContextService,
        private analyticsService: AnalyticsService,
        private multiIndustryService: MultiIndustryService
    ) {
        this.sideNavigation = this.sideNav;
        this.titleService.setTitle('TrusTrace | Dashboard');
        if (!this.auth.loggedIn.value) {
            this.router.navigate(['/']);
        } else {
            if (
                this.auth.user.subscriptionType === 'SUPPLIER' ||
                this.auth.user.subscriptionType === 'FASHION_BRAND_SUPP'
            ) {
                this.router.navigate(['supplier-dashboard']);
            } else if (this.auth.user.subscriptionType === 'BRAND_SUPP') {
                this.router.navigate(['/', 'products']);
            }
        }
    }

    @HostListener('window:resize', ['$event'])
    onResize(event) {
        this.dashboardContainerTop = document.getElementById('top-navigation').offsetHeight;
        this.thumbnailWrapperTop = document.getElementById('chart-categories').offsetHeight + 150;
    }

    ngOnInit() {
        if (this.auth.user.subscriptionType === 'BRAND' && !this.auth.haveAccess('CHART_READ')) {
            this.router.navigate(['/styles']);
            return;
        }
        if (this.auth.user.email && !this.auth.haveAccess('CHART_READ')) {
            this.toastService.info(this.env.error_messages.no_authorization, 'Insufficient Permission');
        }
        this.appContext.showChartDetail.subscribe(toShowChartDetail => {
            this.showChartDetail = toShowChartDetail;
        });
        this.appContext.chartDetailData.subscribe(chartDetail => {
            this.chartData = chartDetail;
        });
        this.getFavConfig();
        this.getChartConfig();
        setTimeout(() => {
            this.onResize('');
        }, 0);
    }

    ANALYTICS_EVENT_VISUALTIZATION_CHARTS = 'Visualization-Charts-';
    ANALYTICS_ACTION_VISUALIZATION_CHARTS_VIEWED = 'Visualization Charts Viewed';
    changeType(index): void {
        let analyticsOptions = {};
        analyticsOptions[
            this.analyticsService.PROPERTY_ACTION_PERFORMED
        ] = this.ANALYTICS_ACTION_VISUALIZATION_CHARTS_VIEWED;

        this.analyticsService.trackEvent(
            this.ANALYTICS_EVENT_VISUALTIZATION_CHARTS + this.chartConfig[index].displayName,
            analyticsOptions
        );
        this.chartItems = this.chartConfig[index]['items'];
    }

    getFavConfig(): void {
        this.dashboardService.getFavConfig().subscribe(
            favConfigResp => {
                this.favoriteConfig = favConfigResp['data']['config'];
                if (this.favoriteConfig.length > 0) {
                    this.onChartClick(
                        this.favoriteConfig[0].itemId,
                        this.favoriteConfig[0].customFieldId,
                        this.favoriteConfig[0].chartType
                    );
                    this.categoryName = 'Favorites';
                    this.panelOpenState = true;
                } else {
                    this.step = 0;
                }
            },
            failResponse => {
                if (failResponse.status !== 401) {
                    this.toastService.info('Failed to load chart data. Please try again later.');
                }
            }
        );
    }

    getChartConfig(): void {
        this.dashboardService.getChartConfig().subscribe(
            chartConfigResp => {
                this.localeService.addToMasterData(chartConfigResp['data'].masterData);
                this.chartConfig = chartConfigResp['data']['config'];
                if (this.chartConfig) {
                    this.selectedCategory = this.chartConfig[0].category;
                    this.changeType(0);
                    if (this.favoriteConfig.length === 0) {
                        this.onChartClick(
                            this.chartItems[0].itemId,
                            this.chartItems[0].customFieldId,
                            this.chartItems[0].chartType
                        );
                        this.categoryName = this.chartConfig[0].displayName;
                        this.panelOpenState = false;
                    }
                } else {
                    this.toastService.info('No Charts Available');
                }
                this.pageLoading = false;
            },
            failResponse => {
                if (failResponse.error.message === 'Access is denied') {
                    this.toastService.info(this.env.error_messages.no_authorization, 'Insufficient Permission');
                }
                this.pageLoading = false;
            }
        );
    }

    sendThumbnailViewChangedEvent(): void {
        this.thumbnailViewChanged.next('scroll change');
    }

    clickEvent(): void {
        this.status = !this.status;
    }

    onChartClick(id, fieldId, type): void {
        this.appContext.showChartDetail.next(false);
        const data = {
            id: id,
            fieldId: fieldId,
            type: type
        };
        setTimeout(() => {
            this.appContext.chartDetailData.next(data);
            this.appContext.showChartDetail.next(true);
        }, 500);
    }

    activeChartName(chartInd, category): void {
        this.index = chartInd;
        this.active = true;
        this.categoryName = category;
    }

    isfavIconActive(name): boolean {
        this.favIconActive = false;
        this.favoriteConfig.forEach(element => {
            if (element.displayName === name) {
                this.favIconActive = true;
            }
        });
        return this.favIconActive;
    }

    getFavoriteCharts(): void {
        this.favoriteConfig = this.chartConfig[0]['items'];
    }

    setStep(index: number): void {
        if (this.collapseFlag === false) {
            this.step = 0;
            this.collapseFlag = true;
            return;
        }
        if (this.step === index && this.searchText === '') {
            this.step = -1;
            return;
        }
        this.step = index;
        this.panelOpenState = false;
        if (this.searchText.length > 0) {
            this.step = 0;
        }
    }

    updateFavCharts(event): void {
        if (event && event.length > 0) {
            this.favoriteConfig = event;
        } else {
            this.favoriteConfig = [];
        }
    }
    getDisplayName(event): void {
        this.desc = event.desc;
        this.chartName = event.nameX;
    }

    clearSearch(): void {
        this.searchText = '';
        if (this.searchText === '') {
            this.selectIndex();
            console.log(this.step, this.categoryName, this.chartName, this.index, this.active);
            return;
        }
    }
    selectIndex() {
        let foundIndex = null;
        this.chartConfig.forEach((x, index) => {
            foundIndex = x.items.findIndex(y => y.displayName === this.chartName);
            if (foundIndex != null && foundIndex != -1) {
                console.log(foundIndex, index);
                this.index = foundIndex;
                foundIndex = null;
                this.categoryName = x.displayName;
                this.step = index;
                this.active = true;
                return;
            }
        });
    }

    favOpenClose(): void {
        this.step = -1;
        this.panelOpenState = true;
    }

    changeStep(): void {
        if (this.searchText === '') {
            this.clearSearch();
        }
        if (this.searchText !== '') {
            this.step = 0;
            this.index = -1;
        }
    }
}
