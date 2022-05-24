import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { QuicksightDashboardComponent } from './quicksight-dashboard.component';

describe('QuicksightDashboardComponent', () => {
    let component: QuicksightDashboardComponent;
    let fixture: ComponentFixture<QuicksightDashboardComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [QuicksightDashboardComponent]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(QuicksightDashboardComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
