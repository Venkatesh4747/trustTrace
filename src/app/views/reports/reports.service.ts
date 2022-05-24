import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { map } from 'rxjs/operators';
import { environment } from './../../../environments/environment';
import { IModulesDetail, IReport } from './reports.model';

@Injectable({
    providedIn: 'root'
})
export class ReportsService {
    constructor(private http: HttpClient) {}

    public getModules(): Observable<IModulesDetail[]> {
        const url = environment.api.reports.getModules;
        return this.http.get(url).pipe(map(response => response['data']['modules']));
    }

    public getReports(module: string): Observable<IReport[]> {
        let url = environment.api.reports.getReports;
        url = url.replace('$module', module);
        return this.http.get(url).pipe(map(response => response['data']['reports']));
    }

    public getReportConfigs(module: string) {
        let url = environment.api.reports.getReportConfigs;
        url = url.replace('$module', module);
        return this.http.get(url).pipe(map(response => response['data']['reports']));
    }

    public getFilterConfigs(processor: string) {
        let url = environment.api.reports.getFilterConfigs;
        url = url.replace('$processor', processor);
        return this.http.get(url).pipe(map(response => response['data']));
    }

    public generateReport(payload) {
        const url = environment.api.reports.generateReport;
        return this.http.post(url, payload);
    }

    public getReportFile(reportId: string, format: string) {
        let url = environment.api.reports.downloadReport;
        url = url.replace('$reportId', reportId).replace('$format', format);
        return this.http.get(url, { responseType: 'blob' as 'blob' });
    }
}
