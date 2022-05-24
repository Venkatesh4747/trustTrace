import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddShipmentDetailsComponent } from './add-shipment-details.component';

describe('AddShipmentDetailsComponent', () => {
    let component: AddShipmentDetailsComponent;
    let fixture: ComponentFixture<AddShipmentDetailsComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [AddShipmentDetailsComponent]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(AddShipmentDetailsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
