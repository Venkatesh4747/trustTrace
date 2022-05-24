import { Component, ElementRef, Inject, OnInit } from '@angular/core';
import { environment as env } from '../../../../environments/environment';
import { CommonServices } from '../../commonServices/common.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DialogData } from '../../value-holder-dialog/value-holder-dialog.component';

@Component({
    selector: 'app-collect-supplier-info',
    templateUrl: './collect-supplier-info.component.html',
    styleUrls: ['./collect-supplier-info.component.scss']
})
export class CollectSupplierInfoModalComponent implements OnInit {
    private readonly _matDialogRef: MatDialogRef<CollectSupplierInfoModalComponent>;
    private readonly triggerElementRef: ElementRef;
    supplierInfo = {
        location: {}
    };
    public env = env;
    addSupplierProcessing: boolean;
    citySearchText = '';
    cities: any;

    constructor(
        public dialogRef: MatDialogRef<CollectSupplierInfoModalComponent>,
        @Inject(MAT_DIALOG_DATA) public data: DialogData,
        private commonServices: CommonServices
    ) {
        this._matDialogRef = dialogRef;
        //this.triggerElementRef = data.trigger;
    }

    ngOnInit() {}

    hide() {
        this.dialogRef.close();
    }

    resetNewSupplier() {
        this.supplierInfo.location = {};
    }

    searchCity(event) {
        var searchPayload = {
            freeHand: event.target.value,
            pagination: {
                size: 25
            }
        };
        this.commonServices.searchCities(searchPayload).subscribe(response => {
            this.cities = response['data']['searchResponse'];
        });
    }

    getLocationDisplayName(item) {
        var result = '';
        if (item) {
            if (item.city) {
                result += item.city.name + ', ';
            }
            if (item.state) {
                result += item.state.name + ', ';
            }
            if (item.country) {
                result += item.country.name;
            }
        }
        return result;
    }

    citySelection(value) {
        this.supplierInfo.location = value;
    }

    submit() {
        let supplierInfoResponse = {};
        if (this.supplierInfo && this.supplierInfo.location) {
            var address = {};
            address['city'] = this.supplierInfo.location['city'].name;
            address['latitude'] = this.supplierInfo.location['city'].coords.lat;
            address['longitude'] = this.supplierInfo.location['city'].coords.lon;
            address['country'] = this.supplierInfo.location['country'].name;

            supplierInfoResponse['address'] = address;
        }
        this._matDialogRef.close(supplierInfoResponse);
    }
}
