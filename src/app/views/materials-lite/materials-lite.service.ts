import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class MaterialsLiteService {
    constructor(private http: HttpClient) {}

    public getMaterials(payload) {
        const url = environment.api.materials_lite.getMaterials;
        return this.http.post(url, payload);
    }

    public getMaterialsFilter(payload) {
        return this.http.post(environment.api.materials_lite.getMaterialsFilter, payload);
    }

    public getMaterialDetail(id: string) {
        let url = environment.api.materials_lite.getMaterialDetail;
        url = url.replace('$id', id);
        return this.http.get(url);
    }

    public submitMaterials(payload) {
        return this.http
            .post(environment.api.materials_lite.submitMaterials, payload)
            .pipe(map(response => response['data']));
    }

    public downloadMaterialData() {
        const url = environment.api.materials_lite.downloadMaterialData;
        return this.http.get(url, { responseType: 'blob' as 'blob' });
    }

    public uploadMaterialData(payload: any) {
        const formData = new FormData();
        formData.append('file', payload);
        return this.http.post<any>(environment.api.materials_lite.uploadMaterialData, formData);
    }
}
