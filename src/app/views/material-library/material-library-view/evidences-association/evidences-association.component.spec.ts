import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EvidencesAssociationComponent } from './evidences-association.component';

describe('EvidencesAssociationComponent', () => {
    let component: EvidencesAssociationComponent;
    let fixture: ComponentFixture<EvidencesAssociationComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [EvidencesAssociationComponent]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(EvidencesAssociationComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
