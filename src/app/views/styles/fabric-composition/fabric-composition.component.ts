import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { LocalizationService } from '../../../shared/utils/localization.service';

export interface FabricComposition {
    id: '';
    value: '';
}

@Component({
    selector: 'app-fabric-composition',
    templateUrl: './fabric-composition.component.html',
    styleUrls: ['./fabric-composition.component.scss']
})
export class FabricCompositionComponent implements OnInit {
    @Input('settings') settings;
    @Input('style') style;

    fabricCompositions: FabricComposition[] = [];

    composition = [];

    optional = {
        key: 'key',
        value: 'value',
        selectedKey: 'id'
    };

    constructor(private localeService: LocalizationService) {}

    ngOnInit() {
        this.initializeValues();
    }

    initializeValues() {
        if (this.style.materialComp) {
            for (let i = 0; i < this.style.materialComp.length; i++) {
                this.composition.push('' + this.style.materialComp[i].value);
            }
        }
    }

    addMaterialComposition() {
        this.style.materialComp.unshift({
            id: '',
            value: ''
        });
        this.composition.unshift('0');
    }

    removeComposition(index) {
        this.composition.splice(index, 1);
        this.style.materialComp.splice(index, 1);
    }

    setComposition(index) {
        this.style.materialComp[index].value = Number(this.composition[index]);
    }

    valuePresent(index) {
        if (this.style.materialComp[index].id) {
            return true;
        }
        return false;
    }
}
