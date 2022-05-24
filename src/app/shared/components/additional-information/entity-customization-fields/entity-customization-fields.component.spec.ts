import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EntityCustomizationFieldsComponent } from './entity-customization-fields.component';

describe('EntityCustomizationFieldsComponent', () => {
    let component: EntityCustomizationFieldsComponent;
    let fixture: ComponentFixture<EntityCustomizationFieldsComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [EntityCustomizationFieldsComponent]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(EntityCustomizationFieldsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
