import { Component, OnInit } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ProductTraceabilityService } from '../../../views/product-traceability/product-traceability.service';
import { CustomToastrService } from '../../commonServices/custom-toastr.service';
import { environment } from './../../../../environments/environment';
import { LocalizationService } from './../../utils/localization.service';

@Component({
    selector: 'app-product-flow-modal',
    templateUrl: './product-flow-modal.component.html',
    styleUrls: ['./product-flow-modal.component.scss']
})
export class ProductFlowModalComponent implements OnInit {
    public env = environment;
    trId;
    productFlowDataReady = false;
    modalFlowData = [];

    constructor(
        private pts: ProductTraceabilityService,
        private toastr: CustomToastrService,
        private localeService: LocalizationService,
        public bsModalRef: BsModalRef
    ) {}

    ngOnInit() {
        this.pts.getProductFlow(this.trId).subscribe(
            productFlowResponse => {
                this.modalFlowData.push(JSON.parse(JSON.stringify(productFlowResponse['data']['productFlow'])));
                this.localeService.addToMasterData(productFlowResponse['data'].masterData);
                this.modalFlowData[0]['root'] = true;
                this.productFlowDataReady = true;
            },
            () => {
                this.productFlowDataReady = false;
                this.toastr.error(
                    environment.error_messages.could_not_fetch_data.message,
                    environment.error_messages.could_not_fetch_data.title
                );
            }
        );
    }
}
