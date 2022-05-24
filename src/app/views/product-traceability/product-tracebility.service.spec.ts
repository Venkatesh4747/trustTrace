import { inject, TestBed } from '@angular/core/testing';

import { ProductTraceabilityService } from './product-traceability.service';

describe('ProductTraceabilityService', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [ProductTraceabilityService]
        });
    });

    it('should be created', inject([ProductTraceabilityService], (service: ProductTraceabilityService) => {
        expect(service).toBeTruthy();
    }));
});
