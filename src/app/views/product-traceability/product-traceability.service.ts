import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable()
export class ProductTraceabilityService {
    constructor(private http: HttpClient) {}

    public getLaunchedTRFilter() {
        return this.http.get(environment.api.traceability.getLaunchedTRFilter);
    }
    public getReceivedTRFilter() {
        return this.http.get(environment.api.traceability.getReceivedTRFilter);
    }
    public getAllTRs(trFilterOption) {
        return this.http.post(environment.api.traceability.getAllLaunchedTRs, trFilterOption);
    }

    public getAllStyles() {
        return this.http.get(environment.api.company.getAllStyles);
    }

    public getStyles(payload): Observable<any> {
        return this.http.post(environment.api.company.getStyles, payload);
    }

    public getAllReceivedTRs(trFilterOption) {
        return this.http.post(environment.api.traceability.getAllReceivedTRs, trFilterOption);
    }

    public getCreateTRMetadata() {
        return this.http.get(environment.api.traceability.getCreateTRMetadata);
    }

    public uploadPO(file) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', 'PO');

        return this.http.post(environment.api.traceability.uploadPO, formData);
    }

    public createTR(payload) {
        return this.http.post(environment.api.traceability.createTr, payload);
    }

    public getAllSubTRs(TRId, launched) {
        const url = environment.api.traceability.getAllSubTRs.replace('$1', TRId).replace('$2', launched);
        return this.http.get(url);
    }

    public getMetadata(input, tr_id) {
        const url = environment.api.traceability.getMetadata.replace('$1', input).replace('$2', tr_id);
        return this.http.get(url);
    }

    public saveVPToFacility(payload) {
        return this.http.put(environment.api.traceability.saveVpToFacility, payload);
    }

    public getPO(evidenceId): Observable<any> {
        const url = environment.api.traceability.getPO.replace('$1', evidenceId);
        return this.http.get(url, { responseType: 'blob' as 'blob' });
    }

    public getPOFileName(evidenceId): Observable<any> {
        const url = environment.api.traceability.getPOFileName.replace('$1', evidenceId);
        return this.http.get(url);
    }

    public getProductFlow(tr_id) {
        const url = environment.api.traceability.getProductFlow.replace('$1', tr_id);
        return this.http.get(url);
    }

    public saveFibreMaterial(payload) {
        return this.http.put(environment.api.traceability.saveFibreMaterial, payload);
    }

    getFibreMaterials() {
        return this.http.get(environment.api.traceability.getFibreMaterials);
    }

    public submitTR(trId) {
        const payload = { id: trId };
        return this.http.post(environment.api.traceability.submit, payload);
    }

    public approveTR(trId) {
        const payload = { id: trId };
        return this.http.post(environment.api.traceability.approve, payload);
    }

    public getAllCertifications(trId) {
        let url = environment.api.traceability.getAllCertifications;
        url = url.replace('$trId', trId);
        return this.http.get(url);
    }

    public searchStyle(payload) {
        return this.http.post(environment.api.orders.searchStyle, payload);
    }
}
