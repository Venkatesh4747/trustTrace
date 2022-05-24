import { Injectable } from '@angular/core';
import { Observable, Observer } from 'rxjs';
import { first, flatMap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { FCUser, FCWidget } from './support-chat.model';

@Injectable()
export class SupportChatService {
    WIDGET_URL = 'https://wchat.freshchat.com/js/widget.js';
    CHAT_SERVICE_HOST = 'https://wchat.freshchat.com';

    constructor() {}
    init() {
        if (environment?.name === 'food' || !environment.SUPPORT_CHAT_TOKEN) {
            return;
        }

        const paramData = {
            token: environment.SUPPORT_CHAT_TOKEN,
            host: this.CHAT_SERVICE_HOST,
            tags: ['fashion-docs']
        };

        if (environment?.name === 'fashion') {
            paramData['faqTags'] = {
                tags: ['visitors-fashion', 'fashion'],
                filterType: 'category'
            };
        }

        this.loadScript(this.WIDGET_URL)
            .pipe(
                first(),
                flatMap(res => this.initWidget(paramData))
            )
            .subscribe(res => {});
    }

    private initWidget(data): Observable<any> {
        return Observable.create(observer => {
            this.getWidget().on('widget:loaded', res => observer.next(res));
            this.getWidget().init(data);
        });
    }

    getUser(): Observable<any> {
        return Observable.create(observer => {
            this.getWidget().user.get(res => {
                if (res.status !== 200) {
                    observer.error(res.status);
                } else {
                    observer.next(res.data);
                }
            });
        });
    }

    setUserData(userData): void {
        if (this.getWidget() !== undefined) {
            this.setUserProperties({
                firstName: userData.firstName,
                lastName: (userData.lastName || '') + '(' + userData.companyProfileView.name + ')',
                email: userData.email,
                externalId: userData.email
            }).subscribe(data => {
                // Chat initialized
            });
        }
    }

    private setUserProperties(user: FCUser): Observable<any> {
        return Observable.create(observer => {
            this.getWidget().user.setProperties(user, res => {
                if (res.status !== 200) {
                    observer.error(res.status);
                } else {
                    observer.next(res.data || null);
                }
            });
        });
    }

    updateUser(user: FCUser): void {
        this.getWidget().user.update(user);
    }

    clearUser(): void {
        this.getWidget()
            ?.user.clear()
            .then((success: unknown) => success)
            .catch((error: unknown) => error);
    }

    track(eventName: string, payload?: any): void {
        this.getWidget().track(eventName, payload);
    }

    setFaqTags(freshChatTags: string[]): void {
        if (freshChatTags?.length > 0) {
            this.getWidget().setFaqTags({ tags: freshChatTags, filterType: 'category' });
        } else {
            this.getWidget().setFaqTags({ tags: ['fashion'], filterType: 'category' });
        }
    }

    setLocale(locale: string): void {
        this.getWidget().setLocale(locale);
    }

    destroy(): void {
        this.getWidget().destroy();
    }

    checkInit(): Observable<any> {
        return new Observable(observer => {
            if (this.getWidget() === undefined) {
                setTimeout(() => {
                    observer.next(this.isInitialized());
                }, 5000);
            } else {
                observer.next(this.isInitialized());
            }
        });
    }

    isInitialized(): boolean {
        return this.getWidget().isInitialized();
    }

    private getWidget(): FCWidget {
        return (window as any).fcWidget;
    }

    private loadScript(src: string): Observable<any> {
        return new Observable<any>((observer: Observer<any>) => {
            const scriptElement = document.createElement('script');
            scriptElement.type = 'text/javascript';
            scriptElement.src = src;
            scriptElement.onload = () => {
                observer.next(src);
                observer.complete();
            };
            scriptElement.onerror = () => observer.error("Couldn't load " + src);
            document.getElementsByTagName('body')[0].appendChild(scriptElement);
        });
    }
}
