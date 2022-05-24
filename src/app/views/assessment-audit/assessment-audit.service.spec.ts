import { inject, TestBed } from '@angular/core/testing';

import { AssessmentAuditService } from './assessment-audit.service';

describe('AssessmentAuditService', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [AssessmentAuditService]
        });
    });

    it('should be created', inject([AssessmentAuditService], (service: AssessmentAuditService) => {
        expect(service).toBeTruthy();
    }));
});
