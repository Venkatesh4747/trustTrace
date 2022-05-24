import { TestBed } from '@angular/core/testing';

import { CertificateManagerService } from './certificate-manager.service';

describe('CertificateManagerService', () => {
    beforeEach(() => TestBed.configureTestingModule({}));

    it('should be created', () => {
        const service: CertificateManagerService = TestBed.inject(CertificateManagerService);
        expect(service).toBeTruthy();
    });
});
