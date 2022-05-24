import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SubmitErrorPopupComponent } from './submit-error-popup.component';

describe('SubmitErrorPopupComponent', () => {
    let component: SubmitErrorPopupComponent;
    let fixture: ComponentFixture<SubmitErrorPopupComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [SubmitErrorPopupComponent]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(SubmitErrorPopupComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
