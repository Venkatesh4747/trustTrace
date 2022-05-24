import { inject, TestBed } from '@angular/core/testing';

import { AssessmentTemplateService } from './assessment-template.service';

describe('AssessmentTemplateService', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [AssessmentTemplateService]
        });
    });

    it('should be created', inject([AssessmentTemplateService], (service: AssessmentTemplateService) => {
        expect(service).toBeTruthy();
    }));
});
