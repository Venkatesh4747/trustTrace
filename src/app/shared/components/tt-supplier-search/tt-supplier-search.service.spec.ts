import { inject, TestBed } from '@angular/core/testing';

import { TTSupplierSearchService } from './tt-supplier-search.service';

describe('TTSupplierSearchService', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [TTSupplierSearchService]
        });
    });

    it('should be created', inject([TTSupplierSearchService], (service: TTSupplierSearchService) => {
        expect(service).toBeTruthy();
    }));
});
