import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { IReleaseUpdate } from '../../core/notifications/release-update/release-update.model';

@Injectable()
export class AdminService {
    constructor(private http: HttpClient) {}

    validateData(dataFile): Observable<any> {
        const form = new FormData();
        form.append('file', dataFile);
        return this.http.post(environment.api.admin.validateData, form);
    }

    importData(dataFile): Observable<any> {
        const form = new FormData();
        form.append('file', dataFile);
        return this.http.post(environment.api.admin.importData, form);
    }

    getConflictTypes(): Observable<any> {
        return this.http.get(environment.api.admin.conflictDataType);
    }

    exportConflictsData(type): Observable<any> {
        let url = environment.api.admin.exportConflicts;
        url = url.replace('$1', type);
        return this.http.get(url, {
            responseType: 'blob' as 'blob'
        });
    }

    resetPassword(emailId, password): Observable<any> {
        const payload = {};
        payload['email'] = emailId;
        payload['password'] = password;
        return this.http.post(environment.api.admin.resetPassword, payload);
    }

    sendEmailRequest(emailId): Observable<any> {
        return this.http.post(environment.api.admin.sendEmailRequest, emailId);
    }

    getAllCompanies() {
        return this.http.get(environment.api.admin.getAllCompanies).pipe(map(response => response['data']));
    }

    getML(id: string) {
        let url = environment.api.admin.getML;
        url = url.replace('$companyId', id);
        return this.http.get(url).pipe(map(response => response['data']));
    }

    generateOrdersQRCodesJson(ordersQRCodeJson: any) {
        const url = environment.api.admin.generateOrdersQRCodesJson;
        // url = url.replace('$companyId', ordersQRCodeJson.company);
        // url = url.replace('$mlId', ordersQRCodeJson.article);
        const payload = {
            companyId: ordersQRCodeJson.company,
            mlId: ordersQRCodeJson.article,
            transactionType: ordersQRCodeJson.type,
            inputLotId: ordersQRCodeJson.inputLotId
        };
        return this.http.post(url, payload).pipe(map(response => response['data']));
    }

    getAllReleaseUpdate(): Observable<IReleaseUpdate[]> {
        const url = environment.api.notification.adminReleaseUpdate;
        return this.http.get(url).pipe(map(response => response['data']));
    }

    createReleaseUpdate(payload: IReleaseUpdate): Observable<any> {
        const url = environment.api.notification.adminReleaseUpdate;
        return this.http.post(url, payload, { observe: 'response' });
    }

    deleteReleaseUpdate(id: string): Observable<any> {
        const url = environment.api.notification.adminReleaseUpdate + `/${id}`;
        return this.http.delete(url);
    }

    uploadBlueprint(blueprintFile, bucketKey): Observable<any> {
        const form = new FormData();
        form.append('file', blueprintFile);
        form.append('bucketKey', bucketKey);
        return this.http.post(environment.api.admin.uploadBlueprint, form);
    }

    triggerCompliance() {
        const url = environment.api.admin.compliance;
        return this.http.put(url, {});
    }

    getDataSetBuckets(): Observable<string[]> {
        return this.http
            .get<{ data: string[]; message: string }>(environment.api.admin.getAvailableCalculationBuckets)
            .pipe(map(resp => resp.data));
    }

    uploadCalculationDatasets(data: FormData): Observable<any> {
        return this.http.post<any>(environment.api.admin.uploadCalculationDataSets, data);
    }

    triggerBatchOperation(): Observable<any> {
        return this.http.post(environment.api.admin.triggerBatchOperation, {});
    }
    batchOperationStatus(): Observable<{
        batch_trigger_id: string;
        executed_count: number;
        trigger_timestamp: number;
    }> {
        return this.http.get(environment.api.admin.batchOperationStatus).pipe(map(d => d['data']));
    }

    getAllApiKeys(): Observable<any> {
        return this.http.get(environment.api.admin.getAllApiKeys).pipe(map(response => response['data']));
    }

    generateNewApiKey(key: string): Observable<any> {
        const url = environment.api.admin.generateNewApiKey;
        return this.http.post(url, { keyName: key }).pipe(map(response => response['data']));
    }

    deleteApiKey(key: string): Observable<any> {
        const url = environment.api.admin.deleteApiKey(key);
        return this.http.get(url).pipe(map(response => response['data']));
    }
}
