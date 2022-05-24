import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { Input, OnInit } from '@angular/core';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatAutocomplete, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatChipInputEvent } from '@angular/material/chips';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { LocalizationService } from '../../../shared/utils/localization.service';

@Component({
    selector: 'app-style-certifications',
    templateUrl: './style-certifications.component.html',
    styleUrls: ['./style-certifications.component.scss']
})
export class StyleCertificationsComponent implements OnInit {
    @Input('settings') settings;
    @Input('style') style;

    certificationAutoCompleteList = [];
    selectedCertifications = [];

    constructor(private localeService: LocalizationService) {}

    ngOnInit() {
        if (this.settings.certifications) {
            for (let i = 0; i < this.settings.certifications.length; i++) {
                this.certificationAutoCompleteList.push({
                    id: this.settings.certifications[i],
                    value: this.localeService.getDisplayText(this.settings.certifications[i])
                });
            }
        }
        this.initializeStyle();
    }

    initializeStyle() {
        if (this.style.certifications) {
            this.style.certifications.forEach(element => {
                this.selectedCertifications.push({
                    id: element.id,
                    value: this.localeService.getDisplayText(element.id)
                });
            });
        }
    }

    updateCertifications(chipItems) {
        if (chipItems) {
            const certificationList = [];
            for (let i = 0; i < chipItems.length; i++) {
                certificationList.push({
                    id: chipItems[i].id,
                    mandatory: true
                });
            }
            this.style.certifications = certificationList;
        }
    }
}
