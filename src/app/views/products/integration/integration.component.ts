import { Component } from '@angular/core';
import { UtilsService } from '../../../shared/utils/utils.service';

@Component({
    selector: 'app-integration',
    templateUrl: './integration.component.html'
})
export class IntegrationComponent {
    SEARCH_SESSION = `integration_log_search`;

    constructor(private utilService: UtilsService) {}

    ngOnDestroy(): void {
        this.utilService.removeSessionStorageValue(this.SEARCH_SESSION);
    }
}
