import { AuthService } from './../../../core/user/auth.service';
import { UtilsService } from './../../../shared/utils/utils.service';
import { Component, OnInit } from '@angular/core';
import { environment as env } from '../../../../environments/environment';
import { AnalyticsService } from '../../../core/analytics/analytics.service';
import { ITierValue } from '../transactions.model';

export enum transactions_menu {
    inbound = 'Inbound',
    production = 'Production',
    outbound = 'Outbound',
    inbound_cotton = 'Inbound - cotton',
    production_intermediate = 'Production - intermediate'
}

@Component({
    selector: 'app-create-transactions',
    templateUrl: './create-transactions.component.html',
    styleUrls: ['./create-transactions.component.scss']
})
export class CreateTransactionsComponent implements OnInit {
    public env = env;

    transactionsMenu = transactions_menu;

    pageLoading = false;
    options = ['Inbound', 'Production', 'Outbound'];
    tier_1_options = ['Inbound', 'Production', 'Outbound'];
    tier_2_options = ['Inbound', 'Production', 'Production - intermediate', 'Outbound'];

    selectedOption = 'Select Transaction Type';
    tier_session = 'transactions_tier';

    selectedTier: ITierValue = {
        key: '',
        value: ''
    };

    tiers_associated: ITierValue[] = [];

    constructor(
        private analyticsService: AnalyticsService,
        private utilsService: UtilsService,
        private authService: AuthService
    ) {}

    ngOnInit() {
        this.analyticsService.trackPageVisit('new transaction');

        this.tiers_associated = this.authService.user.tiersAssociated;

        if (this.utilsService.getSessionStorageValue(this.tier_session)) {
            this.selectedTier = this.utilsService.getSessionStorageValue(this.tier_session);
        } else {
            this.selectedTier = this.tiers_associated[0];
        }

        if (this.selectedTier.key === 'tr_tier1') {
            this.options = this.tier_1_options;
        } else if (this.selectedTier.key === 'tr_tier2') {
            this.options = this.tier_2_options;
        }
    }
}
