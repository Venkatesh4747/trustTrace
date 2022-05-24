import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { HandlingHttpErrorsService } from '../../shared/utils/handling-http-errors.service';
import { environment } from './../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class PoManagementService {
    constructor(private http: HttpClient, private errorHandleService: HandlingHttpErrorsService) {}

    public getPOs(payload) {
        const url = environment.api.poManagement.getPOs;
        return this.http.post(url, payload);
    }

    public getPOsFilter(payload) {
        return this.http.post(environment.api.poManagement.posFilter, payload);
    }

    public submitPOs(payload) {
        return this.http.post(environment.api.poManagement.submitPOs, payload).pipe(map(response => response['data']));
    }

    public deletePOs(payload) {
        const body = JSON.stringify(payload);
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            }),
            body: body
        };
        return this.http.delete(environment.api.poManagement.deletePOs, httpOptions);
    }

    public downloadPOData() {
        const url = environment.api.poManagement.downloadPOData;
        return this.http.get(url, { responseType: 'blob' as 'blob' });
    }

    public uploadPOData(payload: any) {
        const formData = new FormData();
        formData.append('file', payload);
        return this.http.post<any>(environment.api.poManagement.uploadPOData, formData);
    }

    public getPODetail(id: string, styleId: string): Observable<any> {
        const url = `${environment.api.poManagement.getPODetail(id, styleId)}`;
        return this.http.get(url).pipe(catchError(this.errorHandleService.handleError));
    }
}
