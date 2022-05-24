import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

import { environment } from '../../../../environments/environment';
import * as productActions from '../store/products.actions';
import { IProductsModel } from '../store/products.reducer';

@Component({
    selector: 'app-product-tasks',
    templateUrl: 'tasks.component.html',
    styleUrls: ['./tasks.component.scss']
})
export class ProductTasksComponent implements OnInit, OnDestroy {
    isRoot = true;
    routeSubscription: Subscription;

    env = environment;

    actions: string[] = ['Upload', 'Cancel'];

    titles = {
        root: {
            title: 'Products',
            description: 'Add details for Products'
        },
        simulation: {
            title: 'Simulate Product',
            description: 'Shows a simulated score based on the parameters of the product'
        },
        active: {
            title: 'Products',
            description: 'Add details for Products'
        }
    };

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private store: Store<{ Products: IProductsModel }>
    ) {}

    ngOnInit() {
        // Back button handler
        this.showBackBtn(this.router.url);
        this.routeSubscription = this.router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe(e => {
            this.showBackBtn(e['url']);
            this.setTitleAndDescriptions(e['url']);
        });

        // Fetch data collections options- eg country,labels
        this.store.dispatch(new productActions.FetchOptions());
    }

    showBackBtn(url: string): void {
        const data = this.route.firstChild.snapshot.params;
        this.isRoot = !((data && data.hasOwnProperty('id')) || url === '/products/tasks/simulation');
    }

    setTitleAndDescriptions(url: string): void {
        if (url === '/products/tasks/simulation') {
            this.titles.active = this.titles.simulation;
        } else {
            this.titles.active = this.titles.root;
        }
    }

    ngOnDestroy() {
        if (this.routeSubscription) {
            this.routeSubscription.unsubscribe();
        }
        this.store.dispatch(new productActions.Destroy());
    }
}
