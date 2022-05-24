import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { ApplicationMenuSubscription, INavigationMenus } from './application-menu.model';
import { take } from 'rxjs/operators';
import { environment } from '../../../../src/environments/environment';

interface ILabels {
    [key: string]: string;
}

@Injectable({
    providedIn: 'root'
})
export class MultiIndustryService {
    private _applicationMenus: ApplicationMenuSubscription;
    private _industry: string = 'default';
    private _labels: ILabels;
    menus: BehaviorSubject<ApplicationMenuSubscription> = new BehaviorSubject<ApplicationMenuSubscription>(null);

    constructor(private http: HttpClient) {}

    public get industry(): string {
        return this._industry;
    }

    public get labels(): ILabels {
        return this._labels;
    }

    getMenus(subscription: string): INavigationMenus {
        if (!subscription) return null;
        if (this._applicationMenus) return this._applicationMenus[subscription];
        return null;
    }

    setIndustry(): void {
        const domain = window.location.hostname;
        if (domain.indexOf('food') >= 0) {
            this._industry = 'food';
        }
    }

    getApplicationMenus(): void {
        let version = environment.menusVersion;
        this.http
            .get(`/assets/jsons/menus/${this._industry}_${version}.json`)
            .pipe(take(1))
            .subscribe(response => {
                this._applicationMenus = JSON.parse(JSON.stringify(response));
                this.menus.next(this._applicationMenus);
            });
    }

    getIndustryLabels(): void {
        this.http
            .get(`/assets/jsons/labels/${this._industry}.json`)
            .pipe(take(1))
            .subscribe(response => {
                this._labels = JSON.parse(JSON.stringify(response));
            });
    }

    getLabel(defaultText: string): string {
        if (defaultText) {
            if (this.labels) {
                return this.labels[defaultText] ? this.labels[defaultText] : defaultText;
            } else {
                return defaultText;
            }
        } else {
            return '';
        }
    }
}
