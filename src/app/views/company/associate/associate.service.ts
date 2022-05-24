import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';

@Injectable()
export class AssociateService {
    constructor(private http: HttpClient) {}

    associate(payload) {
        return this.http.post(environment.api.company.existingEmployerAssociation, payload);
    }
}
