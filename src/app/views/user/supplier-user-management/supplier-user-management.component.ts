import { Component, ElementRef, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { AuthService } from '../../../core';
import { SideNavigationService } from '../../../shared/side-navigation/side-navigation.service';

@Component({
    selector: 'app-supplier-user-management',
    templateUrl: './supplier-user-management.component.html',
    styleUrls: ['./supplier-user-management.component.scss']
})
export class SupplierUserManagementComponent implements OnInit {
    sideNavigation;
    pageLoading = false;
    constructor(public dialog: MatDialog, private sideNav: SideNavigationService, public authService: AuthService) {}

    show = true;

    @ViewChild('thenBlock', { static: false }) thenBlock: TemplateRef<any>;
    ngOnInit() {
        this.pageLoading = true;
        this.authService.getUser().subscribe(data => {
            this.pageLoading = false;
        });
    }
}
