import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';

@Injectable()
export class AddShipmentDetailsService {
    constructor(private http: HttpClient) {}

    SECTION = 'shipment_details';
    getMetadata(trId) {
        let url = environment.api.traceability.getMetadata;
        url = url.replace('$1', this.SECTION).replace('$2', trId);
        return this.http.get(url);
    }

    getAllShipmentDetails(trId) {
        let url = environment.api.traceability.getShipmentDetails;
        url = url.replace('$1', trId);
        return this.http.get(url);
    }

    saveShipmentDetails(trId, shipmentInfo) {
        const payload = {
            shipmentDetails: shipmentInfo,
            id: trId
        };
        return this.http.post(environment.api.traceability.addShipmentDetails, payload);
    }
}
