import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable()
export class TTSupplierSearchService {
    constructor(private http: HttpClient) {}

    public getAllSuppliers(payload) {
        return this.http.post(environment.api.suppliers.getAllSuppliers, payload);
    }
}
