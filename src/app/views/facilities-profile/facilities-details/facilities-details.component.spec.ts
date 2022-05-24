import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FacilitiesDetailsComponent } from './facilities-details.component';

describe('FacilitiesDetailsComponent', () => {
    let component: FacilitiesDetailsComponent;
    let fixture: ComponentFixture<FacilitiesDetailsComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [FacilitiesDetailsComponent]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(FacilitiesDetailsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
