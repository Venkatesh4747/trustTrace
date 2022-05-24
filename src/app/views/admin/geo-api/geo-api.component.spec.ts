import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GeoApiComponent } from './geo-api.component';

describe('GeoApiComponent', () => {
    let component: GeoApiComponent;
    let fixture: ComponentFixture<GeoApiComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [GeoApiComponent]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(GeoApiComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
