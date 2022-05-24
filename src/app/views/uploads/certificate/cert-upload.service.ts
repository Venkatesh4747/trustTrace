import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { CertificateTypeValue } from '../interface/certificate-type-value-model';

@Injectable()
export class CertificateUploadService {
    private subject = new Subject<CertificateTypeValue[]>();
    setCertificates(certificateList: CertificateTypeValue[]) {
        this.subject.next(certificateList);
    }
    clearCertificates() {
        this.subject.next([]);
    }
    getCertificates(): Observable<any> {
        return this.subject.asObservable();
    }
}
