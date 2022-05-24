import { Component } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
    selector: 'app-create-transaction',
    templateUrl: './create-transaction.component.html',
    styleUrls: ['./create-transaction.component.scss']
})
export class CreateTransactionComponent {
    env = environment;
    pageLoading: boolean;
    options = ['inbound', 'production', 'outbound'];

    selectedOption = 'Select Transaction Type';

    constructor(private route: Router, private activatedRoute: ActivatedRoute) {
        const routeName = this.route.url.split('/').pop();
        if (this.options.includes(routeName)) {
            this.selectedOption = routeName;
        }
    }

    selectTransaction(routeName) {
        this.route.navigate([routeName.toLowerCase()], { relativeTo: this.activatedRoute });
    }
}
