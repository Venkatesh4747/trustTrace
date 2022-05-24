import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from './../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class EvidenceService {
    constructor(private http: HttpClient) {}

    public getEvidences(payload: any) {
        const url = environment.api.evidences.getEvidences;
        return this.http.post(url, payload);
    }

    public getEvidencesFilter(payload: any) {
        return this.http.post(environment.api.evidences.evidencesFilter, payload);
    }

    public uploadFile(file, type, id, fileType) {
        const payload = {
            entityType: 'TT_DOCUMENT_TRANSFORMED',
            category: 'PRODUCT',
            uploadedFiles: []
        };

        const formData = new FormData();
        if (fileType === 'trader') {
            formData.append('certId', id);
        }
        formData.append('file', file);
        formData.append('type', type);
        formData.append('inputPayload', JSON.stringify(payload));
        return this.http.post(environment.api.evidences.uploadFile, formData);
    }

    public extractUploadedEvidence(payload: any) {
        const url = environment.api.evidences.extractUploadedEvidence;
        return this.http.post(url, payload).pipe(map(response => response['data']));
    }

    public submitEvidence(payload: any) {
        const url = environment.api.evidences.submitEvidence;
        return this.http.post(url, payload);
    }
    public deleteEvidence(payload: any): Observable<any> {
        const url = environment.api.evidences.deleteEvidence;
        return this.http.post(url, payload).pipe(map(response => response['data']));
    }

    public getSellersBuyersAndConsignees() {
        const url = environment.api.evidences.getSellersBuyersAndConsignees;
        return this.http.get(url).pipe(map(response => response['data']));
    }

    public hasValidProductNames(payload: any): Observable<any> {
        const url = environment.api.evidences.hasValidProductNames;
        return this.http.post(url, payload).pipe(map(response => response['data']));
    }

    public hasMatchingMaterialComposition(payload: any): Observable<any> {
        const url = environment.api.evidences.matchingMaterialCompostion;
        return this.http.post(url, payload).pipe(map(response => response['data']));
    }

    public getFacilityListForCompany(payload: any): Observable<any> {
        const url = environment.api.evidences.facilityListForCompany;
        return this.http.post(url, payload).pipe(map(response => response['data']));
    }
}
