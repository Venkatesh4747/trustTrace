import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { environment } from '../../../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class AuditService {
    constructor(private http: HttpClient) {}

    getAuditSettings() {
        const url = environment.api.audits.getAuditSettings;
        return this.http.get(url).pipe(map((response: any) => response.data.data));
    }

    createAuditNonConformanceCategory(payload) {
        const url = environment.api.audits.createAuditNonConformanceCategory;
        return this.http.post(url, payload).pipe(map((response: any) => response.data.data));
    }

    createAuditNonConformanceSubCategory(categoryId, payload) {
        const url = environment.api.audits.createAuditNonConformanceSubCategory.replace('$id', categoryId);
        return this.http.post(url, payload).pipe(map((response: any) => response.data.data));
    }

    updateAuditNonConformanceCategory(nonConformanceCategoryID, nonConformanceCategoryName) {
        const url = environment.api.audits.updateAuditNonConformanceCategory.replace('$id', nonConformanceCategoryID);
        const payload = {
            value: nonConformanceCategoryName
        };
        return this.http.put(url, payload).pipe(map((response: any) => response.data.data));
    }

    updateAuditNonConformanceSubCategory(
        nonConformanceCategoryID,
        nonConformanceSubCategoryID,
        nonConformanceSubCategoryName
    ) {
        const url = environment.api.audits.updateAuditNonConformanceSubCategory
            .replace('$category-id', nonConformanceCategoryID)
            .replace('$subCategory-id', nonConformanceSubCategoryID);
        const payload = {
            value: nonConformanceSubCategoryName
        };
        return this.http.put(url, payload).pipe(map((response: any) => response.data.data));
    }

    deleteAuditNonConformanceCategory(nonConformanceCategoryID) {
        const url = environment.api.audits.deleteAuditNonConformanceCategory.replace('$id', nonConformanceCategoryID);
        return this.http.delete(url).pipe(map((response: any) => response.data.data));
    }

    deleteNonConformanceSubCategory(categoryId: string, subCategoryId) {
        const url = environment.api.audits.deleteAuditNonConformanceSubCategory
            .replace('$category-id', categoryId)
            .replace('$subcategory-id', subCategoryId);
        return this.http.delete(url);
    }

    getAuditTemplates() {
        const url = environment.api.audits.getAuditTemplates;
        return this.http.get(url).pipe(map((response: any) => response['data']));
    }

    getFacilityAuditDrafts(payload: any) {
        const url = environment.api.audits.getFacilityAuditDrafts;
        return this.http.post(url, payload).pipe(map((response: any) => response['data']));
    }

    auditDrafts(payload: any) {
        const url = environment.api.audits.auditDrafts;
        return this.http.post(url, payload).pipe(map((response: any) => response['data']));
    }

    auditExtracted(id: string) {
        let url = environment.api.audits.auditExtracted;
        url = url.replace('$draftId', id);
        return this.http.get(url).pipe(map((response: any) => response['data']));
    }
}
