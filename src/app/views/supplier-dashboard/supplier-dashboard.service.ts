import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class SupplierDashboardService {
    constructor(private http: HttpClient) {}

    getPendingTasks() {
        const payload = {
            filter: {},
            sort: { sortBy: 'sent_date', sortOrder: 'desc' },
            pagination: { from: 0, size: 100 }
        };
        return this.http
            .post(environment.api.supplier_dashboard.pending_tasks, payload)
            .pipe(map(response => response['data']));
    }

    getTaskDetail(taskId: string) {
        let url = environment.api.supplier_dashboard.getTaskDetails.replace('$taskId', taskId);
        return this.http.get(url).pipe(map(response => response['data']));
    }

    submitScopeCertificate(payload: any) {
        return this.http.put(environment.api.supplier_dashboard.submitScopeCertificate, payload);
    }

    getTasks(payload) {
        return this.http
            .post(environment.api.supplier_dashboard.pending_tasks, payload)
            .pipe(map(response => response['data']));
    }

    //Logic to elimimate data older than 90 days for TEMS and Assessments
    lockFilter(pendingTasks: any): any {
        return pendingTasks.filter(pendingTask => {
            if (
                pendingTask.task_type.id === 'T_TRACE' ||
                !pendingTask.sent_date ||
                this.ageOfPendingTask(pendingTask) <= 90
            ) {
                return pendingTask;
            }
        });
    }
    ageOfPendingTask(pendingTask: any): any {
        const pendingTaskSentDateInMilliseconds = new Date(pendingTask.sent_date).getTime();
        const todaysDateInMilliseconds = new Date().getTime();
        const ageInMilliseconds = todaysDateInMilliseconds - pendingTaskSentDateInMilliseconds;
        return Math.ceil(ageInMilliseconds / (1000 * 60 * 60 * 24));
    }
}
