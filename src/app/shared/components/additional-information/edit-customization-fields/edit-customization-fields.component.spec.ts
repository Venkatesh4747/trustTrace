import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditCustomizationFieldsComponent } from './edit-customization-fields.component';

describe('EditCustomizationFieldsComponent', () => {
    let component: EditCustomizationFieldsComponent;
    let fixture: ComponentFixture<EditCustomizationFieldsComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [EditCustomizationFieldsComponent]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(EditCustomizationFieldsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
