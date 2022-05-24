import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DataMappingItemsComponent } from './data-mapping-items.component';

describe('DataMappingItemsComponent', () => {
    let component: DataMappingItemsComponent;
    let fixture: ComponentFixture<DataMappingItemsComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [DataMappingItemsComponent]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(DataMappingItemsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
