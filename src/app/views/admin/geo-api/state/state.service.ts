import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../../../environments/environment';
import { HandlingHttpErrorsService } from '../../../../shared/utils/handling-http-errors.service';
import { IGeoUrl, State } from '../geoapi.models';
@Injectable({
    providedIn: 'root'
})
export class StateService {
    slectedState = new Subject<State>();
    geoURL: IGeoUrl;
    constructor(private http: HttpClient, private errorHandle: HandlingHttpErrorsService) {
        this.geoURL = environment.api.geoApi;
    }

    getStateBasedOnId(id: string): Observable<any> {
        const payload = {
            include: [
                {
                    relation: 'country',
                    scope: {
                        fields: ['id', 'name', 'countryId']
                    }
                }
            ]
        };
        const filterEnc = encodeURIComponent(JSON.stringify(payload));
        const url = `${this.geoURL.getStates}/${id}?filter=${filterEnc}`;
        return this.http.get(url).pipe(catchError(this.errorHandle.handleError));
    }
    addNewState(post: State): Observable<any> {
        return this.http
            .post(`${this.geoURL.getStates}`, post, {
                headers: new HttpHeaders({ 'content-type': 'application/json' })
            })
            .pipe(catchError(this.errorHandle.handleError));
    }
    updateState(post: State, id: string): Observable<any> {
        return this.http
            .patch(`${this.geoURL.getStates}/${id}`, JSON.stringify(post), {
                headers: new HttpHeaders({ 'content-type': 'application/json' })
            })
            .pipe(catchError(this.errorHandle.handleError));
    }
}
