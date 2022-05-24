import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { interval, Observable, Subject } from 'rxjs';
import { concatMap, map, startWith, takeUntil } from 'rxjs/operators';

export type payloadType = {
    status: string[];
    taskType: string[];
};

export interface ILongPollingDatum {
    id: string;
    taskType: string;
    status: string;
}

export interface ILongPollingApiResponse {
    status: string;
    message: string;
    data: ILongPollingDatum[] | [];
}

@Injectable()
export class LongRunningTaskService {
    destroy = new Subject();
    constructor(private http: HttpClient) {}

    initLongRunningTask(payload: payloadType, timeDelay = 1000): Observable<boolean> {
        return interval(timeDelay).pipe(
            startWith(0),
            concatMap(() => this.handleApiRequest(payload)),
            takeUntil(this.destroy)
        );
    }

    handleApiRequest(payload: payloadType): Observable<boolean> {
        return this.http
            .post<ILongPollingApiResponse>(environment.api.common.longPolling, payload)
            .pipe(
                map((response: ILongPollingApiResponse) =>
                    this.checkTaskTypeInProgress(response.data, payload.taskType)
                )
            );
    }

    private checkTaskTypeInProgress(apiResponse: ILongPollingDatum[], taskType: string[]): boolean {
        const response = JSON.parse(JSON.stringify(apiResponse));
        const tasksInProgressCollection = response.filter(task => taskType.includes(task.taskType));
        return tasksInProgressCollection.length ? true : false;
    }
}
