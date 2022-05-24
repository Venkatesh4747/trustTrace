import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from './../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class TEmsService {
    constructor(private http: HttpClient) {}

    public getProductEntities(entity: string) {
        let url = environment.api.traceabilityRequest.getEntities;
        url = url.replace('$entity', entity);
        return this.http.get(url);
    }

    public createTr(createApi: string, payload: any) {
        let url = environment.api.traceabilityRequest.createTr;
        url = url.replace('$createApi', createApi);
        return this.http.post(url, payload);
    }

    public lockTr(id: string): Observable<any> {
        let url = environment.api.traceabilityRequest.lockTems;
        url = url.replace('$trId', id);
        return this.http.patch(url, null);
    }

    public unlockTr(id: string): Observable<any> {
        let url = environment.api.traceabilityRequest.unlockTems;
        url = url.replace('$trId', id);
        return this.http.patch(url, null);
    }

    public getAddMoreInput(entityType: string, trId?: string) {
        let url = environment.api.traceabilityRequest.getAddMoreInput;
        url = url.replace('$entityType', entityType);
        if (trId) {
            url = url.replace('$trId', trId);
        } else {
            url = url.replace('$trId', '');
        }
        return this.http.get(url);
    }

    public getFilters(payload) {
        const url = environment.api.t_ems.getFilters;
        return this.http.post(url, payload);
    }

    public getAllTrs(payload: any) {
        const url = environment.api.t_ems.getAllTrs;
        return this.http.post(url, payload);
    }

    public getEvidenceCollectionData(trId: string) {
        let url = environment.api.traceabilityRequest.getEvidenceCollectionData;
        url = url.replace('$trId', trId);
        return this.http.get(url);
    }

    public persistEvidenceCollection(evidenceCollectionJsonData: any, action: string, trId: string) {
        if (action === 'SAVE') {
            let url = environment.api.traceabilityRequest.saveEvidenceCollectionData;
            url = url.replace('$trId', trId);
            return this.http.put(url, evidenceCollectionJsonData);
        } else {
            let url = environment.api.traceabilityRequest.processEvidenceCollectionData;
            url = url.replace('$trId', trId);
            return this.http.put(url, evidenceCollectionJsonData);
        }
    }

    public getAddMoreCertificatesInput(trId: string) {
        let url = environment.api.traceabilityRequest.getAddMoreCertificatesInput;
        url = url.replace('$trId', trId);
        return this.http.get(url);
    }

    public getEvidenceCollectionViewData(trId: string) {
        let url = environment.api.traceabilityRequest.evidenceCollectionDetailedView;
        url = url.replace('$trId', trId);
        return this.http.get(url);
    }

    public getSupplyChainForproductEvidence(trId: string) {
        let url = environment.api.traceabilityRequest.getSupplyChainForProductEvidence;
        url = url.replace('$trId', trId);
        return this.http.get(url);
    }

    public updateSupplyChainForStyleMaterialProductEvidence(trId: string) {
        let url = environment.api.traceabilityRequest.updateSupplyChainForStyleMaterialProductEvidence;
        url = url.replace('$trId', trId);
        return this.http.put(url, {});
    }

    public updateSupplyChainForTRProductEvidence(trId: string, entityId: string) {
        let url = environment.api.traceabilityRequest.updateSupplyChainForTRProductEvidence;
        url = url.replace('$trId', trId);
        url = url.replace('$entityId', entityId);
        return this.http.put(url, {});
    }
    getEvidences(entity: any, entityId: any) {
        let url = environment.api.traceabilityRequest.getAllProductEvidenceRequestsByEntity;
        url = url.replace('$entity', entity).replace('$entityId', entityId);
        return this.http.get(url);
    }
    public getEvidence(trId) {
        let url = environment.api.traceabilityRequest.fetchProductEvidence;
        url = url.replace('$trId', trId);
        return this.http.get(url);
    }
}
