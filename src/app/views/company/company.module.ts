import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { ModalModule } from 'ngx-bootstrap/modal';
import { PopoverModule } from 'ngx-bootstrap/popover';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { TypeaheadModule } from 'ngx-bootstrap/typeahead';
import { SharedModule } from '../../shared/shared.module';
import { AssociateComponent } from './associate/associate.component';
import { AssociateService } from './associate/associate.service';
import { CompanyRoutingModule } from './company-routing.module';
import { CreateFacilityComponent } from './create-facility/create-facility.component';
import { EditFacilityComponent } from './edit-facility/edit-facility.component';
import { ProfileComponent } from './profile/profile.component';
import { ProfileService } from './profile/profile.service';
import { SignupComponent } from './signup/signup.component';
import { SignupService } from './signup/signup.service';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        ModalModule,
        SharedModule,
        TooltipModule,
        TypeaheadModule,
        CompanyRoutingModule,
        MatInputModule,
        MatTableModule,
        MatPaginatorModule,
        MatSortModule,
        MatChipsModule,
        MatIconModule,
        MatSelectModule,
        MatButtonModule,
        MatDialogModule,
        MatRadioModule,
        MatProgressSpinnerModule,
        PopoverModule
    ],
    exports: [
        MatInputModule,
        MatTableModule,
        MatPaginatorModule,
        MatSortModule,
        MatChipsModule,
        MatIconModule,
        MatButtonModule
    ],
    declarations: [
        ProfileComponent,
        AssociateComponent,
        SignupComponent,
        EditFacilityComponent,
        CreateFacilityComponent
    ],
    providers: [ProfileService, AssociateService, SignupService]
})
export class CompanyModule {}
