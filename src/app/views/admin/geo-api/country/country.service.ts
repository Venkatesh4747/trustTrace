import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Country, IGeoUrl, IGeoPayload } from '../geoapi.models';
import { environment } from '../../../../../environments/environment';
import { HandlingHttpErrorsService } from '../../../../shared/utils/handling-http-errors.service';
@Injectable({
    providedIn: 'root'
})
export class CountryService {
    geoURL: IGeoUrl;
    constructor(private http: HttpClient, private errorHandleService: HandlingHttpErrorsService) {
        this.geoURL = environment.api.geoApi;
    }

    getCountries(): Observable<any> {
        const payload: IGeoPayload = {
            fields: {
                id: true,
                name: true,
                iso2: true,
                countryId: true
            }
        };
        const filterEnc = encodeURIComponent(JSON.stringify(payload));
        const url = `${this.geoURL.getCountries}?filter=${filterEnc}`;
        return this.http.get(url).pipe(catchError(this.errorHandleService.handleError));
    }

    getStatesBasedOnCountryId(id: string): Observable<any> {
        const payload: IGeoPayload = {
            fields: {
                id: true,
                name: true,
                stateId: true,
                stateCode: true
            }
        };
        const filterEnc = encodeURIComponent(JSON.stringify(payload));
        const url = `${this.geoURL.getStatesBasedOnCountryId(id)}?filter=${filterEnc}`;
        return this.http.get(url).pipe(catchError(this.errorHandleService.handleError));
    }

    getCountryBasedOnId(id: number) {
        const payload: IGeoPayload = {};
        const filterEnc = encodeURIComponent(JSON.stringify(payload));
        const url = `${this.geoURL.getCountries}/${id}`.concat('?filter=', filterEnc);
        return this.http.get(url).pipe(catchError(this.errorHandleService.handleError));
    }
    addACountry(post: Country): Observable<any> {
        return this.http
            .post(`${this.geoURL.getCountries}`, post, {
                headers: new HttpHeaders({ 'content-type': 'application/json' })
            })
            .pipe(catchError(this.errorHandleService.handleError));
    }
    updateCountry(post: Country, id: string): Observable<any> {
        return this.http
            .patch(`${this.geoURL.getCountries}/${id}`, JSON.stringify(post), {
                headers: new HttpHeaders({ 'content-type': 'application/json' })
            })
            .pipe(catchError(this.errorHandleService.handleError));
    }

    getRegions(): Observable<any> {
        const payload: IGeoPayload = {};
        const filterEnc = encodeURIComponent(JSON.stringify(payload));
        return this.http
            .get(`${this.geoURL.getRegions}?filter=${filterEnc}`)
            .pipe(catchError(this.errorHandleService.handleError));
    }

    getSubRegions(): Observable<any> {
        const payload: IGeoPayload = {};
        const filterEnc = encodeURIComponent(JSON.stringify(payload));
        return this.http
            .get(`${this.geoURL.getSubRegions}?filter=${filterEnc}`)
            .pipe(catchError(this.errorHandleService.handleError));
    }
}
