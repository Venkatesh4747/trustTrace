import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class BomLiteService {
    constructor(private http: HttpClient) {}

    public getBom(payload) {
        const url = environment.api.bom_lite.getBom;
        return this.http.post(url, payload);
    }

    public getBomFilter(payload) {
        return this.http.post(environment.api.bom_lite.getBomFilter, payload);
    }

    public getBOMDetail(id: string) {
        let url = environment.api.bom_lite.getBOMDetail;
        url = url.replace('$id', id);
        return this.http.get(url);
    }

    public submitBom(payload) {
        return this.http.post(environment.api.bom_lite.submitBom, payload).pipe(map(response => response['data']));
    }

    public downloadBomData() {
        const url = environment.api.bom_lite.downloadBomData;
        return this.http.get(url, { responseType: 'blob' as 'blob' });
    }

    public uploadBomData(payload: any) {
        const formData = new FormData();
        formData.append('file', payload);
        return this.http.post<any>(environment.api.bom_lite.uploadBomData, formData);
    }
}
