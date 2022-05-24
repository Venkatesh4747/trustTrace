import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { CustomToastrService } from '../../../shared/commonServices/custom-toastr.service';
import { LocalizationService } from '../../../shared/utils/localization.service';
import { environment } from './../../../../environments/environment';
import { TRShipmentDetails } from './add-shipment-details.model';
import { AddShipmentDetailsService } from './add-shipment-details.service';

@Component({
    selector: 'app-add-shipment-details',
    templateUrl: './add-shipment-details.component.html',
    styleUrls: ['./add-shipment-details.component.scss'],
    providers: [AddShipmentDetailsService]
})
export class AddShipmentDetailsComponent implements OnInit {
    env = environment;
    @Input() trId: any;
    @Input() isDisabled: any;
    shipmentForm: FormGroup;

    units = [];

    allShipmentDetails: TRShipmentDetails[] = [];

    shipmentDetails: TRShipmentDetails = {
        shipmentDate: new Date(),
        id: null,
        quantity: {
            quantity: '',
            unit: ''
        }
    };

    constructor(
        private localeService: LocalizationService,
        private _formBuilder: FormBuilder,
        private addShipmentDetailsService: AddShipmentDetailsService,
        private toastr: CustomToastrService
    ) {}

    ngOnInit() {
        this.shipmentForm = this._formBuilder.group({
            dateCtrl: new FormControl({ value: new Date(), disabled: this.isDisabled }, Validators.required)
        });

        this.addShipmentDetailsService.getMetadata(this.trId).subscribe(response => {
            this.localeService.addToMasterData(response['data']['masterData']);
            this.units = response['data']['metadata']['unit'];
        });

        this.addShipmentDetailsService.getAllShipmentDetails(this.trId).subscribe(
            response => {
                this.localeService.addToMasterData(response['data']['masterData']);
                this.allShipmentDetails = response['data']['shipmentInfo'];
                if (this.allShipmentDetails) {
                    for (let i = 0; i < this.allShipmentDetails.length; i++) {
                        const date = new Date(this.allShipmentDetails[i]['shipmentDate']);
                        this.allShipmentDetails[i]['shipmentDate'] = date;
                    }
                }
            },
            err => {
                this.toastr.error('Unable to fetch shipment details, Please try again after sometime');
            }
        );
    }

    addMoreShipmentDetails() {
        this.allShipmentDetails.push(JSON.parse(JSON.stringify(this.shipmentDetails)));
    }

    removeShipmentDetail(index) {
        this.allShipmentDetails.splice(index, 1);
        this.addShipmentDetailsService.saveShipmentDetails(this.trId, this.allShipmentDetails).subscribe(
            response => {
                this.toastr.info('Successfully deleted Shipment Detail');
            },
            err => {
                this.toastr.error('Unable to delete shipment detail, Please try again after sometime');
            }
        );
    }

    validateShipmentDetails() {
        for (let i = 0; i < this.allShipmentDetails.length; i++) {
            const data = this.allShipmentDetails[i];
            if (!(data.shipmentDate && data.quantity.quantity && data.quantity.unit)) {
                this.toastr.error('Please fill missing fields');
                return false;
            }
        }
        return true;
    }

    saveShipmentDetails() {
        if (this.validateShipmentDetails()) {
            this.addShipmentDetailsService.saveShipmentDetails(this.trId, this.allShipmentDetails).subscribe(
                response => {
                    this.toastr.info('Successfully saved Shipment Details');
                },
                err => {
                    this.toastr.error('Unable to save shipment details, Please try again after sometime');
                }
            );
        }
    }
}
