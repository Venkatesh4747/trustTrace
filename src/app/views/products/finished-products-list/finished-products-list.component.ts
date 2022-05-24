import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { UtilsService } from '../../../shared/utils/utils.service';
import { Store } from '@ngrx/store';
import { IProductsModel } from '../store/products.reducer';
import * as productActions from '../store/products.actions';
@Component({
    selector: 'app-finished-products-list',
    templateUrl: './finished-products-list.component.html',
    styleUrls: ['./finished-products-list.component.scss']
})
export class FinishedProductsListComponent implements OnInit, OnDestroy {
    isRoot: boolean = true;
    routeSubscription: Subscription;
    SEARCH_SESSION = `products_search`;

    titles = {
        root: {
            title: 'Products',
            description: 'View and Manage the Products'
        },
        simulation: {
            title: 'Simulate Product',
            description: 'Shows a simulated score based on the parameters of the product'
        },
        active: {
            title: 'Products',
            description: 'View and Manage the Products'
        }
    };

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private utils: UtilsService,
        private store: Store<{ Products: IProductsModel }>
    ) {}

    ngOnInit() {
        // back button handler
        this.showBackBtn(this.router.url);
        this.routeSubscription = this.router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe(e => {
            this.showBackBtn(e['url']);
            this.setTitleAndDescriptions(e['url']);
        });
        this.store.dispatch(new productActions.FetchOptions());
    }

    showBackBtn(url: string): void {
        const data = this.route.firstChild.snapshot.params;
        if ((data && data.hasOwnProperty('id')) || url === '/products/finished/simulation') {
            this.isRoot = false;
        } else {
            this.isRoot = true;
        }
    }

    setTitleAndDescriptions(url: string): void {
        if (url === '/products/finished/simulation') {
            this.titles.active = this.titles.simulation;
        } else {
            this.titles.active = this.titles.root;
        }
    }

    ngOnDestroy() {
        if (this.routeSubscription) {
            this.routeSubscription.unsubscribe();
        }
        // Todo for a constancy purpose it has been removed
        this.utils.removeSessionStorageValue(this.SEARCH_SESSION);
        this.store.dispatch(new productActions.Destroy());
    }
}
