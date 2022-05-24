import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, filter, switchMap, take } from 'rxjs/operators';
import { RefreshTokenResponse } from '../../views/auth/jwt-refreshtoken-model/jwt-RefreshToken';
import { AuthService } from './auth.service';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {
    isTokenRefreshing = false;
    refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject(null);

    constructor(public auth: AuthService) {}

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        if (request.url.includes('refreshtoken') || request.url.includes('login')) {
            if (request.url.includes('refreshtoken')) {
                return next.handle(request).pipe(
                    catchError(
                        (error: HttpErrorResponse): Observable<HttpEvent<any>> => {
                            return this.oncatchError(error);
                        }
                    )
                );
            }
            return next.handle(request);
        }
        const jwtToken = this.auth.getSessionToken();

        if (jwtToken) {
            return next.handle(this.addToken(request, jwtToken)).pipe(
                catchError(
                    (error: HttpErrorResponse): Observable<HttpEvent<any>> => {
                        if (error.status === 401) {
                            return this.handleAuthErrors(request, next);
                        } else {
                            return throwError(error);
                        }
                    }
                )
            );
        }
        return next.handle(request).pipe(
            catchError(
                (error: HttpErrorResponse): Observable<HttpEvent<any>> => {
                    if (error.status === 401) {
                        this.oncatchError(error);
                    }
                    return throwError(error);
                }
            )
        );
    }

    private handleAuthErrors(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        if (!this.isTokenRefreshing) {
            this.isTokenRefreshing = true;
            this.refreshTokenSubject.next(null);

            return this.auth.refreshToken().pipe(
                switchMap(
                    (refreshTokenResponse: RefreshTokenResponse): Observable<HttpEvent<any>> => {
                        this.isTokenRefreshing = false;
                        this.refreshTokenSubject.next(refreshTokenResponse.accessToken);
                        return next.handle(this.addToken(req, refreshTokenResponse.accessToken));
                    }
                ),
                catchError(
                    (error: HttpErrorResponse): Observable<HttpEvent<any>> => {
                        this.isTokenRefreshing = false;
                        this.refreshTokenSubject.next(null);
                        return this.oncatchError(error);
                    }
                )
            );
        } else {
            return this.refreshTokenSubject.pipe(
                filter(result => result !== null),
                take(1),
                switchMap(
                    (res): Observable<HttpEvent<any>> => {
                        return next.handle(this.addToken(req, this.auth.getSessionToken()));
                    }
                )
            );
        }
    }

    addToken(request: HttpRequest<any>, jwtToken: string): HttpRequest<any> {
        let headers = request.headers.set('X-Token', jwtToken);

        if (this.auth.isSSOLogin()) {
            headers = request.headers
                .set('X-Token', this.auth.getSessionToken())
                .set('X-Id-Token', this.auth.getOAuthIdToken());
        }
        return request.clone({ headers });
    }

    oncatchError(error: HttpErrorResponse): Observable<HttpEvent<any>> {
        const data = {
            reason: error?.error?.message ? error.error.message : '',
            status: error.status
        };
        this.auth.onHandleError(data);
        return throwError(error);
    }
}
