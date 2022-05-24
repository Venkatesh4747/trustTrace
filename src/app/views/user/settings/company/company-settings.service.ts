import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../../../environments/environment';

@Injectable()
export class CompanySettingsService {
    constructor(private http: HttpClient) {}

    public getStyleSettings(): Observable<any> {
        return this.http.get(environment.api.settings.style.getSettings);
    }

    public saveProductCategory(payload): Observable<any> {
        return this.http.post(environment.api.settings.style.saveProductCategory, payload);
    }
    public saveStyleColorSettings(payload): Observable<any> {
        return this.http.post(environment.api.settings.style.saveStyleColorSettings, payload);
    }

    public saveKVSettings(payload, sectionName): Observable<any> {
        return this.http.post(environment.api.settings.style.saveKVSettings.replace('$1', sectionName), payload);
    }

    public getAuditValidityAndConfig() {
        return this.http.get(environment.api.settings.audit.getAuditValidityAndConfig);
    }
    public saveAuditValidity(payload) {
        return this.http.post(environment.api.settings.audit.saveAuditValidity, payload);
    }
    public saveAuditPriority(payload) {
        return this.http.post(environment.api.settings.audit.saveAuditPriority, payload);
    }

    public getAuditPriorities() {
        return this.http.get(environment.api.settings.audit.getAuditPriority);
    }

    public updateAuditPriority(payload, categoryId) {
        return this.http.put(environment.api.settings.audit.updateAuditPriority.replace('$1', categoryId), payload);
    }

    public deleteAuditPriority(categoryId) {
        return this.http.delete(environment.api.settings.audit.deleteAuditPriority.replace('$1', categoryId));
    }

    public getFilterCriteriaItems(id: string) {
        const payload = {
            apiName: 'UAT-IntegrationGetFilterCriteria-Service_API'
        };
        return this.http.post(environment.api.settings.integration.getItems.replace('$companyId', id), payload);
    }

    public submitFilterCriteriaItems(id: string, list: any) {
        const payload = {
            apiName: 'UAT-IntegrationUpdateFilterCriteria-Service_API',
            dataList: list
        };
        return this.http.post(environment.api.settings.integration.getItems.replace('$companyId', id), payload);
    }

    public getDataMappingItems(alias: string) {
        return this.http.get(environment.api.settings.integration.getAlias.replace('$aliasName', alias));
    }

    public updateDataMappingItems(alias: string, payload: any) {
        return this.http.post(environment.api.settings.integration.getAlias.replace('$aliasName', alias), payload);
    }
}
