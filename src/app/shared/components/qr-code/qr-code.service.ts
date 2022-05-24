import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class QrCodeService {
    constructor(private http: HttpClient) {}

    public fetchQRDetails(qrCode) {
        return this.http
            .get(environment.api.qr.fetchQRDetails.replace('$qrCode', qrCode))
            .pipe(map(response => response['data']));
    }
}
