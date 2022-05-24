import { Injectable } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';

@Injectable()
export class RouterHistoryService {
    private history = [];

    constructor(private router: Router) {
        this.loadRouting();
    }

    public loadRouting(): void {
        this.router.events.subscribe(event => {
            if (event instanceof NavigationEnd) {
                this.history = [...this.history, event.urlAfterRedirects];
            }
        });
    }

    public getHistory(): string[] {
        return this.history;
    }

    public getCurrentUrl(): string {
        return this.history[this.history.length - 1] || '/index';
    }

    public getPreviousUrl(): string {
        return this.history[this.history.length - 2] || '/index';
    }
}
