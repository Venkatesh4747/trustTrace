import { Component, OnDestroy, OnInit } from '@angular/core';
import { GridOptions } from 'ag-grid-community';
import { MatDialog } from '@angular/material/dialog';
import { GeoService } from './geoService.service';
import { StateComponent } from './state/state.component';
import { StateDetailsComponent } from './state/state-details/state-details.component';
import { CityComponent } from './city/city.component';
import { Subscription } from 'rxjs';
import { CityDetailsComponent } from './city/city-details/city-details.component';
import { CountryComponent } from './country/country.component';
import { CountryDetailsComponent } from './country/country-details/country-details.component';
import { City } from './geoapi.models';
import { CustomToastrService } from '../../../shared/commonServices/custom-toastr.service';

@Component({
    selector: 'app-geo-api',
    templateUrl: './geo-api.component.html',
    styleUrls: ['./geo-api.component.scss']
})
export class GeoApiComponent implements OnInit, OnDestroy {
    searchText: string = '';
    searchType: string = 'cities';
    pageLoading: boolean = false;
    pageloadSubscription: Subscription;
    loadNewDatas: Subscription;
    modalComponents = [CountryDetailsComponent, StateDetailsComponent, CityDetailsComponent];
    searchTypeArr = ['cities', 'states', 'countries'];
    private gridApi;
    constructor(private geoService: GeoService, private dialog: MatDialog, private toast: CustomToastrService) {
        this.gridOptions = {
            paginationPageSize: 100
        };
        this.columnDefs = [
            {
                headerName: 'City',
                field: 'name',
                sortable: true,
                filter: true,
                width: 280,
                cellStyle: { textAlign: 'left', cursor: 'pointer' },
                cellRendererFramework: CityComponent
            },
            {
                headerName: 'State',
                cellStyle: { textAlign: 'left', cursor: 'pointer' },
                width: 280,
                cellRendererFramework: StateComponent
            },
            {
                headerName: 'Country',
                width: 180,
                cellStyle: { textAlign: 'left', cursor: 'pointer' },
                cellRendererFramework: CountryComponent
            },
            {
                headerName: 'Latitude',
                field: 'latitude',
                width: 180
            },
            {
                headerName: 'Longitude',
                field: 'longitude',
                width: 180
            }
        ];
    }
    columnDefs = [];
    rowData = null;

    gridOptions: Partial<GridOptions>;
    ngOnInit(): void {
        this.loadNewDatas = this.geoService.refeshDatas.subscribe(() => {
            this.loadFromApi();
        });

        this.pageloadSubscription = this.geoService.pageLoading.subscribe(res => {
            this.pageLoading = res;
        });
    }

    openForm(id: number): void {
        this.dialog.open(this.pickDialog(id), {
            width: '40%',
            data: { viewMode: false }
        });
    }
    searchCity(event): void {
        if (event.keyCode === 13 && this.searchText.length >= 3) {
            this.gridApi.showLoadingOverlay();
            this.searchBasedOnOptions(this.searchType);
        }
        if (!this.searchText) {
            this.loadFromApi();
        }
    }

    loadFromApi(): void {
        this.searchText = '';
        this.searchType = 'cities';
        this.gridApi.showLoadingOverlay();

        this.geoService.getCities().subscribe(
            res => {
                this.gridApi.hideOverlay();
                this.rowData = res;
            },
            error => {
                this.gridApi.hideOverlay();
                this.toast.error('Error', error);
            }
        );
    }

    onGridReady(params): void {
        this.gridApi = params.api;

        this.geoService.getCities().subscribe(
            result => {
                this.rowData = result;
            },
            error => {
                this.gridApi.hideOverlay();
                this.toast.error('Error', 'Something Went Wrong!!');
            }
        );
    }

    pickDialog(origin: number): any {
        switch (origin) {
            case 1:
                return CountryDetailsComponent;
            case 2:
                return StateDetailsComponent;
            case 3:
                return CityDetailsComponent;
        }
    }

    searchBasedOnOptions(searchType: string): void {
        switch (searchType) {
            case 'cities':
                this.getCitiesSearchResult();
                break;

            case 'countries':
                this.getCountrySearch();
                break;
            case 'states':
                this.getStateSearch();
                break;
            default:
                this.getCitiesSearchResult();
                break;
        }
    }
    getCitiesSearchResult(): void {
        this.geoService.getSearchCities(this.searchText).subscribe(
            response => {
                this.gridApi.hideOverlay();
                this.rowData = response;
            },
            error => {
                this.gridApi.hideOverlay();
                this.toast.error('Error', 'Something Went Wrong!!');
            }
        );
    }

    getCountrySearch(): void {
        this.geoService.getCitiesBasedOnCountry(this.searchText).subscribe(
            (res: City[]) => {
                this.gridApi.hideOverlay();
                this.rowData = res;
            },
            error => {
                this.gridApi.hideOverlay();
                this.toast.error('Error', 'Something Went Wrong!!');
            }
        );
    }

    getStateSearch(): void {
        this.geoService.getCitiesBasedOnState(this.searchText).subscribe(
            (res: City[]) => {
                this.gridApi.hideOverlay();
                this.rowData = res;
            },
            error => {
                this.gridApi.hideOverlay();
                this.toast.error('Error', 'Something Went Wrong!!');
            }
        );
    }

    ngOnDestroy(): void {
        this.pageloadSubscription.unsubscribe();
        this.loadNewDatas.unsubscribe();
    }
}
