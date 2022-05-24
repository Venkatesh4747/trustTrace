import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LaunchedComponent } from './launched.component';

describe('LaunchedComponent', () => {
    let component: LaunchedComponent;
    let fixture: ComponentFixture<LaunchedComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [LaunchedComponent]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(LaunchedComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
