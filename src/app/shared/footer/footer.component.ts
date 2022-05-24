import { Component, OnInit } from '@angular/core';
import { SideNavigationService } from '../side-navigation/side-navigation.service';

@Component({
    selector: 'app-footer',
    templateUrl: './footer.component.html',
    styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements OnInit {
    currentYear: number;
    sideNavigation;

    constructor(private sideNav: SideNavigationService) {
        this.sideNavigation = sideNav;
    }

    ngOnInit() {
        this.currentYear = new Date().getFullYear();
    }
}
