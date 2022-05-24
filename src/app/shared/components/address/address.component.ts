import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonServices } from '../../commonServices/common.service';
import { UtilsService } from '../../utils/utils.service';
import { CustomToastrService } from '../../commonServices/custom-toastr.service';
@Component({
    selector: 'app-address',
    templateUrl: './address.component.html',
    styleUrls: ['./address.component.scss']
})
export class AddressComponent implements OnInit {
    @Input() address;
    @Input() editVisible;
    @Input() formMode;
    @Output() addressValueChange = new EventEmitter<Object>();

    // Address form data
    countries = [];
    states: any = [];
    cities: any = [];
    loadingCities: boolean;
    loadingStates: boolean;
    loadingCountries: boolean;
    addressData = {
        address: {
            addressLine1: '',
            addressLine2: '',
            country: '',
            countryCode: '',
            state: '',
            city: '',
            zip: '',
            latitude: '',
            longitude: ''
        }
    };

    parameters = {
        key: 'name',
        value: 'name',
        selectedKey: 'value'
    };

    editAddress = this.formMode;

    constructor(
        private toastr: CustomToastrService,
        private commonServices: CommonServices,
        private utilService: UtilsService
    ) {}

    get cdnImage() {
        return this.utilService.getcdnImage.bind(this.utilService);
    }

    ngOnInit() {
        this.getCountries();
        if (this.editAddress) {
            this.addressData.address = this.address;
        }
    }

    // Address data population
    unsetStateOnCountrySelection() {
        this.addressData.address.state = '';
    }
    unsetCityOnStateSelection() {
        this.addressData.address.city = '';
    }

    getCountryCode(countryName) {
        if (Array.isArray(this.countries) && this.countries.length > 0) {
            for (let i = 0; i < this.countries.length; i++) {
                if (this.countries[i].name === countryName) {
                    return this.countries[i].code.toLowerCase();
                }
            }
        }
        return false;
    }

    getCountryId(countryName) {
        if (Array.isArray(this.countries) && this.countries.length > 0) {
            for (let i = 0; i < this.countries.length; i++) {
                if (this.countries[i].name === countryName) {
                    return this.countries[i].id;
                }
            }
        }

        this.toastr.error(`There seems to be an issue with the selected country ${countryName}`, 'Invalid country');
        return false;
    }

    getStateId(stateName) {
        if (Array.isArray(this.states) && this.states.length > 0) {
            for (let i = 0; i < this.states.length; i++) {
                if (this.states[i].name === stateName) {
                    return this.states[i].id;
                }
            }
        }

        return false;
    }

    getLatLngFromCityName(cityName) {
        if (Array.isArray(this.cities) && this.cities.length > 0) {
            for (let i = 0; i < this.cities.length; i++) {
                if (this.cities[i].name === cityName) {
                    return { latitude: this.cities[i].lat, longitude: this.cities[i].lon };
                }
            }
        }

        return false;
    }

    setLatLng(cityName) {
        const latlng = this.getLatLngFromCityName(cityName);

        if (typeof latlng !== 'boolean') {
            this.addressData.address.latitude = latlng.latitude;
        }
        if (typeof latlng !== 'boolean') {
            this.addressData.address.longitude = latlng.longitude;
        }
    }

    populateAddressMeta(address) {
        const latlng = this.getLatLngFromCityName(address.city);
        if (typeof latlng !== 'boolean') {
            address.latitude = latlng.latitude;
        }
        if (typeof latlng !== 'boolean') {
            address.longitude = latlng.longitude;
        }
        address.countryCode = this.getCountryCode(address.country);
    }

    getCities(event) {
        let stateName = null;
        if (typeof event === 'object') {
            stateName = event.name;
        } else {
            stateName = event;
        }
        this.loadingCities = true;
        const stateId = this.getStateId(stateName);

        this.commonServices.getCities(stateId).subscribe(response => {
            const data = response['data'];
            this.cities = data.city;
            this.loadingCities = false;
        });
    }

    getStates(event) {
        let countryName = null;
        if (typeof event === 'object') {
            countryName = event.name;
        } else {
            countryName = event;
        }
        this.loadingStates = true;
        const countryId = this.getCountryId(countryName);
        this.commonServices.getStates(countryId).subscribe(response => {
            const data = response['data'];
            this.states = data.state;
            this.loadingStates = false;

            if (this.addressData.address.state) {
                this.getCities(this.addressData.address.state);
            }
        });
    }

    getCountries() {
        this.loadingCountries = true;
        this.commonServices.getCountries().subscribe(response => {
            const data = response['data'];
            this.countries = data.country;
            this.loadingCountries = false;

            if (this.addressData.address.country) {
                this.getStates(this.addressData.address.country);
            }
        });
    }

    saveAddress() {
        if (this.validateAddress()) {
            this.address = this.addressData.address;
            this.populateAddressMeta(this.addressData.address);
            this.addressValueChange.emit(this.addressData.address);
            this.showAddressBlock();
        }
    }

    showSaveAddressForm() {
        this.editAddress = true;
        this.addressData.address.addressLine1 = this.address.addressLine1;
        this.addressData.address.addressLine2 = this.address.addressLine2;
        this.addressData.address.country = this.address.country;
        this.addressData.address.state = this.address.state;
        this.addressData.address.city = this.address.city;
        this.addressData.address.zip = this.address.zip;
        this.getStates(this.addressData.address.country);
    }

    showAddressBlock() {
        this.addressData = {
            address: {
                addressLine1: '',
                addressLine2: '',
                country: '',
                countryCode: '',
                state: '',
                city: '',
                zip: '',
                latitude: '',
                longitude: ''
            }
        };
        this.editAddress = false;
    }

    validateAddress() {
        if (!this.addressData.address.addressLine1) {
            this.toastr.error('Please enter addressLine1', 'Required Field - addressLine1');
            return;
        }

        if (!this.addressData.address.country) {
            this.toastr.error('Please enter country', 'Required Field - Country');
            return;
        }

        if (!this.addressData.address.state) {
            this.toastr.error('Please enter state', 'Required Field - State');
            return;
        }

        if (!this.addressData.address.city) {
            this.toastr.error('Please enter city', 'Required Field - City');
            return;
        }

        if (!this.addressData.address.zip) {
            this.toastr.error('Please enter zip', 'Required Field - Zip Code');
            return;
        }

        return true;
    }
}
