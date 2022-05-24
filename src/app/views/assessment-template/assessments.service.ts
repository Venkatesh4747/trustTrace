import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable()
export class AssessmentsService {
    public answered = { answered: [] };

    constructor(private http: HttpClient) {}

    public getAll(assessmentLaunchType, sortField): Observable<any> {
        const url = environment.api.assessment.getAll + '?launched=' + assessmentLaunchType + '&sortField=' + sortField;
        return this.http.get(url);
    }

    public getSuppliersFacilities(): Observable<any> {
        return this.http.get(environment.api.assessment.getSuppliersAndFacilities);
    }

    public launchAssessment(payload): Observable<any> {
        return this.http.post(environment.api.assessment.launchAssessment, payload);
    }

    public getSurveyQuestions(assessment_id: string): Observable<any> {
        return this.http.get(environment.api.assessment.getSurveyQuestions + '/' + assessment_id + '?action=opened');
    }

    public uploadEvidence(
        file,
        questionId,
        assessmentId,
        evidenceTemplateId,
        subQuestion,
        evidenceId
    ): Observable<any> {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('assessmentId', assessmentId);
        formData.append('questionId', questionId);
        formData.append('subQuestion', subQuestion);
        formData.append('evidenceTemplateId', evidenceTemplateId);
        if (evidenceId) {
            formData.append('evidenceId', evidenceId);
        }

        return this.http.post(environment.api.assessment.evidenceFileUpload, formData);
    }

    public saveResponse(facilityId, assessmentId, questionId, value): Observable<any> {
        const payload = {
            facilityId: facilityId,
            assessmentId: assessmentId,
            questionId: questionId,
            value: value
        };
        return this.http.post(environment.api.assessment.saveResponse, payload);
    }

    public fetchPreview(assessment_id: string): Observable<any> {
        return this.http.get(environment.api.assessment.getPreview + '/' + assessment_id);
    }

    public getSurveyStatus(assessment_id): Observable<any> {
        return this.http.get(environment.api.assessment.getSurveyStatus + '/' + assessment_id);
    }

    public getFile(evidenceId, fileName): Observable<any> {
        const url = environment.api.assessment.getEvidence + `?evidenceId=${evidenceId}&fileName=${fileName}`;
        return this.http.get(url, { responseType: 'blob' as 'blob' });
    }

    public downloadFile(evidenceId, fileName): Observable<any> {
        return this.http.get(environment.api.assessment.downloadEvidence + `/${fileName}`);
    }

    public removeFile(evidenceId, fileName): Observable<any> {
        const payload = {
            evidenceId: evidenceId,
            fileName: fileName
        };
        return this.http.post(environment.api.assessment.removeAssociation, payload);
    }

    public remindAssessment(assessmentId: string): Observable<any> {
        const payload = {
            id: assessmentId
        };
        return this.http.post(environment.api.assessment.remindAssessment, payload);
    }

    public submitAssessment(assessmentId: string): Observable<any> {
        const payload = {
            id: assessmentId
        };
        return this.http.post(environment.api.assessment.submitAssessment, payload);
    }
}
