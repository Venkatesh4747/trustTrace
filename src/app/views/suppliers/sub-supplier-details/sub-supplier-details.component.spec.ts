import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SubSupplierDetailsComponent } from './sub-supplier-details.component';

describe('SubSupplierDetailsComponent', () => {
    let component: SubSupplierDetailsComponent;
    let fixture: ComponentFixture<SubSupplierDetailsComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [SubSupplierDetailsComponent]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(SubSupplierDetailsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
