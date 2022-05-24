import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import * as FileSaver from 'file-saver';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { CustomToastrService } from '../../commonServices/custom-toastr.service';
import { Observable, of, Subscription } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class CertificateManagerService {
    constructor(private http: HttpClient, private toastrService: CustomToastrService) {}

    getCertificates(type) {
        let url = environment.api.certificateManager.getCertificates;

        url = url.replace('$type', type);

        return this.http.get(url).pipe(map(response => response['data']));
    }

    uploadFile(fileToUpload, payload) {
        const p = {
            typeId: payload.Certificate_Type,
            body: payload.Certification_Body,
            expiryDate: payload.Certificate_Expiry_Date,
            entityType: payload.Entity_Type,
            category: payload.Category,
            uploadedFiles: payload.Uploaded_Files,
            entityId: payload.Entity_Id || ''
        };

        const formData = new FormData();
        formData.append('file', fileToUpload);
        formData.append('type', 'CERT');
        formData.append('inputPayload', JSON.stringify(p));

        let url = environment.api.certificateManager.upload;

        if (payload.certificateId) {
            url = url + '?certId=' + payload.certificateId;
        }

        return this.http.post(url, formData).pipe(map(response => response['data']));
    }

    deleteFile(certificateId, fileName) {
        const payload = {
            certId: certificateId,
            fileName: fileName
        };

        const url = environment.api.certificateManager.deleteFile;

        return this.http.post(url, payload).pipe(map(response => response['data']));
    }

    updateCertificate(certId, certificateData) {
        const payload = {
            typeId: certificateData.Certificate_Type,
            body: certificateData.Certification_Body,
            expiryDate: certificateData.Certificate_Expiry_Date,
            entityType: certificateData.Entity_Type
        };

        let url = environment.api.certificateManager.updateCertificate;
        url = url.replace('$certificateId', certId);

        return this.http.put(url, payload).pipe(map(response => response['data']));
    }

    upsertCertificate(certId, certificateData) {
        const payload = {
            typeId: certificateData.Certificate_Type,
            body: certificateData.Certification_Body,
            expiryDate: certificateData.Certificate_Expiry_Date,
            entityType: certificateData.Entity_Type,
            category: certificateData.Category,
            entityId: certificateData.Entity_Id,
            uploadedFiles: certificateData.Uploaded_Files
        };

        let url = environment.api.certificateManager.upsertCertificate;
        url = url.replace('$certId', certId);

        return this.http.put(url, payload).pipe(map(response => response['data']));
    }

    deleteCertificate(certId: string) {
        let url = environment.api.certificateManager.deleteCertificate;
        url = url.replace('$certificateId', certId);
        return this.http.delete(url);
    }

    discardCertificates(certIds) {
        const url = environment.api.certificateManager.discardCertificates;
        return this.http.post(url, certIds);
    }

    downloadFile(certificateId: string, fileUrl: string): Subscription {
        let url = environment.api.certificateManager.downloadFile;
        if (!fileUrl) {
            this.toastrService.info('Certificate not uploaded');
            return;
        }
        const filename = fileUrl.substring(fileUrl.lastIndexOf('/') + 1);

        url = url.replace('$certificateId', certificateId);
        url = url.replace('$filename', encodeURIComponent(filename));

        return this.http
            .get(url, {
                responseType: 'blob' as 'blob'
            })
            .subscribe(
                response => {
                    const blob = new Blob([response], { type: 'application/octet-stream' });
                    FileSaver.saveAs(blob, filename.substring(filename.indexOf('_') + 1));
                },
                failData => {
                    this.toastrService.error(`Failed to download file. Error: ${failData.error.error}`);
                }
            );
    }

    getFile(certificateId: string, fileUrl: string): Observable<any> {
        let url = environment.api.certificateManager.downloadFile;
        if (fileUrl === null || fileUrl === undefined || fileUrl === '') {
            this.toastrService.info('Certificate not uploaded');
            return;
        }
        const filename = fileUrl.substring(fileUrl.lastIndexOf('/') + 1);

        url = url.replace('$certificateId', certificateId);
        url = url.replace('$filename', encodeURIComponent(filename));

        return this.http
            .get(url, {
                responseType: 'blob' as 'blob'
            })
            .pipe(
                map(response => {
                    return { response, filename };
                }),
                catchError(response => of({ response: 'failed' }))
            );
    }
}
