import { TestBed } from '@angular/core/testing';

import { MultiIndustryService } from './multi-industry.service';

describe('MultiIndustryService', () => {
    beforeEach(() => TestBed.configureTestingModule({}));

    it('should be created', () => {
        const service: MultiIndustryService = TestBed.inject(MultiIndustryService);
        expect(service).toBeTruthy();
    });
});
