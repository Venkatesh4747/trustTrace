import { Component, OnInit } from '@angular/core';
import { SideNavigationService } from '../../shared/side-navigation/side-navigation.service';

@Component({
    selector: 'app-user',
    templateUrl: './user.component.html',
    styleUrls: ['./user.component.scss']
})
export class UserComponent implements OnInit {
    sideNavigation;

    constructor(private sideNav: SideNavigationService) {
        this.sideNavigation = sideNav;
    }

    ngOnInit() {}
}
