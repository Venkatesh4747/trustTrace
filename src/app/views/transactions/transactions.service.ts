import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from './../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class TransactionsService {
    constructor(private http: HttpClient) {}

    public getOrdersSupplyChain(orderId) {
        return this.http.get(environment.api.transactions.getOrdersSupplyChain.replace('$1', orderId));
    }

    public getOrders(payload) {
        const url = environment.api.transactions.getOrders;
        return this.http.post(url, payload);
    }

    public getNotificationDetail(notificationDetailPayload) {
        return this.http
            .post(environment.api.transactions.getNotificationDetail, notificationDetailPayload)
            .pipe(map(response => response['data']));
    }

    public getOrdersFilter(payload) {
        return this.http.post(environment.api.transactions.ordersFilter, payload);
    }

    public submitDraftOrders(payload) {
        return this.http
            .post(environment.api.transactions.submitDraftOrders, payload)
            .pipe(map(response => response['data']));
    }

    public deleteSelectedTransactions(payload: string[]): Observable<any> {
        return this.http
            .post(environment.api.transactions.deleteSelectedTransactions, payload)
            .pipe(map(response => response['data']));
    }

    public deleteSelectedSubmittedTransactions(payload: string[]): Observable<any> {
        return this.http
            .post(environment.api.transactions.deleteSelectedSubmittedTransactions, payload)
            .pipe(map(response => response['data']));
    }

    public submitAllDraftOrders() {
        return this.http
            .post(environment.api.transactions.submitAllDraftOrders, {})
            .pipe(map(response => response['data']));
    }

    public getRequiredCertificatesList(transactionId: string) {
        return this.http
            .get(environment.api.transactions.getCertificateList.replace('$transaction-id', transactionId))
            .pipe(map(response => response['data']['data']));
    }

    public downloadTransactionsData(payload: any) {
        const url = environment.api.transactions.downloadTransactionsData;
        return this.http.post(url, payload, { responseType: 'blob' as 'blob' });
    }

    public uploadTransactionsData(fileData: any, payload: any) {
        const formData = new FormData();
        formData.append('file', fileData);
        if (payload) {
            formData.append('inputPayload', JSON.stringify(payload));
        }
        return this.http.post<any>(environment.api.transactions.uploadTransactionsData, formData);
    }

    public getTransaction(transactionId) {
        return this.http
            .get(environment.api.transactions.getTransaction.replace('$transactionId', transactionId))
            .pipe(map(response => response['data']));
    }

    // Inbound services
    public getInboundConfig() {
        return this.http.get(environment.api.transactions.inboundConfig);
    }

    public submitTransactions(payload) {
        return this.http
            .post(environment.api.transactions.submitTransactions, payload)
            .pipe(map(response => response['data']));
    }

    public getOutboundConfig(brandContextId) {
        let url = environment.api.transactions.outboundConfig;
        url = url.replace('$brandContextId', brandContextId);
        return this.http.get(url);
    }

    public getFacilities(payload: any) {
        return this.http.post(environment.api.transactions.getFacilities, payload);
    }

    public searchLot(payload) {
        return this.http.post(environment.api.transactions.searchLot, payload);
    }

    public searchFreeHandArticleOrStyle(payload) {
        return this.http.post(environment.api.transactions.searchArticleOrStyle, payload);
    }

    public searchFreeHandStyle(payload) {
        return this.http.post(environment.api.transactions.searchStyle, payload);
    }

    public searchFreeHandMaterial(payload) {
        return this.http.post(environment.api.transactions.searchMaterial, payload);
    }

    public searchSupplier(payload) {
        return this.http.post(environment.api.transactions.searchSupplier, payload);
    }

    public searchTransaction(payload) {
        return this.http.post(environment.api.transactions.searchArticle, payload);
    }

    public uploadCertificate(evidenceId: string, file: File, type = 'CERT') {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', type);
        if (evidenceId && evidenceId.length > 0) {
            formData.append('evidenceId', evidenceId);
        }

        const url = environment.api.transactions.uploadCertificate;

        return this.http.post(url, formData).pipe(map(response => response['data']));
    }

    public removeEvidenceFile(evidenceId, fileName): Observable<any> {
        const payload = {
            evidenceId: evidenceId,
            fileName: fileName
        };
        return this.http.post(environment.api.assessment.removeAssociation, payload);
    }

    public isReferenceIfUnique(referenceId: string) {
        return this.http.post(
            environment.api.transactions.referenceIdIsUnique.replace('$reference-id', referenceId),
            {}
        );
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

    public getRequiredCertificates(soa_id: string) {
        return this.http
            .get(environment.api.transactions.getRequiredCertificates.replace('$soa-id', soa_id))
            .pipe(map(response => response['data']));
    }

    public getMaterialDetails(payload) {
        let url = environment.api.transactions.searchMaterial;
        return this.http.post(url, payload).pipe(map(response => response['data']['searchResponse'][0]));
    }

    public getStyleDetails(payload) {
        let url = environment.api.styles.getAllProducts;
        return this.http.post(url, payload).pipe(map(response => response['data']['searchResponse'][0]));
    }

    public getTierConfig(payload) {
        const url = environment.api.transactions.getTierConfig;
        return this.http.post(url, payload).pipe(map(response => response['data']));
    }

    public getProductionConfig() {
        return this.http.get(environment.api.transactions.productionConfig);
    }

    public checkToShowField(item: string, mandatoryFields: string[], tierConfig: any) {
        if (mandatoryFields.includes(item)) {
            return true;
        }
        if (tierConfig[item] && tierConfig[item].visible) {
            return true;
        }
        return false;
    }

    public getFieldLabel(item: string, mandatoryFields: string[], tierConfig: any) {
        if (mandatoryFields.includes(item)) {
            return tierConfig && tierConfig[item] ? tierConfig[item].aliasName : item;
        }
        if (tierConfig && tierConfig[item]) {
            return tierConfig[item].aliasName;
        }
    }
    public getFieldValues(item: string, tierConfig: any): string[] {
        if (tierConfig && tierConfig[item]) {
            return tierConfig[item].fieldValues;
        }
        return [];
    }

    public getPOList(payload: any): Observable<any> {
        return this.http.post(environment.api.transactions.getPOList, payload).pipe(map(response => response['data']));
    }

    public getCottonInboundConfig() {
        return this.http.get(environment.api.transactions.cottonInboundConfig);
    }

    public getProductionIntermediateConfig() {
        return this.http.get(environment.api.transactions.productionConfig);
    }

    public getMaterialByMaterialCodeAndFacility(payload: any) {
        return this.http.post(environment.api.transactions.getMaterial, payload);
    }

    public getWaitingApprovalTransactionDetail(transactionId: string) {
        let url = environment.api.transactions.getWaitingApprovalTransactionDetail;
        url = url.replace('$transactionId', transactionId);
        return this.http.get(url).pipe(map(response => response['data']));
    }

    public filterForUniqueSOAValue(rawSOAData) {
        const filteredSOATerms = [];
        const filteredSOAData = [];
        rawSOAData.forEach(el => {
            el.unique_search = el.unique_search.replace('-null', '').replace('null-', '');
            if (filteredSOATerms.indexOf(el.unique_search) === -1) {
                filteredSOATerms.push(el.unique_search);
                filteredSOAData.push(el);
            }
        });
        return filteredSOAData;
    }

    public submitTransactionToLoApproval(txId: string) {
        return this.http
            .post(environment.api.transactions.submitTransactionToLoApproval, txId)
            .pipe(map(response => response['data']));
    }
}
