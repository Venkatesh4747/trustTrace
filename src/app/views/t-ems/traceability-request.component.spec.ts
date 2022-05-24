import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TraceabilityRequestComponent } from './traceability-request.component';

describe('TraceabilityRequestComponent', () => {
    let component: TraceabilityRequestComponent;
    let fixture: ComponentFixture<TraceabilityRequestComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [TraceabilityRequestComponent]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(TraceabilityRequestComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
