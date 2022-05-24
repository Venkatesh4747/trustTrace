import { Component, OnInit } from '@angular/core';
import { SideNavigationService } from '../side-navigation/side-navigation.service';

@Component({
    selector: 'app-full-page-loader',
    templateUrl: './full-page-loader.component.html',
    styleUrls: ['./full-page-loader.component.scss']
})
export class FullPageLoaderComponent implements OnInit {
    sideNavigation;

    constructor(private sideNav: SideNavigationService) {
        this.sideNavigation = sideNav;
    }

    ngOnInit() {}
}
