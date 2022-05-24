import { TestBed } from '@angular/core/testing';

import { SupplierDashboardService } from './supplier-dashboard.service';

describe('SupplierDashboardService', () => {
    beforeEach(() => TestBed.configureTestingModule({}));

    it('should be created', () => {
        const service: SupplierDashboardService = TestBed.inject(SupplierDashboardService);
        expect(service).toBeTruthy();
    });
});
