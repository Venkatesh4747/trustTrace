import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { ICreateAuditPayload } from './view-audit-extracted/draft-data.model';

@Injectable()
export class AssessmentAuditService {
    constructor(private http: HttpClient) {}

    public getAuditsFilter(payload = {}) {
        return this.http.post(environment.api.audits.auditsFilter, payload);
    }

    getAudits(payload): Observable<any> {
        const url = environment.api.audits.getAudits;
        return this.http.post(url, payload);
    }

    public getAuditPriorities() {
        return this.http.get(environment.api.settings.audit.getAuditPriority).pipe(map(response => response['data']));
    }

    getAuditDetail(audit_id): Observable<any> {
        let url = environment.api.audits.getAuditDetails;
        url = url.replace('$auditId', audit_id);
        return this.http.get(url).pipe(map(response => response['data']));
    }

    addAudit(): Observable<any> {
        return this.http.get(environment.api.audits.addNewAudit).pipe(map(response => response['data']));
    }

    saveAudit(auditPayload): Observable<any> {
        const url = environment.api.audits.saveAudit;
        return this.http.post(url, auditPayload);
    }

    updateAudit(audit_id, auditPayload): Observable<any> {
        let url = environment.api.audits.updateAudit;
        url = url.replace('$auditId', audit_id);
        return this.http.put(url, auditPayload);
    }

    deleteAudit(audit_id): Observable<any> {
        let url = environment.api.audits.deleteAudit;
        url = url.replace('$auditId', audit_id);
        return this.http.delete(url);
    }

    deleteDraft(draftId: string): Observable<any> {
        let url = environment.api.audits.deleteDraft;
        url = url.replace('$draftId', draftId);
        return this.http.delete(url);
    }

    getTemplates(template, supplier, facility): Observable<any> {
        let url = environment.api.audits.getTemplates;
        url = url.replace('$templateId', template.id);
        url = url.replace('$supplierId', supplier.id);
        url = url.replace('$facilityId', facility.id);
        return this.http.get(url).pipe(map(response => response['data']));
    }

    getAllFacility(companyId) {
        let url = environment.api.profile.getAllFacility;
        url = url.replace('$1', companyId);
        return this.http.get(url).pipe(map(response => response['data']));
    }

    uploadFile(fileToUpload, fileId?) {
        const formData = new FormData();
        formData.append('file', fileToUpload);
        formData.append('type', 'CERT');
        if (fileId) {
            formData.append('evidenceId', fileId);
        }
        return this.http.post(environment.api.audits.uploadFile, formData);
    }

    getFileForZipDownload(fileId: string, filename: string): Observable<any> {
        return this.http
            .get(environment.api.audits.getFile + `?evidenceId=${fileId}&fileName=${filename}`, {
                responseType: 'blob' as 'blob'
            })
            .pipe(
                map(response => {
                    return { response, filename };
                }),
                catchError(response => of({ response: 'failed' }))
            );
    }

    getFile(fileId, fileName): Observable<any> {
        return this.http.get(environment.api.audits.getFile + `?evidenceId=${fileId}&fileName=${fileName}`, {
            responseType: 'blob' as 'blob'
        });
    }

    removeFile(fileId, fileName): Observable<any> {
        const payload = {
            evidenceId: fileId,
            fileName: fileName
        };
        return this.http.post(environment.api.audits.removeFile, payload);
    }

    getSupplierAudits(supplierId) {
        return this.http.get(environment.api.audits.getSupplierAudits.replace('$1', supplierId));
    }

    getFacilityProfileAudits(facilityId) {
        return this.http.get(environment.api.audits.getFacilityProfileAudits.replace('$1', facilityId));
    }

    updateNonConformity(auditId, nccId, ncId, value, status, updateStatus) {
        let url = environment.api.audits.updateNonConformity;
        url = url.replace('$auditId', auditId);
        url = url.replace('$nccId', nccId);
        url = url.replace('$ncId', ncId);

        const payload = {};

        if (updateStatus) {
            payload['status'] = status;
        } else {
            payload['value'] = value;
        }

        return this.http.put(url, payload);
    }

    createSubCategoryNonConformity(auditId: any, nccId: any, sccId: any, non_conformity: string, priorityId: string) {
        let url = environment.api.audits.createNonConformityInSubCategory;
        url = url.replace('$auditId', auditId);
        url = url.replace('$nccId', nccId);
        url = url.replace('$sccId', sccId);

        return this.http.post(url, { value: non_conformity, priorityId });
    }

    updateNonConformitySubItem(
        auditId: any,
        nccId: any,
        sccId: any,
        scId: any,
        newValue: any,
        status: any,
        updateStatus: boolean,
        priorityId?
    ) {
        let url = environment.api.audits.updateNonConformityInSubCategory;
        url = url.replace('$auditId', auditId);
        url = url.replace('$nccId', nccId);
        url = url.replace('$sccId', sccId);
        url = url.replace('$sncId', scId);

        const payload = {};

        if (updateStatus) {
            payload['status'] = status;
        } else {
            payload['value'] = newValue;
            payload['priorityId'] = priorityId;
        }

        return this.http.put(url, payload);
    }

    deleteNonConformitySubItem(auditId: any, nccId: any, sccId: any, sncId: any) {
        let url = environment.api.audits.deleteNonConformityInSubCategory;
        url = url.replace('$auditId', auditId);
        url = url.replace('$nccId', nccId);
        url = url.replace('$sccId', sccId);
        url = url.replace('$sncId', sncId);

        return this.http.delete(url);
    }

    getAuditHistory(auditId: any) {
        return this.http.get(environment.api.audits.getAuditHistory.replace('$auditId', auditId));
    }

    saveDraft(draftId: string, payload: ICreateAuditPayload): Observable<any> {
        let url = environment.api.audits.saveDraft;
        url = url.replace('$draftId', draftId);
        return this.http.put(url, payload);
    }

    draftToCreateAudit(draftId: string, payload: ICreateAuditPayload): Observable<any> {
        let url = environment.api.audits.draftToCreateAudit;
        url = url.replace('$draftId', draftId);
        return this.http.post(url, payload);
    }

    getNonConformityTemplate(): Observable<any> {
        return this.http.get(environment.api.audits.nonConformityTemplate);
    }
}
