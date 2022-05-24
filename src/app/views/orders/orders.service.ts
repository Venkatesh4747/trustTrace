import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import * as FileSaver from 'file-saver';
import { Observable } from 'rxjs';

import { environment } from './../../../environments/environment';
import { map } from 'rxjs/operators';

@Injectable()
export class OrdersService {
    constructor(private http: HttpClient) {}

    public uploadCertificate(evidenceId: string, file: File, type = 'CERT') {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', type);
        if (evidenceId && evidenceId.length > 0) {
            formData.append('evidenceId', evidenceId);
        }

        const url = environment.api.orders.uploadCertificate;

        return this.http.post(url, formData).pipe(map(response => response['data']));
    }

    public removeEvidenceFile(evidenceId, fileName): Observable<any> {
        const payload = {
            evidenceId: evidenceId,
            fileName: fileName
        };
        return this.http.post(environment.api.assessment.removeAssociation, payload);
    }

    public getOrdersFilter(payload) {
        return this.http.post(environment.api.orders.ordersFilter, payload);
    }

    public getOrders(payload) {
        const url = environment.api.orders.getOrders;
        return this.http.post(url, payload);
    }

    public getRepackageConfig() {
        return this.http.get(environment.api.orders.getRepackageConfig);
    }
    public getInboundConfig() {
        return this.http.get(environment.api.orders.inboundConfig);
    }

    public saveInbound(payload) {
        return this.http.post(environment.api.orders.saveInbound, payload);
    }
    public getProductionConfig() {
        return this.http.get(environment.api.orders.productionConfig);
    }

    public saveProductionTransaction(payload) {
        return this.http.post(environment.api.orders.production, payload);
    }

    public getOutboundConfig() {
        return this.http.get(environment.api.orders.outboundConfig);
    }

    public saveOutbound(payload) {
        return this.http.post(environment.api.orders.saveOutbound, payload);
    }

    public createRepackage(payload) {
        const url = environment.api.orders.createRepackage;
        return this.http.post(url, payload);
    }

    public searchFreeHandArticleOrStyle(payload) {
        return this.http.post(environment.api.orders.searchArticleOrStyle, payload);
    }

    public searchFreeHandArticle(payload) {
        return this.http.post(environment.api.orders.searchArticle, payload);
    }

    public searchFreeHandStyle(payload) {
        return this.http.post(environment.api.orders.searchStyle, payload);
    }

    public searchLot(payload) {
        return this.http.post(environment.api.orders.searchLot, payload);
    }

    public getOrdersSupplyChain(orderId) {
        return this.http.get(environment.api.orders.getOrdersSupplyChain.replace('$1', orderId));
    }

    public getTraceabilitySupplyChain(id) {
        return this.http
            .get(environment.api.orders.getTraceabilitySupplyChain.replace('$1', id))
            .pipe(map(response => response['data']));
    }

    public fetchQRDetails(qrCode) {
        return this.http
            .get(environment.api.qr.fetchQRDetails.replace('$qrCode', qrCode))
            .pipe(map(response => response['data']));
    }

    public fetchLotOriginChart(transactionId) {
        return this.http
            .get(environment.api.orders.lotOrigin.replace('$transactionId', transactionId))
            .pipe(map(response => response['data']));
    }

    public isReferenceIfUnique(referenceId: string) {
        return this.http.post(environment.api.orders.referenceIdIsUnique.replace('$reference-id', referenceId), {});
    }

    public getRequiredCertificatesList(transactionId: string) {
        return this.http
            .get(environment.api.orders.getCertificateList.replace('$transaction-id', transactionId))
            .pipe(map(response => response['data']['data']));
    }

    public saveTransactionCertificateAssociation(transaction_id, payload, entity_type = 'TRANSACTION') {
        let url = '';
        switch (entity_type) {
            case 'TRANSACTION':
                url = environment.api.orders.updateCertificates.replace('$transaction-id', transaction_id);
                break;
            case 'TT_TRANSACTION':
                url = environment.api.transactions.updateCertificates.replace('$transaction-id', transaction_id);
                break;
            default:
                url = environment.api.orders_lite.updateCertificates.replace('$transaction-id', transaction_id);
                break;
        }
        return this.http.put(url, payload);
    }

    public getRequiredCertificates(soa_id) {
        return this.http
            .get(environment.api.orders.getRequiredCertificates.replace('$soa-id', soa_id))
            .pipe(map(response => response['data']));
    }

    public checkIfInvalidCertificatesPresent(validationResponse) {
        let invalidCertificatesPresent = false;
        if (validationResponse) {
            validationResponse.forEach(x => {
                if (x.validationResponse && !x.validationResponse.validationStatus) {
                    invalidCertificatesPresent = true;
                }
            });
        }
        return invalidCertificatesPresent;
    }

    public constructValidationResponseMap(validationResponse) {
        let validationResponseMap = {};
        if (validationResponse) {
            validationResponse.forEach(x => {
                validationResponseMap[x.typeId] = x.validationResponse;
            });
        }
        return validationResponseMap;
    }
}
