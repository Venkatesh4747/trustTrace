import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { distinctUntilChanged, filter, map } from 'rxjs/operators';
import { SideNavigationService } from '../side-navigation/side-navigation.service';
import { IBreadCrumb } from './breadcrumb';

@Component({
    selector: 'app-breadcrumb',
    templateUrl: './breadcrumb.component.html',
    styleUrls: ['./breadcrumb.component.scss']
})
export class BreadcrumbComponent implements OnInit {
    static_breadcrumb = [{ url: '', label: 'Home' }];

    sideNavigation;

    breadcrumbs$ = this.router.events.pipe(
        filter(event => event instanceof NavigationEnd),
        distinctUntilChanged(),
        map(event => this.buildBreadCrumb(this.activatedRoute.root))
    );

    firstLoad = true;
    breadcrumbs = [];

    constructor(
        private router: Router,
        private activatedRoute: ActivatedRoute,
        private sideNav: SideNavigationService
    ) {
        this.sideNavigation = this.sideNav;
        this.breadcrumbs$ = this.router.events.pipe(
            filter(event => event instanceof NavigationEnd),
            distinctUntilChanged(),
            map(event => this.buildBreadCrumb(this.activatedRoute.root))
        );

        if (this.firstLoad) {
            this.breadcrumbs = this.buildBreadCrumb(this.activatedRoute.root);
        }

        this.firstLoad = false;
    }

    ngOnInit() {}

    buildBreadCrumb(route: ActivatedRoute, url: string = '', breadcrumbs: IBreadCrumb[] = []): IBreadCrumb[] {
        // If no routeConfig is available we are on the root path
        const label = route.routeConfig ? route.routeConfig.data['breadcrumb'] : 'Home';
        const path = route.routeConfig ? route.routeConfig.path : '';
        // In the routeConfig the complete path is not available,
        // so we rebuild it each time
        const nextUrl = `${url}/${path}`;
        const breadcrumb = {
            label,
            url: nextUrl
        };
        const newBreadcrumbs = [...breadcrumbs, breadcrumb];
        if (route.firstChild) {
            // If we are not on our current path yet,
            // there will be more children to look after, to build our breadcumb
            return this.buildBreadCrumb(route.firstChild, nextUrl, newBreadcrumbs);
        }
        return newBreadcrumbs;
    }
}
