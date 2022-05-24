import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRadioModule } from '@angular/material/radio';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatIconModule } from '@angular/material/icon';
import { Ng2SearchPipeModule } from 'ng2-search-filter';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { SharedModule } from '../../shared/shared.module';
import { SupplierDetailsComponent } from './supplier-details/supplier-details.component';
import { SuppliersRoutingModule } from './suppliers-routing.module';
import { SuppliersComponent } from './suppliers.component';
import { SuppliersService } from './suppliers.service';
import { SuppliersListComponent } from './suppliers-list/suppliers-list.component';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { TypeaheadModule } from 'ngx-bootstrap/typeahead';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { ModalModule } from 'ngx-bootstrap/modal';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { RatingModule } from 'ngx-bootstrap/rating';
import { SupplierConflictsComponent } from './supplier-conflicts/supplier-conflicts.component';

@NgModule({
    imports: [
        CommonModule,
        InfiniteScrollModule,
        FormsModule,
        BsDatepickerModule,
        TypeaheadModule,
        BsDropdownModule,
        SharedModule,
        TabsModule,
        ModalModule,
        TooltipModule,
        SuppliersRoutingModule,
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
        MatTabsModule,
        MatProgressSpinnerModule
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
        MatTabsModule
    ],
    declarations: [SuppliersComponent, SupplierDetailsComponent, SuppliersListComponent, SupplierConflictsComponent],
    providers: [SuppliersService]
})
export class SuppliersModule {}
