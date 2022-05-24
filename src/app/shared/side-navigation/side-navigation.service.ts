import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class SideNavigationService {
    private EXPANDED = 'expanded';
    private COLLAPSED = 'expanded';

    public state = this.EXPANDED;

    constructor(private http: HttpClient) {
        if (localStorage.getItem('sideNavState')) {
            this.state = localStorage.getItem('sideNavState');
        } else {
            this.state = this.EXPANDED;
        }
    }

    public expand() {
        this.state = this.EXPANDED;
        localStorage.setItem('sideNavState', this.EXPANDED);
    }

    public collapse() {
        this.state = this.COLLAPSED;
        localStorage.setItem('sideNavState', this.COLLAPSED);
    }

    public toggle() {
        this.state === this.COLLAPSED ? this.expand() : this.collapse();
    }
}
