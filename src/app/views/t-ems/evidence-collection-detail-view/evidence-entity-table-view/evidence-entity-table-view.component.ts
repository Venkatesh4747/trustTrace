import { Component, OnInit, Input } from '@angular/core';
import { LocalizationService } from '../../../../shared/utils/localization.service';

@Component({
    selector: 'app-evidence-entity-table-view',
    templateUrl: './evidence-entity-table-view.component.html',
    styleUrls: ['./evidence-entity-table-view.component.scss']
})
export class EvidenceEntityTableViewComponent implements OnInit {
    @Input() entity;

    constructor(public localeService: LocalizationService) {}

    ngOnInit() {}
}
