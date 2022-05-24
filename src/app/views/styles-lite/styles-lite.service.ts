import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class StylesLiteService {
    constructor(private http: HttpClient) {}

    public getStyles(payload) {
        const url = environment.api.styles_lite.getStyles;
        return this.http.post(url, payload);
    }

    public getStylesFilter(payload) {
        return this.http.post(environment.api.styles_lite.getStylesFilter, payload);
    }

    public getStyleDetail(id: string) {
        let url = environment.api.styles_lite.getStyleDetail;
        url = url.replace('$id', id);
        return this.http.get(url);
    }

    public submitStyles(payload) {
        return this.http
            .post(environment.api.styles_lite.submitStyles, payload)
            .pipe(map(response => response['data']));
    }

    public downloadStylesData() {
        const url = environment.api.styles_lite.downloadStylesData;
        return this.http.get(url, { responseType: 'blob' as 'blob' });
    }

    public uploadStylesData(payload: any) {
        const formData = new FormData();
        formData.append('file', payload);
        return this.http.post<any>(environment.api.styles_lite.uploadStylesData, formData);
    }
}
