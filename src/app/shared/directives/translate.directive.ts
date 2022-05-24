import { HttpClient } from '@angular/common/http';
import { Directive, EventEmitter, HostListener, Input, OnInit, Output } from '@angular/core';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../core';
import { AnalyticsService } from '../../core/analytics/analytics.service';

@Directive({
    selector: '[appGoogleTranslate]'
})
export class TranslateDirective implements OnInit {
    @Input() input_text: string;
    @Output() onTranslatedTextReceived = new EventEmitter();

    // Target Language to translate
    target = 'en';

    constructor(
        private http: HttpClient,
        private authService: AuthService,
        private analyticsService: AnalyticsService
    ) {}

    ngOnInit() {
        this.target = this.authService.user.language;
    }

    @HostListener('click', ['$event.target'])
    onClick() {
        this.analyticsService.trackEvent('Translate Requested');
        if (this.input_text === '') {
            this.onTranslatedTextReceived.emit('Oops! There must be some string to translate');
        } else {
            this.getTranslatedText(this.input_text, this.target);
        }
    }

    // To get the translation from google translate
    getTranslatedText(text: string, target: string) {
        const payload = {
            text: text,
            target: target
        };
        this.http.post(environment.api.translate.getTranslatedText, payload).subscribe(resp => {
            this.onTranslatedTextReceived.emit(resp);
        });
    }
}
