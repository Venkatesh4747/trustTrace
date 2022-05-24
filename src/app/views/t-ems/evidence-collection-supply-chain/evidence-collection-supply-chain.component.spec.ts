import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EvidenceCollectionSupplyChainComponent } from './evidence-collection-supply-chain.component';

describe('EvidenceCollectionSupplyChainComponent', () => {
    let component: EvidenceCollectionSupplyChainComponent;
    let fixture: ComponentFixture<EvidenceCollectionSupplyChainComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [EvidenceCollectionSupplyChainComponent]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(EvidenceCollectionSupplyChainComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
