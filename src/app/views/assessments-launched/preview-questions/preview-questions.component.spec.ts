import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PreviewQuestionsComponent } from './preview-questions.component';

describe('PreviewQuestionsComponent', () => {
    let component: PreviewQuestionsComponent;
    let fixture: ComponentFixture<PreviewQuestionsComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [PreviewQuestionsComponent]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(PreviewQuestionsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
