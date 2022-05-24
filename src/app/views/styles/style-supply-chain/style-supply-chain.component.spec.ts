import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StyleSupplyChainComponent } from './style-supply-chain.component';

describe('StyleSupplyChainComponent', () => {
    let component: StyleSupplyChainComponent;
    let fixture: ComponentFixture<StyleSupplyChainComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [StyleSupplyChainComponent]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(StyleSupplyChainComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
