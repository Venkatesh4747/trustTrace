import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface IGenerateApiKeyHttpResponse {
    status: string;
    data?: {
        apiKey: string;
        createdOn: number;
    };
    errors?: string;
}

@Injectable()
export class GenerateApiKeyService {
    constructor(private http: HttpClient) {}

    getApiKey(): Observable<IGenerateApiKeyHttpResponse> {
        const url = environment.api.settings.api.getApiKey;
        return this.http.get<IGenerateApiKeyHttpResponse>(url);
    }

    generateNewApiKey(): Observable<IGenerateApiKeyHttpResponse> {
        const url = environment.api.settings.api.generateApiKey;
        return this.http.get<IGenerateApiKeyHttpResponse>(url);
    }

    deleteApiKey(): Observable<IGenerateApiKeyHttpResponse> {
        const url = environment.api.settings.api.deleteApiKey;
        return this.http.get<IGenerateApiKeyHttpResponse>(url);
    }
}
