import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from './../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class IntegrationLogsService {
    constructor(private http: HttpClient) {}

    public getLogs(payload: any, pagination: any) {
        const url = environment.api.integrationLogs.getLogs
            .replace('$pageNo', pagination.from)
            .replace('$pageSize', pagination.size);
        return this.http.post(url, payload);
    }

    public getLogsFilter() {
        return this.http.get(environment.api.integrationLogs.logsFilter);
    }

    public downloadLogs(id: string) {
        const url = environment.api.integrationLogs.downloadLogs.replace('$id', id);
        return this.http.get(url, { responseType: 'blob' as 'blob' });
    }

    public rerunLogs(id: string) {
        const url = environment.api.integrationLogs.rerunLogs.replace('$id', id);
        return this.http.post(url, {});
    }
}
