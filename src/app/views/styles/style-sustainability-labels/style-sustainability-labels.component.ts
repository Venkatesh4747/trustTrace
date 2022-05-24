import { Component, Input, OnInit } from '@angular/core';

@Component({
    selector: 'app-style-sustainability-labels',
    templateUrl: './style-sustainability-labels.component.html',
    styleUrls: ['./style-sustainability-labels.component.scss']
})
export class StyleSustainabilityLabelsComponent implements OnInit {
    @Input('settings') settings;
    @Input('style') style;
    selectedSustainabilityLabels = [];
    autoCompleteList = [];

    ngOnInit() {
        if (
            this.settings.style &&
            this.settings.style.styleSettings &&
            this.settings.style.styleSettings.sustainabilityLabels
        ) {
            this.autoCompleteList = this.settings.style.styleSettings.sustainabilityLabels;
        }
        this.initializeValues();
    }

    initializeValues() {
        if (this.style.sustainabilityLabels) {
            this.style.sustainabilityLabels.forEach(element => {
                const index = this.autoCompleteList.findIndex(x => x.id === element.id);
                let value = element.id;
                if (index >= 0) {
                    value = this.autoCompleteList[index].value;
                    this.selectedSustainabilityLabels.push({
                        id: element.id,
                        value: value
                    });
                }
                if (index === -1) {
                    this.style.sustainabilityLabels.splice(element, 1);
                }
            });
        }
    }

    updateCertifications() {
        if (this.selectedSustainabilityLabels) {
            const sustainabilityLabels = [];
            for (let i = 0; i < this.selectedSustainabilityLabels.length; i++) {
                sustainabilityLabels.push({
                    id: this.selectedSustainabilityLabels[i].id,
                    mandatory: true
                });
            }
            this.style.sustainabilityLabels = sustainabilityLabels;
        }
    }
}
