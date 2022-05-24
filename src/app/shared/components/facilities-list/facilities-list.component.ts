import { Component, Input, OnInit } from '@angular/core';
import { CommonServices } from '../../commonServices/common.service';
import { Country, FacilitiesProfile } from '../../../views/suppliers/sub-supplier-details/sub-supplier-profile.model';

@Component({
    selector: 'app-facilities-list',
    templateUrl: './facilities-list.component.html',
    styleUrls: ['./facilities-list.component.scss']
})
export class FacilitiesListComponent implements OnInit {
    @Input() facilities: FacilitiesProfile[];
    @Input() facilityCount: number;
    @Input() companyId: string;
    countries: Country[];
    title = 'Facilities';
    constructor(private commonServices: CommonServices) {}

    ngOnInit(): void {
        this.commonServices.getCountries().subscribe(response => {
            this.countries = response['data']['country'];
        });
    }

    getCountryCode(countryName: string): string {
        return this.countries.find(country => country.name === countryName)?.code?.toLowerCase();
    }
}
