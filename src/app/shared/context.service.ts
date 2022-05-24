import { Injectable, OnInit } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable()
export class ContextService implements OnInit {
    public resetFilterOptions: Subject<boolean> = new Subject<boolean>();
    public showChartDetail: Subject<boolean> = new Subject<boolean>();
    public chartDetailData: Subject<any> = new Subject<any>();
    public selectedArticleName: Subject<any> = new Subject<any>();
    public showEditLaunchButton: Subject<boolean> = new Subject<boolean>();
    public selectedTRSupplier: Subject<any> = new Subject<any>();
    public handleProductListSubmit: Subject<boolean> = new Subject<boolean>();
    public showHideSidenavSubject: Subject<boolean> = new Subject<boolean>();
    public cardViewRefresh: Subject<boolean> = new Subject<boolean>();

    constructor() {}

    ngOnInit() {
        this.resetFilterOptions.next(false);
        this.showChartDetail.next(false);
        this.chartDetailData.next({});
        this.selectedArticleName.next({});
        this.showEditLaunchButton.next(true);
        this.handleProductListSubmit.next(false);
        this.showHideSidenavSubject.next(true);
        this.cardViewRefresh.next(false);
    }
}
