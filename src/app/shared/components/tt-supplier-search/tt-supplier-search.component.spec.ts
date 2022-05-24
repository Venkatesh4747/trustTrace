import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { TTSupplierSearchComponent } from './tt-supplier-search.component';

describe('TTSupplierSearchComponent', () => {
    let component: TTSupplierSearchComponent;
    let fixture: ComponentFixture<TTSupplierSearchComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [TTSupplierSearchComponent]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(TTSupplierSearchComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
