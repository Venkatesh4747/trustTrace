import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable()
export class AddCertificationsService {
    constructor(private http: HttpClient) {}

    getAllCertifications(trId) {
        let url = environment.api.traceability.getAllCertifications;
        url = url.replace('$trId', trId);
        return this.http.get(url);
    }

    uploadCertifications(selectedCertificateType, fileToUpload, trId) {
        const payload = new FormData();
        payload.append('certificationType', selectedCertificateType);
        payload.append('file', fileToUpload);
        payload.append('trId', trId);
        return this.http.post(environment.api.traceability.uploadCertifications, payload);
    }

    getFile(attachmentId, fileName): Observable<any> {
        return this.http.get(
            environment.api.assessment.getEvidence + `?evidenceId=${attachmentId}&fileName=${fileName}`,
            {
                responseType: 'blob' as 'blob'
            }
        );
    }

    removeFile(attachmentId, fileName, trId): Observable<any> {
        const body = JSON.stringify({
            trId: trId,
            attachmentId: attachmentId,
            fileName: fileName
        });
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            }),
            body: body
        };

        return this.http.delete(environment.api.traceability.uploadCertifications, httpOptions);
    }
}
