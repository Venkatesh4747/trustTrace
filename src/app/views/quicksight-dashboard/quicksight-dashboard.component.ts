import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import * as QuickSightEmbedding from 'amazon-quicksight-embedding-sdk';
import { CustomToastrService } from '../../shared/commonServices/custom-toastr.service';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../core';

@Component({
    selector: 'app-quicksight-dashboard',
    templateUrl: './quicksight-dashboard.component.html',
    styleUrls: ['./quicksight-dashboard.component.scss']
})
export class QuicksightDashboardComponent implements OnInit {
    dashboard: any;
    pageLoading = true;

    ngOnInit() {
        this.GetDashboardURL();
    }

    constructor(private toastr: CustomToastrService, private auth: AuthService, private router: Router) {}

    public GetDashboardURL() {
        this.auth.RequestAPI(environment.api.quicksight.getDashboardEmbedUrl + '?getUrl=' + true).subscribe(
            data => {
                // const response = JSON.stringify(data['body']);
                const url = data['body']['EmbedUrl'];
                // const url = response.substring(response.lastIndexOf('https:'), response.lastIndexOf('resetDisabled=true') + 18);
                this.Dashboard(url);
                this.pageLoading = false;
            },
            () => {
                this.toastr.error('Could not fetch the data from service provider', 'Oops! Unexpected error');
                this.pageLoading = false;
            }
        );
    }

    public Dashboard(embeddedURL: string) {
        const containerDiv = document.getElementById('dashboardContainer');
        const options = {
            url: embeddedURL,
            container: containerDiv,
            scrolling: 'yes',
            height: '700px',
            width: '100%'
        };

        this.dashboard = QuickSightEmbedding.embedDashboard(options);
    }
}
