import { Component, OnInit } from '@angular/core';
import { SideNavigationService } from '../../shared/side-navigation/side-navigation.service';

@Component({
    selector: 'app-company',
    templateUrl: './company.component.html',
    styleUrls: ['./company.component.scss']
})
export class CompanyComponent implements OnInit {
    sideNavigation;

    constructor(private sideNav: SideNavigationService) {
        this.sideNavigation = sideNav;
    }

    ngOnInit() {}
}
