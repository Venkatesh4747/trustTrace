import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatChipsModule } from '@angular/material/chips';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatRadioButton, MatRadioModule } from '@angular/material/radio';
import { MatSortModule } from '@angular/material/sort';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCheckbox, MatCheckboxModule } from '@angular/material/checkbox';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatIconModule } from '@angular/material/icon';
import { Ng2SearchPipeModule } from 'ng2-search-filter';
import { ProgressbarModule } from 'ngx-bootstrap/progressbar';
import { SharedModule } from '../../shared/shared.module';
import { SuppliersService } from '../suppliers/suppliers.service';
import { FacilitiesComponent } from './../facilities/facilities.component';
import { FacilitiesProfileRoutingModule } from './facilities-profile-routing.module';
import { FacilitiesProfileComponent } from './facilities-profile.component';
import { FacilitiesDetailsComponent } from './facilities-details/facilities-details.component';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { TypeaheadModule } from 'ngx-bootstrap/typeahead';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { ModalModule } from 'ngx-bootstrap/modal';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { RatingModule } from 'ngx-bootstrap/rating';
import { PaginationModule } from 'ngx-bootstrap/pagination';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        BsDatepickerModule,
        TypeaheadModule,
        BsDropdownModule,
        SharedModule,
        TabsModule,
        ModalModule,
        TooltipModule,
        FacilitiesProfileRoutingModule,
        Ng2SearchPipeModule,
        MatInputModule,
        MatTableModule,
        MatPaginatorModule,
        MatSortModule,
        MatChipsModule,
        MatIconModule,
        ReactiveFormsModule,
        MatAutocompleteModule,
        MatButtonModule,
        MatCheckboxModule,
        RatingModule.forRoot(),
        MatExpansionModule,
        MatRadioModule,
        InfiniteScrollModule,
        PaginationModule,
        MatTabsModule,
        MatProgressSpinnerModule,
        ProgressbarModule
    ],
    exports: [
        MatInputModule,
        MatTableModule,
        MatPaginatorModule,
        MatSortModule,
        MatChipsModule,
        MatIconModule,
        MatAutocompleteModule,
        MatButtonModule,
        MatCheckboxModule,
        MatExpansionModule,
        MatRadioModule,
        InfiniteScrollModule,
        PaginationModule
    ],
    declarations: [FacilitiesComponent, FacilitiesProfileComponent, FacilitiesDetailsComponent],
    providers: [SuppliersService]
})
export class FacilitiesProfileModule {}
