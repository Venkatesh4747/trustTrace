import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SupplyChainFlowComponent } from './supply-chain-flow.component';

describe('SupplyChainFlowComponent', () => {
    let component: SupplyChainFlowComponent;
    let fixture: ComponentFixture<SupplyChainFlowComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [SupplyChainFlowComponent]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(SupplyChainFlowComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
