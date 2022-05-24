import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable()
export class ProfileService {
    constructor(private http: HttpClient) {}

    saveConsent() {
        return this.http.post(environment.api.user.consentUpdate, null);
    }
    updateLanguage(language) {
        return this.http.post(environment.api.user.languageUpdate.replace('$language', language), null);
    }
    getSupportedLanguages() {
        return this.http.get(environment.api.translate.getSupportedLanguage);
    }
    updateUserProfile(userFormPayload) {
        return this.http.patch(environment.api.user.userProfileUpdate, userFormPayload);
    }

    updatePassword(currentPW, newPW) {
        return this.http.patch(
            environment.api.user.userPasswordUpdate,
            {
                currentPW,
                newPW
            },
            { observe: 'response', withCredentials: true }
        );
    }
    validateCurrentPW(currentPW) {
        return this.http.post(environment.api.user.userPasswordValidate, {
            currentPW
        });
    }

    emailTimeFrameUpdate(emailNotificationType: string): Observable<any> {
        let url = environment.api.user.emailTimeFrameUpdate;
        url = url.replace('$emailTimeFrame', emailNotificationType);
        return this.http.put(url, null);
    }

    getEmailPreference(): Observable<any> {
        return this.http.get(environment.api.user.getEmailPreference);
    }
}
