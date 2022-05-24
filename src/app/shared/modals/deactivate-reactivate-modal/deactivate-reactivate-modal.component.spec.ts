import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DeactivateReactivateModalComponent } from './deactivate-reactivate-modal.component';

describe('DeactivateReactivateModalComponent', () => {
    let component: DeactivateReactivateModalComponent;
    let fixture: ComponentFixture<DeactivateReactivateModalComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [DeactivateReactivateModalComponent]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(DeactivateReactivateModalComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
