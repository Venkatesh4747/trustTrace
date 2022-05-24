import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { map } from 'rxjs/operators';
import { ICompanyData, ISearchPayload, ISelectedCompany, ISelectedFacility } from './maps.model';

@Injectable()
export class MapsService {
    constructor(private http: HttpClient) {}

    getAllFacilities(payload: ISearchPayload): Observable<ICompanyData> {
        return this.http
            .post(environment.api.dashboard.getAllFacilities, payload)
            .pipe(map(response => response['data']));
    }

    getSelectedFacilityDetailsById(facilityId: string): Observable<ISelectedFacility> {
        return this.http
            .get(environment.api.dashboard.getFacilityview.replace('$facilityId', facilityId))
            .pipe(map(response => response['data']));
    }

    getMapFilters(payload: ISearchPayload): Observable<unknown> {
        const url = environment.api.dashboard.getMapFilter;
        return this.http.post(url, payload);
    }

    getSelectedCompanyDetailsById(companyId: string): Observable<ISelectedCompany> {
        return this.http
            .get(environment.api.dashboard.getSupplierView.replace('$supplierId', companyId))
            .pipe(map(response => response['data']));
    }

    getSupplierFacilities(id: string) {
        return this.http.get(environment.api.dashboard.getSupplierFacility.replace('$supplierId', id));
    }

    getAllTR(): Observable<any> {
        return this.http.get(environment.api.maps.getAllTR);
    }

    getAllStyles(): Observable<any> {
        return this.http.get(environment.api.maps.getAllStyles);
    }

    getSupplierLink(): Observable<any> {
        return this.http.get(environment.api.company.getSupplierLink).pipe(map(response => response['data']));
    }
}
