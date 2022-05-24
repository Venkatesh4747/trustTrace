import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FabricCompositionComponent } from './fabric-composition.component';

describe('FabricCompositionComponent', () => {
    let component: FabricCompositionComponent;
    let fixture: ComponentFixture<FabricCompositionComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [FabricCompositionComponent]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(FabricCompositionComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
