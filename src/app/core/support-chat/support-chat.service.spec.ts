import { inject, TestBed } from '@angular/core/testing';

import { SupportChatService } from './support-chat.service';

describe('SupportChatService', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [SupportChatService]
        });
    });

    it('should be created', inject([SupportChatService], (service: SupportChatService) => {
        expect(service).toBeTruthy();
    }));
});
