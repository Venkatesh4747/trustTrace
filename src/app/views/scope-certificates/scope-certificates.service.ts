import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class ScopeCertificatesService {
    constructor(private http: HttpClient) {}

    public getScopeCertificates(payload: any) {
        const url = environment.api.scopeCertificates.getScopeCertificates;
        return this.http.post(url, payload);
    }

    public getScopeCertificatesFilter(payload: any) {
        return this.http.post(environment.api.scopeCertificates.scopeCertificatesFilter, payload);
    }

    public uploadFile(file, type) {
        const payload = {
            entityType: 'TT_DOCUMENT_TRANSFORMED',
            category: 'PRODUCT',
            uploadedFiles: []
        };

        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', type);
        formData.append('inputPayload', JSON.stringify(payload));
        return this.http.post(environment.api.scopeCertificates.uploadFile, formData);
    }

    public extractUploadedScopeCertificate(payload: any) {
        const url = environment.api.scopeCertificates.extractUploadedScopeCertificate;
        return this.http.post(url, payload).pipe(map(response => response['data']));
    }

    public submitScopeCertificate(payload: any) {
        const url = environment.api.scopeCertificates.submitScopeCertificate;
        return this.http.post(url, payload);
    }

    public getSuppliersAndFacilities() {
        const url = environment.api.scopeCertificates.getSuppliersAndFacilities;
        return this.http.get(url).pipe(map(response => response['data']));
    }

    public getScopeCertificateDetail(certId: string) {
        let url = environment.api.scopeCertificates.getScopeCertificateDetail;
        url = url.replace('$certId', certId);
        return this.http.get(url).pipe(map(response => response['data']));
    }

    public hasValidSCForComapany(companyId) {
        let url = environment.api.scopeCertificates.hasValidSCForCompany;
        if (companyId) {
            url = url.replace('$companyId', companyId);
        }
        return this.http.get(url).pipe(map(response => response['data']));
    }

    public hasValidSC() {
        const url = environment.api.scopeCertificates.hasValidSC;
        return this.http.get(url).pipe(map(response => response['data']));
    }
}
