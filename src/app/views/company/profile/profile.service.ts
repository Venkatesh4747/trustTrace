import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../../../core';

@Injectable()
export class ProfileService {
    constructor(private auth: AuthService, private http: HttpClient) {}

    getCompanyProfile(companyId) {
        const url = environment.api.profile.getCompanyProfile.replace('$1', companyId);
        return this.http.get(url);
    }

    updateCompanyProfile(profileData) {
        return this.http.put(environment.api.profile.updateCompanyProfile, profileData);
    }

    addFacility(facility) {
        return this.http.post(environment.api.profile.addFacility, facility);
    }

    updateFacility(facility) {
        return this.http.put(environment.api.profile.updateFacility, facility);
    }

    deleteFacility(facilityId) {
        return this.http.delete(environment.api.profile.deleteFacility.replace('$1', facilityId));
    }

    isDuplicateReferenceIds(payload) {
        return this.http.post(environment.api.profile.isDuplicateReferenceId, payload);
    }

    getStandards() {
        return this.http.get(environment.api.profile.getStandards);
    }

    public uploadCompanyLogo(file, companyId): Observable<any> {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('companyId', companyId);

        return this.http.post(environment.api.profile.uploadCompanyLogo, formData);
    }
}
