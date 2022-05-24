import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

import { environment } from './../../../environments/environment';
import { map } from 'rxjs/operators';
import { IImportApiResponse } from '../../shared/models/import.model';

@Injectable()
export class MaterialLibraryService {
    constructor(private http: HttpClient) {}

    getConfigs(): Observable<any> {
        return this.http.get(environment.api.rawMaterials.getConfig);
    }

    getMaterialLibraryFilter(payload): Observable<any> {
        return this.http.post(environment.api.rawMaterials.getMaterialLibraryFilter, payload);
    }

    getAllMaterials(payload) {
        const url = environment.api.rawMaterials.getAllMaterials;
        return this.http.post(url, payload);
    }

    createLibrary(payload) {
        const url = environment.api.rawMaterials.createLibrary;
        return this.http.post(url, payload);
    }

    cloneMaterial(payload) {
        const url = environment.api.rawMaterials.cloneMaterial;
        return this.http.post(url, payload);
    }

    getMaterialDetail(id: string) {
        let url = environment.api.rawMaterials.getMaterialDetail;
        url = url.replace('$id', id);
        return this.http.get(url);
    }

    updateMaterialLibrary(payload) {
        const url = environment.api.rawMaterials.createLibrary;
        return this.http.put(url, payload);
    }

    getMaterialStyleAssociation(id: string, pageNo: number) {
        let url = environment.api.rawMaterials.getMaterialStyleAssociation;
        url = url.replace('$id', id);
        url = url.replace('$pageNo', `${pageNo}`);
        return this.http.get(url);
    }

    getMaterialOrdersAssociation(id: string) {
        let url = environment.api.rawMaterials.getMaterialOrdersAssociation;
        url = url.replace('$id', id);
        return this.http.get(url).pipe(map(response => response['data']));
    }

    public viewQrCode(materialId: string) {
        const url = environment.api.rawMaterials.viewQrCode;
        return this.http.post(url, { id: materialId }).pipe(map(response => response['data']));
    }

    public saveAdditionalInfo(mlId: string, payload: any) {
        let url = environment.api.rawMaterials.getAdditionalInfo;
        url = url.replace('$mlId', mlId);
        return this.http.put(url, payload).pipe(map(response => response['data']));
    }

    public getAdditionalInfo(mlId) {
        let url = environment.api.rawMaterials.getAdditionalInfo;
        url = url.replace('$mlId', mlId);
        return this.http.get(url).pipe(map(response => response['data']));
    }

    public archiveMaterial(mlId: string): Observable<any> {
        let url = environment.api.rawMaterials.archiveMaterial;
        url = url.replace('$mlId', mlId);
        return this.http.patch(url, null);
    }

    public downloadData(): Observable<Blob> {
        const url = environment.api.rawMaterials.downloadMaterialTemplate;
        return this.http.get(url, { responseType: 'blob' as 'blob' });
    }

    public uploadData(payload: any): Observable<IImportApiResponse> {
        const formData = new FormData();
        formData.append('file', payload);
        return this.http.post<IImportApiResponse>(environment.api.rawMaterials.importMaterials, formData);
    }
}
