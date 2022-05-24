import { inject, TestBed } from '@angular/core/testing';

import { MaterialLibraryService } from './material-library.service';

describe('MaterialLibraryService', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [MaterialLibraryService]
        });
    });

    it('should be created', inject([MaterialLibraryService], (service: MaterialLibraryService) => {
        expect(service).toBeTruthy();
    }));
});
