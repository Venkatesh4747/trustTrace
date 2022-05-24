import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class TaskManagerService {
    constructor(private http: HttpClient) {}

    public getTasks(payload: any) {
        const url = environment.api.taskManager.getTasks;
        return this.http.post(url, payload).pipe(map(response => response['data']));
    }

    public getTaskHistory(payload: any) {
        const url = environment.api.taskManager.getTaskHistory;
        return this.http.post(url, payload).pipe(map(response => response['data']));
    }

    public getTasksFilter(payload: any) {
        return this.http.post(environment.api.taskManager.tasksFilter, payload);
    }

    public getTaskDetail(taskId: string) {
        const url = environment.api.taskManager.getTaskDetail.replace('$taskId', taskId);
        return this.http.get(url).pipe(map(response => response['data']));
    }

    public getEntityForWaitingApprovalTransaction(taskId: string) {
        const url = environment.api.taskManager.getEntityForWaitingApprovalTransaction.replace('$taskId', taskId);
        return this.http.get(url).pipe(map(response => response['data']));
    }

    public getTaskViewDetail(payload: any) {
        const url = environment.api.taskManager.getTaskDetailView;
        return this.http.post(url, payload).pipe(map(response => response['data']));
    }

    public updateTaskStatus(payload: any) {
        const url = environment.api.taskManager.updateTaskStatus;
        return this.http.put(url, payload).pipe(map(response => response['data']));
    }

    public updateWaitingForApprovalTaskStatus(payload: any) {
        const url = environment.api.taskManager.updateWaitingForApprovalTaskStatus;
        return this.http.put(url, payload).pipe(map(response => response['data']));
    }

    public uploadFile(file, type) {
        const payload = {
            entityType: 'TT_TRANSACTION',
            category: 'PRODUCT',
            uploadedFiles: []
        };

        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', type);
        formData.append('inputPayload', JSON.stringify(payload));
        return this.http.post(environment.api.evidences.uploadFile, formData);
    }

    public extractUploadedEvidence(payload: any) {
        const url = environment.api.evidences.extractUploadedEvidence;
        return this.http.post(url, payload).pipe(map(response => response['data']));
    }

    public submitEvidence(payload: any) {
        const url = environment.api.evidences.submitEvidence;
        return this.http.post(url, payload);
    }

    public getSellersBuyersAndConsignees() {
        const url = environment.api.evidences.getSellersBuyersAndConsignees;
        return this.http.get(url).pipe(map(response => response['data']));
    }

    public submitSCReview(payload: any) {
        return this.http.put(environment.api.evidences.submitSCReview, payload);
    }

    public getWaitingApprovalTransactionDetail(transactionId: string) {
        let url = environment.api.transactions.getWaitingApprovalTransactionDetail;
        url = url.replace('$transactionId', transactionId);
        return this.http.get(url).pipe(map(response => response['data']));
    }
}
