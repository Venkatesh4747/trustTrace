import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomizationInfoComponent } from './customization-info.component';

describe('CustomizationInfoComponent', () => {
    let component: CustomizationInfoComponent;
    let fixture: ComponentFixture<CustomizationInfoComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [CustomizationInfoComponent]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(CustomizationInfoComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
