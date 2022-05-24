import { inject, TestBed } from '@angular/core/testing';

import { FacilitiesService } from './facilities.service';

describe('FacilitiesService', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [FacilitiesService]
        });
    });

    it('should be created', inject([FacilitiesService], (service: FacilitiesService) => {
        expect(service).toBeTruthy();
    }));
});
