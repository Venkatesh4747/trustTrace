import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FacilitiesProfileComponent } from './facilities-profile.component';

describe('FacilitiesProfileComponent', () => {
    let component: FacilitiesProfileComponent;
    let fixture: ComponentFixture<FacilitiesProfileComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [FacilitiesProfileComponent]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(FacilitiesProfileComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
