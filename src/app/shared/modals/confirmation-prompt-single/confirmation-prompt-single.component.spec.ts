import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmationPromptSingleComponent } from './confirmation-prompt-single.component';

describe('ConfirmationPromptSingleComponent', () => {
    let component: ConfirmationPromptSingleComponent;
    let fixture: ComponentFixture<ConfirmationPromptSingleComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [ConfirmationPromptSingleComponent]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ConfirmationPromptSingleComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
