import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { HandlingHttpErrorsService } from '../../../shared/utils/handling-http-errors.service';
import { IGeoPayload, IGeoUrl, ImportTrigger } from './geoapi.models';
@Injectable()
export class GeoService {
    geoURL: IGeoUrl;
    constructor(private http: HttpClient, private errorHandleService: HandlingHttpErrorsService) {
        this.geoURL = environment.api.geoApi;
    }
    public pageLoading = new Subject<boolean>();
    public refeshDatas = new Subject<any>();
    getCities(): Observable<any> {
        const payload: IGeoPayload = {
            limit: 1000,
            include: [
                {
                    relation: 'country',
                    scope: {
                        fields: ['id', 'name', 'emoji']
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

        return this.http
            .get(`${this.geoURL.getCities}?filter=${filterEnc}`)
            .pipe(catchError(this.errorHandleService.handleError));
    }
    getSearchCities(searchCity: string): Observable<any> {
        const payload: IGeoPayload = {
            include: [
                {
                    relation: 'country',
                    scope: {
                        fields: ['id', 'name', 'emoji']
                    }
                },
                {
                    relation: 'state',
                    scope: {
                        fields: ['id', 'name']
                    }
                }
            ],
            where: {
                name: { like: searchCity, options: 'i' }
            }
        };

        const filterEnc = encodeURIComponent(JSON.stringify(payload));
        const url = `${this.geoURL.getCities}?filter=${filterEnc}`;
        return this.http.get(url).pipe(catchError(this.errorHandleService.handleError));
    }

    getCitiesBasedOnCountry(searchStr: string): Observable<any> {
        const payload: IGeoPayload = {
            where: {
                name: { like: `${searchStr}`, options: 'i' }
            },
            fields: {
                id: true,
                countryId: true,
                name: true,
                emoji: true
            },
            include: [
                {
                    relation: 'states',
                    scope: {
                        fields: {
                            id: true,
                            name: true
                        }
                    }
                }
            ]
        };

        const filterEnc = encodeURIComponent(JSON.stringify(payload));
        const url = `${this.geoURL.getCitiesBasedOnCountry}?filter=${filterEnc}`;
        return this.http.get(url).pipe(catchError(this.errorHandleService.handleError));
    }
    getCitiesBasedOnState(searchStr: string): Observable<any> {
        const payload: IGeoPayload = {
            where: {
                name: { like: `${searchStr}`, options: 'i' }
            },
            include: [
                {
                    relation: 'country',
                    scope: {
                        fields: {
                            id: true,
                            name: true,
                            emoji: true
                        }
                    }
                }
            ]
        };

        const filterEnc = encodeURIComponent(JSON.stringify(payload));
        const url = `${this.geoURL.getCitiesBasedOnState}?filter=${filterEnc}`;
        return this.http.get(url).pipe(catchError(this.errorHandleService.handleError));
    }

    handleImport(post: ImportTrigger) {
        return this.http.post(`${this.geoURL.onImport}`, post).pipe(catchError(this.errorHandleService.handleError));
    }

    getImportDetail(): Observable<any> {
        const payload: IGeoPayload = {
            where: {
                status: 'pending'
            }
        };
        const filterEnc = encodeURIComponent(JSON.stringify(payload));
        const url = `${this.geoURL.getImportDetails}?filter=${filterEnc}`;
        return this.http.get(url).pipe(catchError(this.errorHandleService.handleError));
    }
}
