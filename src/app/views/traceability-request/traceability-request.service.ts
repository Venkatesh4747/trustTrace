import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from './../../../environments/environment';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { IGetPONumber } from './traceability.model';

@Injectable({
    providedIn: 'root'
})
export class TraceabilityRequestService {
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

    public getSupplyChainData(trId: string, isReuse = false) {
        let url = environment.api.traceabilityRequest.getSupplyChainData;
        url = url.replace('$trId', trId);

        if (isReuse) {
            url = `${url}?reuseFrom=External`;
        }
        return this.http.get(url);
    }

    public getSupplyChainTreeData(trId: string, isReuse = false): Observable<any> {
        let url = environment.api.traceabilityRequest.getSupplyChainTreeData;
        url = url.replace('$trId', trId);

        if (isReuse) {
            url = `${url}?reuseFrom=External`;
        }
        return this.http.get(url);
    }

    public getSupplyChainBOMData(trId: string) {
        let url = environment.api.traceabilityRequest.getSupplyChainBOMData;
        url = url.replace('$trId', trId);
        return this.http.get(url);
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
        const url = environment.api.traceabilityRequest.getFilters;
        return this.http.post(url, payload);
    }

    public getAllTrs(payload: any) {
        const url = environment.api.traceabilityRequest.getAllTrs;
        return this.http.post(url, payload);
    }

    public saveSupplyChain(payload: any, trId: string) {
        let url = environment.api.traceabilityRequest.saveSupplyChain;
        url = url.replace('$trId', trId);
        return this.http.put(url, payload);
    }

    public launchAndProceedSupplyChain(payload: any, trId: string) {
        let url = environment.api.traceabilityRequest.launchAndProceedSupplyChain;
        url = url.replace('$trId', trId);
        return this.http.put(url, payload);
    }

    public getReusableSupplyChain(trId: string) {
        let url = environment.api.traceabilityRequest.reusableSupplyChain;
        url = url.replace('$trId', trId);
        return this.http.get(url);
    }

    public processReusableSupplyChain(payload: any, trId: string) {
        let url = environment.api.traceabilityRequest.processReusableSupplyChain;
        url = url.replace('$trId', trId);
        return this.http.put(url, payload);
    }

    public getTrUIMetadata(trId: string) {
        let url = environment.api.traceabilityRequest.getTrUIMetadata;
        url = url.replace('$trId', trId);
        return this.http.get(url).pipe(map(response => response['data']));
    }

    public getAllFacility(id: string) {
        let url = environment.api.profile.getAllFacility;
        url = url.replace('$1', id);
        return this.http.get(url).pipe(map(response => response['data']));
    }

    public archiveTr(id: string): Observable<any> {
        let url = environment.api.traceabilityRequest.archiveTr;
        url = url.replace('$trId', id);
        return this.http.patch(url, null);
    }
    public getPoNumber(value: IGetPONumber): Observable<string[]> {
        let url = environment.api.poManagement.getPoNumber;
        url = url.replace('$styleID', value.styleID);
        url = url.replace('$supplierID', value.supplierID);
        return this.http.get(url).pipe(map(response => response['data']['PoNumbers']));
    }
    public lockTr(id: string): Observable<any> {
        let url = environment.api.traceabilityRequest.lockTr;
        url = url.replace('$trId', id);
        return this.http.patch(url, null);
    }

    public unlockTr(id: string): Observable<any> {
        let url = environment.api.traceabilityRequest.unlockTr;
        url = url.replace('$trId', id);
        return this.http.patch(url, null);
    }

    public getAllSuppliers(payload: any): Observable<any> {
        return this.http.post(environment.api.suppliers.getAllSuppliers, payload);
    }
}
