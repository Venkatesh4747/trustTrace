/* eslint-disable @typescript-eslint/no-unused-vars */
import { DebugElement } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { InlineEditComponent } from './inline-edit.component';

describe('InlineEditComponent', () => {
    let component: InlineEditComponent;
    let fixture: ComponentFixture<InlineEditComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [InlineEditComponent]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(InlineEditComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
