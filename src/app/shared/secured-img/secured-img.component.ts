import { HttpClient } from '@angular/common/http';
import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { map } from 'rxjs/operators';

@Component({
    selector: 'app-secured-img',
    templateUrl: './secured-img.component.html',
    styleUrls: ['./secured-img.component.scss']
})
export class SecuredImgComponent implements OnChanges, OnInit {
    private src: String;
    @Input() private id: string;
    @Input() private fName: string;
    @Input() public altText: string;
    @Input() public className: string;

    // we need HttpClient to load the image
    constructor(private httpClient: HttpClient, private domSanitizer: DomSanitizer) {}
    ngOnInit(): void {
        this.dataUrl$ = this.loadImage(this.id, this.fName);
    }

    // ignore this for now
    private src$ = new BehaviorSubject(this.src);
    ngOnChanges(): void {
        this.src$.next(this.src);
    }

    dataUrl$ = this.loadImage(this.id, this.fName);

    private loadImage(id: string, name: string): Observable<any> {
        return (
            this.httpClient
                .get(environment.api.audits.getFile + `?evidenceId=${id}&fileName=${name}`, {
                    responseType: 'blob' as 'blob'
                })
                // create an object url of that blob that we can use in the src attribute
                .pipe(map(e => this.domSanitizer.bypassSecurityTrustUrl(URL.createObjectURL(e))))
        );
    }
}
