import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class CreateStyleService {
    constructor(private http: HttpClient) {}

    public getStyleConfigs(): Observable<any> {
        const url = environment.api.styles.styleConfigs;
        return this.http.get(url);
    }

    public createStyles(payload: any): Observable<any> {
        // const payloadList = [];
        // payloadList.push(payload);
        return this.http.post(environment.api.styles.createStyle, payload);
    }

    public updateStyles(payload: any): Observable<any> {
        // const payloadList = [];
        // payloadList.push(payload);
        return this.http.put(environment.api.styles.editStyle, payload);
    }

    public getByProductType(payload: any): Observable<any> {
        const url = environment.api.styles.getByProductType.replace('$productType', payload);
        return this.http.get<any>(url).pipe(map(data => data.data['AreaOfUsage']));
    }

    public cloneStyles(payload): Observable<any> {
        return this.http.post(environment.api.styles.cloneStyles, payload);
    }

    public getStyle(id): Observable<any> {
        const url = environment.api.styles.getStyles.replace('$1', id);
        return this.http.get(url);
    }

    public searchFreeHandArticle(payload): Observable<any> {
        return this.http.post(environment.api.styles.searchArticle, payload);
    }
}
