import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { SideNavigationService } from '../../shared/side-navigation/side-navigation.service';

@Component({
    selector: 'app-purchase-orders',
    templateUrl: './purchase-orders.component.html',
    styleUrls: ['./purchase-orders.component.scss']
})
export class PurchaseOrdersComponent implements OnInit {
    sideNavigation;

    constructor(private titleService: Title, private sideNav: SideNavigationService) {
        this.sideNavigation = sideNav;
        this.titleService.setTitle('TrusTrace | Purchase Orders');
    }

    ngOnInit() {}
}
