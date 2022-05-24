import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
    selector: 'app-sso',
    templateUrl: './sso.component.html',
    styleUrls: ['./sso.component.scss']
})
export class SsoComponent implements OnInit {
    /**
     * Please do not remove this component.
     * It is a placeholder to handle Post sso login activities.
     */

    constructor(private router: Router) {}

    ngOnInit() {
        setTimeout(() => {
            this.router.navigate(['/']);
        }, 1);
    }
}
