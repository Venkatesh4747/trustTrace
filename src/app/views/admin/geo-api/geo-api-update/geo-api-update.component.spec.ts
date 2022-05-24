import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GeoApiUpdateComponent } from './geo-api-update.component';

describe('GeoApiUpdateComponent', () => {
    let component: GeoApiUpdateComponent;
    let fixture: ComponentFixture<GeoApiUpdateComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [GeoApiUpdateComponent]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(GeoApiUpdateComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
