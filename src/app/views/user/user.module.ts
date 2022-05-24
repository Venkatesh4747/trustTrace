import { TooltipModalComponent } from './../../shared/modals/tooltip-modal/tooltip-modal.component';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ToastrModule } from 'ngx-toastr';
import { CompanySettingsComponent } from './settings/company/company-settings.component';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogModule } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { ColorPickerModule } from 'ngx-color-picker';
import { SharedModule } from '../../shared/shared.module';
import { ValueHolderDialogComponent } from '../../shared/value-holder-dialog/value-holder-dialog.component';
import { BrandUserManagementComponent } from './brand-user-management/brand-user-management.component';
import { GroupsComponent } from './brand-user-management/groups/groups.component';
import { UsersComponent } from './brand-user-management/users/users.component';
import { ColorSettingsComponent } from './color-settings/color-settings.component';
import { CreateGroupComponent } from './create-group/create-group.component';
import { CreateUserComponent } from './create-user/create-user.component';
import { ManageGroupComponent } from './manage-group/manage-group.component';
import { ProductCategoryComponent } from './product-category/product-category.component';
import { ProfileComponent } from './profile/profile.component';
import { ProfileService } from './profile/profile.service';
import { CompanySettingsService } from './settings/company/company-settings.service';
import { SupplierUserManagementComponent } from './supplier-user-management/supplier-user-management.component';
import { UserRoutingModule } from './user-routing.module';
import { UserComponent } from './user.component';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { UsersSortingPipe } from './brand-user-management/users/users-sorting.pipe';
import { MatCardModule } from '@angular/material/card';
import { TourMatMenuModule } from 'ngx-tour-md-menu';
import { ModalModule } from 'ngx-bootstrap/modal';
import { TypeaheadModule } from 'ngx-bootstrap/typeahead';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { FilterCriteriaComponent } from './settings/company/filter-criteria/filter-criteria.component';
import { EditFieldsComponent } from './settings/company/filter-criteria/edit-fields/edit-fields.component';
import { FilterCriteriaItemsComponent } from './settings/company/filter-criteria-items/filter-criteria-items.component';
import { DataMappingComponent } from './settings/company/data-mapping/data-mapping.component';
import { DataMappingItemsComponent } from './settings/company/data-mapping-items/data-mapping-items.component';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        ModalModule,
        SharedModule,
        TooltipModule,
        ToastrModule,
        TypeaheadModule,
        UserRoutingModule,
        MatInputModule,
        MatIconModule,
        MatExpansionModule,
        MatDialogModule,
        MatCheckboxModule,
        ColorPickerModule,
        InfiniteScrollModule,
        TourMatMenuModule,
        MatCardModule,
        MatProgressSpinnerModule
    ],
    exports: [
        MatInputModule,
        MatIconModule,
        MatExpansionModule,
        MatDialogModule,
        MatCheckboxModule,
        InfiniteScrollModule,
        MatCardModule,
        MatProgressSpinnerModule
    ],
    declarations: [
        ProfileComponent,
        CompanySettingsComponent,
        UserComponent,
        ProductCategoryComponent,
        ValueHolderDialogComponent,
        ColorSettingsComponent,
        BrandUserManagementComponent,
        CreateUserComponent,
        CreateGroupComponent,
        UsersComponent,
        GroupsComponent,
        SupplierUserManagementComponent,
        ManageGroupComponent,
        UsersSortingPipe,
        FilterCriteriaComponent,
        EditFieldsComponent,
        FilterCriteriaItemsComponent,
        DataMappingComponent,
        DataMappingItemsComponent
    ],
    providers: [ProfileService, ProfileService, CompanySettingsService],
    entryComponents: [ValueHolderDialogComponent, GroupsComponent, TooltipModalComponent]
})
export class UserModule {}
