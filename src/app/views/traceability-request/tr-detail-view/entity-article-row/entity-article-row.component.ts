import { Component, OnInit, Input } from '@angular/core';
import { LocalizationService } from './../../../../shared/utils/localization.service';
import { ContextService } from '../../../../shared/context.service';

@Component({
    selector: 'app-entity-article-row',
    templateUrl: './entity-article-row.component.html',
    styleUrls: ['./entity-article-row.component.scss']
})
export class EntityArticleRowComponent implements OnInit {
    @Input() article;
    @Input() index;
    @Input() entityArticleName = '';

    selectedArticleName;

    constructor(public localeService: LocalizationService, private appContext: ContextService) {}

    ngOnInit() {
        this.appContext.selectedArticleName.subscribe(articleName => {
            this.selectedArticleName = articleName;
        });
    }

    handleSelect(articleName: string) {
        this.appContext.selectedArticleName.next({ articleName: articleName, entityName: this.entityArticleName });
    }
}
