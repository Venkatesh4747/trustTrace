import { inject, TestBed } from '@angular/core/testing';

import { AddCertificationsService } from './add-certifications.service';

describe('AddCertificationsService', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [AddCertificationsService]
        });
    });

    it('should be created', inject([AddCertificationsService], (service: AddCertificationsService) => {
        expect(service).toBeTruthy();
    }));
});
