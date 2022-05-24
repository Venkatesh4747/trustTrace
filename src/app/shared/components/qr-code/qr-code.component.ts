import { Component, ElementRef, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { Subject } from 'rxjs';
import { QrCodeService } from './qr-code.service';
import { debounceTime } from 'rxjs/operators';
import { CustomToastrService } from '../../commonServices/custom-toastr.service';

@Component({
    selector: 'app-qr-code',
    templateUrl: './qr-code.component.html',
    styleUrls: ['./qr-code.component.scss']
})
export class QrCodeComponent implements OnInit {
    private subject: Subject<string> = new Subject();
    qrCode: string;
    scanning: boolean;
    fetchingData: boolean;

    @ViewChild('QRCodeInput', { static: true }) QRCodeInput: ElementRef;
    @Output() response = new EventEmitter();

    constructor(private qrCodeService: QrCodeService, private toastr: CustomToastrService) {}

    ngOnInit() {
        this.subject.pipe(debounceTime(300)).subscribe(qrCode => {
            this.scanning = false;
            this.fetchingData = true;
            if (!qrCode) {
                return;
            }
            this.qrCodeService.fetchQRDetails(qrCode).subscribe(
                response => {
                    this.fetchingData = false;
                    this.QRCodeInput.nativeElement.blur();
                    response.qrCode = qrCode;
                    this.response.emit(response);
                },
                () => {
                    this.fetchingData = false;
                    this.toastr.error('Invalid external ID', 'Could not fetch data');
                }
            );
        });
    }

    fetchQRCodeDetails() {
        this.subject.next(this.qrCode);
    }

    scanQRCode() {
        this.qrCode = null;
        this.QRCodeInput.nativeElement.focus();
    }

    onFocus() {
        this.scanning = true;
    }

    onBlur() {
        this.scanning = false;
    }
}
