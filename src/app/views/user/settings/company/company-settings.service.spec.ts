import { inject, TestBed } from '@angular/core/testing';

import { CompanySettingsService } from './company-settings.service';

describe('CompanySettingsService', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [CompanySettingsService]
        });
    });

    it('should be created', inject([CompanySettingsService], (service: CompanySettingsService) => {
        expect(service).toBeTruthy();
    }));
});
