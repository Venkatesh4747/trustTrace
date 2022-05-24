import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { environment } from '../../../environments/environment';
import { IReleaseUpdate } from './release-update/release-update.model';

@Injectable()
export class NotificationService {
    constructor(private http: HttpClient) {}

    getLatestReleaseUpdate(): Observable<IReleaseUpdate> {
        return this.http.get(environment.api.notification.latestReleaseUpdate).pipe(map(update => update['data']));
    }
}
