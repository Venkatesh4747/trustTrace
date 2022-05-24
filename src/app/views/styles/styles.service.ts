import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from './../../../environments/environment';
import { map } from 'rxjs/operators';
import { IImportApiResponse } from '../../shared/models/import.model';

@Injectable()
export class StylesService {
    constructor(private http: HttpClient) {}

    public getProductsTemplateFilter(payload) {
        const url = environment.api.styles.getProductsTemplateFilter;
        return this.http.post(url, payload);
    }

    public getAllProducts(payload) {
        const url = environment.api.styles.getAllProducts;
        return this.http.post(url, payload);
    }

    public getProductDetails(product_name, filterOptions) {
        const productName = [];
        productName.push = product_name;
        filterOptions.productName = productName;
        const url = environment.api.styles.getAllProducts;
        return this.http.post(url, filterOptions);
    }

    public getStyleDetails(styleId) {
        let url = environment.api.styles.getStyleDetails;
        url = url.replace('$styleId', styleId);
        return this.http.get(url);
    }

    public getSupplyChainDetails(styleId) {
        let url = environment.api.styles.getSupplyChainDetails;
        url = url.replace('$styleId', styleId);
        return this.http.get(url).pipe(map(response => response['data']));
    }

    public viewQrCode(styleId: string) {
        const url = environment.api.styles.viewQrCode;
        return this.http.post(url, { id: styleId }).pipe(map(response => response['data']));
    }

    public archiveStyle(styleId: string): Observable<any> {
        let url = environment.api.styles.archiveStyle;
        url = url.replace('$styleId', styleId);
        return this.http.patch(url, null);
    }

    public getStyleCompliance(styleId: string) {
        let url = environment.api.styles.compliance;
        url = url.replace('$styleId', styleId);
        return this.http.get(url).pipe(map(response => response['data']));
    }

    public downloadData(): Observable<Blob> {
        const url = environment.api.styles.downloadStyleTemplate;
        return this.http.get(url, { responseType: 'blob' as 'blob' });
    }

    public uploadData(payload: any): Observable<IImportApiResponse> {
        const formData = new FormData();
        formData.append('file', payload);
        return this.http.post<any>(environment.api.styles.importStyles, formData);
    }
}
