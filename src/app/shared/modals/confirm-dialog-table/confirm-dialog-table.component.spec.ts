import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmDialogTableComponent } from './confirm-dialog-table.component';

describe('ConfirmDialogTableComponent', () => {
    let component: ConfirmDialogTableComponent;
    let fixture: ComponentFixture<ConfirmDialogTableComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [ConfirmDialogTableComponent]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ConfirmDialogTableComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
