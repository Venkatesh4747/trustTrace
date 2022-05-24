import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { SideNavigationService } from '../../shared/side-navigation/side-navigation.service';

@Component({
    selector: 'app-product-traceability',
    templateUrl: './product-traceability.component.html',
    styleUrls: ['./product-traceability.component.scss']
})
export class ProductTraceabilityComponent implements OnInit {
    sideNavigation;

    constructor(private titleService: Title, private sideNav: SideNavigationService) {
        this.sideNavigation = sideNav;
        this.titleService.setTitle('TrusTrace | Product Traceability');
    }

    ngOnInit() {}
}
