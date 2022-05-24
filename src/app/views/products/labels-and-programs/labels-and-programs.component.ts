import { Component, OnDestroy, OnInit } from '@angular/core';
import { NavigationEnd, Router, RouterEvent } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { AuthService } from '../../../../app/core';
import { environment } from '../../../../environments/environment';
import { UtilsService } from '../../../shared/utils/utils.service';

@Component({
    selector: 'app-label-program-list',
    templateUrl: './labels-and-programs.component.html',
    styleUrls: ['./labels-and-programs.component.scss']
})
export class LabelsAndProgramsComponent implements OnInit, OnDestroy {
    isRoot = true;
    routeSubscription: Subscription;
    env = environment;
    SEARCH_SESSION = `labels_and_program_search`;

    titles = {
        root: {
            title: 'Labels & Programs',
            description: 'Create and Manage Labels'
        },
        create: {
            title: 'Create New Label',
            description: 'Create labels for product and ingredients'
        },
        update: {
            title: 'Edit Label',
            description: 'Modify your labels for product and ingredients'
        },
        active: {
            title: 'Labels & Programs',
            description: 'Create and Manage Labels'
        }
    };

    get hasLabelCreateAccess(): boolean {
        return this.authService.haveAccess('LABELS_AND_PROGRAMS_CREATE');
    }

    constructor(private router: Router, private utils: UtilsService, private authService: AuthService) {}

    ngOnInit() {
        this.setPageState(null);
        this.routeSubscription = this.router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe(e => {
            this.setPageState(e as RouterEvent);
        });
    }

    setPageState(routerEvent: RouterEvent): void {
        if (routerEvent?.url?.includes('create')) {
            this.isRoot = false;
            this.titles.active = this.titles.create;
        } else if (routerEvent?.url?.includes('update')) {
            this.isRoot = false;
            this.titles.active = this.titles.update;
        } else {
            this.isRoot = true;
            this.titles.active = this.titles.root;
        }
    }

    ngOnDestroy() {
        if (this.routeSubscription) {
            this.routeSubscription.unsubscribe();
        }
        // for a constancy purpose it has been removed
        this.utils.removeSessionStorageValue(this.SEARCH_SESSION);
    }
}
