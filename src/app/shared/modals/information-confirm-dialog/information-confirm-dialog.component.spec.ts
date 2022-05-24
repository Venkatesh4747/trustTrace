import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InformationConfirmDialogComponent } from './information-confirm-dialog.component';

describe('InformationConfirmDialogComponent', () => {
    let component: InformationConfirmDialogComponent;
    let fixture: ComponentFixture<InformationConfirmDialogComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [InformationConfirmDialogComponent]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(InformationConfirmDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
