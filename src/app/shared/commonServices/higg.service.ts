import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
    IGetApiKeyHttpResponse,
    IHiggApiKey,
    IHiggSavedApiKey,
    ISaveApiKeyHttpResponse,
    ISyncAuditHttpResponse
} from '../models/higg.model';

@Injectable()
export class HiggService {
    constructor(private http: HttpClient) {}

    getApiKey(): Observable<IHiggApiKey> {
        return this.http
            .get<IGetApiKeyHttpResponse>(environment.api.higg.getHiggApi)
            .pipe(map((higgApiResponse: IGetApiKeyHttpResponse) => higgApiResponse.data));
    }

    saveApiKey(apiKey: IHiggApiKey): Observable<IHiggSavedApiKey> {
        return this.http
            .post<ISaveApiKeyHttpResponse>(environment.api.higg.saveHiggApi, { apiKey })
            .pipe(map((savedApiResponse: ISaveApiKeyHttpResponse) => savedApiResponse.data.data));
    }

    syncAuditData(): Observable<HttpResponse<ISyncAuditHttpResponse>> {
        return this.http.get<ISyncAuditHttpResponse>(environment.api.higg.syncAudit, { observe: 'response' });
    }
}
