import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReusableSupplyChainComponent } from './reusable-supply-chain.component';

describe('ReusableSupplyChainComponent', () => {
    let component: ReusableSupplyChainComponent;
    let fixture: ComponentFixture<ReusableSupplyChainComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [ReusableSupplyChainComponent]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ReusableSupplyChainComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
