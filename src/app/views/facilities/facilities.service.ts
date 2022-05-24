import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { IImportApiResponse } from '../../shared/models/import.model';
import { environment } from '../../../environments/environment';
import { Payload } from '../suppliers/sub-supplier-details/sub-supplier-profile.model';
import { IFacilityListResponse, IFacilityProfileFilter, IFacilityProfileResponse } from './facilities.model';

@Injectable()
export class FacilitiesService {
    private subject = new Subject<string[]>();

    constructor(private http: HttpClient) {}

    getFacilityRating(country) {
        const url = `https://napi.trustrace.com/facility-rating?country=${country}`;
        return this.http.get(url);
    }

    // clear facilities
    clearFacilities() {
        this.subject.next([]);
    }
    getFacilities(): Observable<any> {
        return this.subject.asObservable();
    }
    // public getAllFacilities(inputPayload): Observable<any> {
    //     return this.http.post(environment.api.suppliers.getAllFacilities, inputPayload);
    // }

    public getFacility(facilityId): Observable<any> {
        let url = environment.api.facilities.getFacility;
        url = url.replace('$1', facilityId);
        return this.http.get(url);
    }

    public getSubSupplierFacility(facilityId: string, companyId: string): Observable<IFacilityProfileResponse> {
        let url = environment.api.facilities.getSubSupplierFacility;
        url = url.replace('$facilityId/$companyId', facilityId + '/' + companyId);
        return this.http.get(url).pipe(map(response => response['data']));
    }

    public saveFacilityProfile(saveFacilityProfile): Observable<any> {
        const url = environment.api.facilities.saveFacilityProfile;
        return this.http.post(url, saveFacilityProfile);
    }
    public getAllFacilities(payload): Observable<any> {
        return this.http.post(environment.api.facilities.getAllFacilities, payload);
    }
    public getFacilityFilters(payload): Observable<any> {
        return this.http.post(environment.api.facilities.getFacilityFilters, payload);
    }
    public getSubSupplierFacilityFilters(payload: Payload): Observable<IFacilityProfileFilter> {
        return this.http
            .post(environment.api.facilities.getSubSupplierFacilityFilters, payload)
            .pipe(map(response => response['data']));
    }
    public getSubSupplierSFacilities(payload: Payload): Observable<IFacilityListResponse> {
        return this.http
            .post(environment.api.facilities.getSubSupplierFacilities, payload)
            .pipe(map(response => response['data']));
    }

    public downloadData(): Observable<Blob> {
        const url = environment.api.facilities.downloadFacilityTemplate;
        return this.http.get(url, { responseType: 'blob' as 'blob' });
    }

    public uploadData(payload: File): Observable<IImportApiResponse> {
        const formData = new FormData();
        formData.append('file', payload);
        return this.http.post<any>(environment.api.facilities.importFacilities, formData);
    }
}
