import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BomLiteComponent } from './bom-lite.component';

describe('BomLiteComponent', () => {
    let component: BomLiteComponent;
    let fixture: ComponentFixture<BomLiteComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [BomLiteComponent]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(BomLiteComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
