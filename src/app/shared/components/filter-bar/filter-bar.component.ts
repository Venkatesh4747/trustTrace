import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ContextService } from './../../context.service';
import { UtilsService } from './../../utils/utils.service';

@Component({
    selector: 'app-filter-bar',
    templateUrl: './filter-bar.component.html',
    styleUrls: ['./filter-bar.component.scss']
})
export class FilterBarComponent implements OnInit {
    @Input() filters;
    @Input() filter_session;
    @Input() filterOptions;
    @Input() isKeyOptions = false;
    @Input() optionsParam;
    @Output() handleFilterSelection = new EventEmitter();

    constructor(private utilsService: UtilsService, private appContext: ContextService) {}

    ngOnInit() {}

    handleSelection() {
        this.handleFilterSelection.emit();
    }

    resetAllFilters() {
        this.utilsService.setSessionStorageValue(this.filter_session, {});
        this.appContext.resetFilterOptions.next(true);
        this.handleSelection();
    }

    isAgroup(value) {
        return value.type && value.type === 'group' ? true : false;
    }

    isADateRange(keyValue): boolean {
        return !!keyValue.includes('@dateRange');
    }
}
