import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { map } from 'rxjs/operators';

@Injectable()
export class ImageUploadService {
    constructor(private httpClient: HttpClient, private domSanitizer: DomSanitizer) {}

    public uploadProductImage(file): Observable<any> {
        const formData = new FormData();
        formData.append('file', file);
        // Update it with API Call
        // return this.http.post(environment.api.profile.uploadCompanyLogo, formData);
        return <any>true;
    }

    /**
     * please clean these service end point and group somewhere: environment.api.audits is being called.
     * But it is more of a common feature now
     */
    removeFile(fileId, fileName): Observable<any> {
        const payload = {
            evidenceId: fileId,
            fileName: fileName
        };
        return this.httpClient.post(environment.api.audits.removeFile, payload);
    }

    uploadFile(fileToUpload, fileId?) {
        const formData = new FormData();
        formData.append('file', fileToUpload);
        formData.append('type', 'STYLE_IMG');
        if (fileId) {
            formData.append('evidenceId', fileId);
        }
        return this.httpClient.post(environment.api.audits.uploadFile, formData);
    }

    getFile(fileId, fileName): Observable<any> {
        const url = environment.api.audits.getFile + `?evidenceId=${fileId}&fileName=${fileName}`;
        return this.httpClient.get(url, { responseType: 'blob' as 'blob' });
    }

    getImageUrl(id: String, fileName: String) {
        const url = environment.api.audits.getFile + `?evidenceId=${id}&fileName=${fileName}`;
        // will move thi to service later
        return this.httpClient
            .get(url, { responseType: 'blob' as 'blob' })
            .pipe(map(e => this.domSanitizer.bypassSecurityTrustUrl(URL.createObjectURL(e))));
    }
}
