import { inject, TestBed } from '@angular/core/testing';

import { AssessmentsService } from './assessments.service';

describe('AssessmentsService', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [AssessmentsService]
        });
    });

    it('should be created', inject([AssessmentsService], (service: AssessmentsService) => {
        expect(service).toBeTruthy();
    }));
});
