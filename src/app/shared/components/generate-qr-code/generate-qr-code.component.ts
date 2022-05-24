import { Component, OnInit, Input } from '@angular/core';
import { AnalyticsService } from '../../../core/analytics/analytics.service';

@Component({
    selector: 'app-generate-qr-code',
    templateUrl: './generate-qr-code.component.html',
    styleUrls: ['./generate-qr-code.component.scss']
})
export class GenerateQrCodeComponent implements OnInit {
    @Input() qrId: any;
    @Input() qrCodeId: string;

    constructor(private analyticsService: AnalyticsService) {}

    ngOnInit() {}

    getFormattedText(data) {
        if (typeof data === 'object') {
            return JSON.stringify(data);
        }
        return data;
    }

    printQRCode() {
        let printContents, popupWin;
        printContents = document.getElementById(this.qrCodeId).innerHTML;
        popupWin = window.open('', '_blank', 'top=0,left=0,height=100%,width=auto');
        popupWin.document.open();
        popupWin.document.write(`
        <html>
            <head>
            <title>QR Code</title>
            </head>
        <body onload="window.print();window.close()">${printContents}</body>
        </html>`);
        popupWin.document.close();

        this.analyticsService.trackPageVisit(
            'Print QR PopUp',
            `Print page for ${this.qrId} has been generated and opened in popup window`
        );
    }

    // render using window.print()
    printDirect() {
        window.print();
    }
}
