import { TestBed } from '@angular/core/testing';

import { QrCodeService } from './qr-code.service';

describe('QrCodeService', () => {
    beforeEach(() => TestBed.configureTestingModule({}));

    it('should be created', () => {
        const service: QrCodeService = TestBed.inject(QrCodeService);
        expect(service).toBeTruthy();
    });
});
