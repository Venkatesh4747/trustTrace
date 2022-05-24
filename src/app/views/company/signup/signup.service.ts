import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs';
import { ISignUpConfig, ISignUpPayload } from './signup.model';

@Injectable()
export class SignupService {
    constructor(private http: HttpClient) {}

    signup(payload: ISignUpPayload) {
        if (payload.mode === 'brandUserSignUp') {
            return this.http.post(environment.api.company.newCompanyUserSignUp, payload);
        } else {
            return this.http.post(environment.api.company.newSupplierSignUp, payload);
        }
    }

    getSupplierSignUpConfig(signupCode: string): Observable<ISignUpConfig> {
        let url = environment.api.company.supplierSignupConfig.replace('$signupCode', signupCode);
        return this.http.get<ISignUpConfig>(url);
    }
}
