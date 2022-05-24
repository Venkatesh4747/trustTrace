import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmationModuleComponent } from './confirmation-module.component';

describe('ConfirmationModuleComponent', () => {
    let component: ConfirmationModuleComponent;
    let fixture: ComponentFixture<ConfirmationModuleComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [ConfirmationModuleComponent]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ConfirmationModuleComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
