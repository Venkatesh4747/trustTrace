import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ValueHolderDialogComponent } from './value-holder-dialog.component';

describe('ValueHolderDialogComponent', () => {
    let component: ValueHolderDialogComponent;
    let fixture: ComponentFixture<ValueHolderDialogComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [ValueHolderDialogComponent]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ValueHolderDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
