import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UploadTransactionDocumentsComponent } from './upload-transaction-documents.component';

describe('UploadTransactionDocumentsComponent', () => {
    let component: UploadTransactionDocumentsComponent;
    let fixture: ComponentFixture<UploadTransactionDocumentsComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [UploadTransactionDocumentsComponent]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(UploadTransactionDocumentsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
