import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StyleSustainabilityLabelsComponent } from './style-sustainability-labels.component';

describe('StyleSustainabilityLabelsComponent', () => {
    let component: StyleSustainabilityLabelsComponent;
    let fixture: ComponentFixture<StyleSustainabilityLabelsComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [StyleSustainabilityLabelsComponent]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(StyleSustainabilityLabelsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
