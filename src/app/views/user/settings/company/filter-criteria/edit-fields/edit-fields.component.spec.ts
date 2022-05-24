import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditFieldsComponent } from './edit-fields.component';

describe('EditFieldsComponent', () => {
    let component: EditFieldsComponent;
    let fixture: ComponentFixture<EditFieldsComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [EditFieldsComponent]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(EditFieldsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
