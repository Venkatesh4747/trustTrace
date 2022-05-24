import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateTrSupplyChainComponent } from './create-tr-supply-chain.component';

describe('CreateTrSupplyChainComponent', () => {
    let component: CreateTrSupplyChainComponent;
    let fixture: ComponentFixture<CreateTrSupplyChainComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [CreateTrSupplyChainComponent]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(CreateTrSupplyChainComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
