import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { City, IGeoUrl, IGeoPayload } from '../geoapi.models';
import { environment } from '../../../../../environments/environment';
import { HandlingHttpErrorsService } from '../../../../shared/utils/handling-http-errors.service';
@Injectable({
    providedIn: 'root'
})
export class CityService {
    geoURL: IGeoUrl;
    constructor(private http: HttpClient, private errorHandleService: HandlingHttpErrorsService) {
        this.geoURL = environment.api.geoApi;
    }

    getCityBasedOnId(id: string): Observable<any> {
        const payload: IGeoPayload = {
            include: [
                {
                    relation: 'country',
                    scope: {
                        fields: ['id', 'name']
                    }
                },
                {
                    relation: 'state',
                    scope: {
                        fields: ['id', 'name']
                    }
                }
            ]
        };
        const filterEnc = encodeURIComponent(JSON.stringify(payload));
        const url = `${this.geoURL.getCities}/${id}?filter=${filterEnc}`;
        return this.http.get(url).pipe(catchError(this.errorHandleService.handleError));
    }

    updateCity(post: City, id: string): Observable<any> {
        return this.http
            .patch(`${this.geoURL.getCities}/${id}`, JSON.stringify(post), {
                headers: new HttpHeaders({ 'content-type': 'application/json' })
            })
            .pipe(catchError(this.errorHandleService.handleError));
    }

    addNewCity(post: City): Observable<any> {
        return this.http
            .post(`${this.geoURL.getCities}`, post, {
                headers: new HttpHeaders({ 'content-type': 'application/json' })
            })
            .pipe(catchError(this.errorHandleService.handleError));
    }
}
