import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

@Injectable()
export class AssessmentTemplateService {
    constructor(private http: HttpClient) {}

    public getAll(): Observable<any> {
        return this.http.get(environment.api.questionnaire.getAll + '?sortField=createTs');
    }

    public createQuestionnaire(payload): Observable<any> {
        return this.http.post(environment.api.questionnaire.save, payload);
    }

    public deleteQuestionnaire(questionnaireId): Observable<any> {
        return this.http.post(environment.api.questionnaire.delete + '/' + questionnaireId, {});
    }

    public getQuestions(payload): Observable<any> {
        const url = environment.api.questionnaire.getQuestions;
        return this.http.post(url, payload);
    }

    public getQuestionCount(payload): Observable<any> {
        return this.http.post(environment.api.questionnaire.questionCount, payload);
    }

    public getByMaterial(materials): Observable<any> {
        const url = environment.api.questionnaire.getByMaterial.replace('$1', materials.join(','));
        return this.http.get(url);
    }

    public getValueProcess(materials): Observable<any> {
        const url = environment.api.questionnaire.getValueProcess.replace('$1', materials.join(','));
        return this.http.get(url);
    }

    public getSubGroup(materials, valueProcesses): Observable<any> {
        let url = environment.api.questionnaire.getSubGroup.replace('$1', materials.join(','));
        url = url.replace('$2', valueProcesses.join(','));
        return this.http.get(url);
    }

    public getTemplateQuestions(template_id: string): Observable<any> {
        const url = environment.api.questionnaire.getQuestionsByTemplateId.replace('$1', template_id);
        return this.http.get(url);
    }

    public getQuestionnaire(id: string): Observable<any> {
        const url = environment.api.questionnaire.get.replace('$questionnaireId', id);
        return this.http.get(url).pipe(map(response => response['data'].questionnaire));
    }
}
