import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditTrSupplyChainComponent } from './edit-tr-supply-chain.component';

describe('EditTrSupplyChainComponent', () => {
    let component: EditTrSupplyChainComponent;
    let fixture: ComponentFixture<EditTrSupplyChainComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [EditTrSupplyChainComponent]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(EditTrSupplyChainComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
