import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditCustomizationInfoComponent } from './edit-customization-info.component';

describe('EditCustomizationInfoComponent', () => {
    let component: EditCustomizationInfoComponent;
    let fixture: ComponentFixture<EditCustomizationInfoComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [EditCustomizationInfoComponent]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(EditCustomizationInfoComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
