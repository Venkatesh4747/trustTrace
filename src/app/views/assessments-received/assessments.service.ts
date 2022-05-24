import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { ISearchPayload } from '../assessments/assessments.model';

@Injectable()
export class AssessmentsService {
    public answered = { answered: [] };

    constructor(private http: HttpClient) {}

    public getAll(payload: ISearchPayload): Observable<any> {
        const url = environment.api.assessment.getAll;
        return this.http.post(url, payload);
    }

    public getAssessmentReceivedFilter(payload: ISearchPayload): Observable<any> {
        const url = environment.api.assessment.getAssessmentReceivedFilter;
        return this.http.post(url, payload);
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

    public getUnansweredMandatoryQuestionIds(assessment_id: string): Observable<any> {
        const url = environment.api.assessment.getUnansweredMandatoryQuestionIds.replace(
            '$assessmentId',
            assessment_id
        );
        return this.http.get(url).pipe(map(response => response['data']['data']));
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
        return this.http.get(
            environment.api.assessment.getEvidence + `?evidenceId=${evidenceId}&fileName=${fileName}`,
            {
                responseType: 'blob' as 'blob'
            }
        );
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

    public getSubAssessments(assessmentId, assessmentType) {
        let url = environment.api.assessment.getSubAssessments.replace('$1', assessmentId);
        url = url.replace('$2', assessmentType);
        return this.http.get(url);
    }
}
