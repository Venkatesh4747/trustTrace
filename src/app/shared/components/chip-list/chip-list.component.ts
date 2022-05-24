import { TitleCasePipe } from '@angular/common';
import { Component, Input } from '@angular/core';
import { LocalizationService } from '../../utils/localization.service';

@Component({
    selector: 'app-chip-list',
    templateUrl: './chip-list.component.html',
    styleUrls: ['./chip-list.component.scss']
})
export class ChipListComponent {
    @Input() title: string;
    @Input() chipList: string[];

    get getNoDataDisplayName(): string {
        return `No ${this.titleCasePipe.transform(this.title)} Available`;
    }

    constructor(private localeService: LocalizationService, private titleCasePipe: TitleCasePipe) {}

    getDisplayTextForList(): string[] {
        return this.localeService.getDisplayTextForList(this.chipList);
    }
}
