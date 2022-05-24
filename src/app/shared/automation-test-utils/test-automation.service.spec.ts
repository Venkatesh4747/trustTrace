import { TestBed } from '@angular/core/testing';

import { TestAutomationService } from './test-automation.service';

describe('TestAutomationService', () => {
    beforeEach(() => TestBed.configureTestingModule({}));

    it('should be created', () => {
        const service: TestAutomationService = TestBed.inject(TestAutomationService);
        expect(service).toBeTruthy();
    });
});
