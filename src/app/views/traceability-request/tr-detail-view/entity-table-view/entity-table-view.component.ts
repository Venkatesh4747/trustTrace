import { Component, OnInit, Input } from '@angular/core';
import { LocalizationService } from '../../../../shared/utils/localization.service';

@Component({
    selector: 'app-entity-table-view',
    templateUrl: './entity-table-view.component.html',
    styleUrls: ['./entity-table-view.component.scss']
})
export class EntityTableViewComponent implements OnInit {
    @Input() entity;
    @Input() showEntityTitle: Boolean = true;

    constructor(public localeService: LocalizationService) {}

    ngOnInit() {}
}
