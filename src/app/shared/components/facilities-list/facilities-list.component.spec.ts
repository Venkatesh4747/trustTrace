import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FacilitiesListComponent } from './facilities-list.component';

describe('FacilitiesComponent', () => {
    let component: FacilitiesListComponent;
    let fixture: ComponentFixture<FacilitiesListComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [FacilitiesListComponent]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(FacilitiesListComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
