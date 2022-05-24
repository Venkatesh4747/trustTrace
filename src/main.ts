import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import Amplify, { Auth } from '@aws-amplify/auth';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

const cR = localStorage.getItem('cR');
const cPId = localStorage.getItem('cPId');
const cACId = localStorage.getItem('cACId');
const cD = localStorage.getItem('cD');

if (!!cR && !!cPId && !!cACId) {
    Amplify.configure({
        Auth: {
            region: cR,
            userPoolId: cPId,
            userPoolWebClientId: cACId,
            mandatorySignIn: false,
            oauth: {
                domain: cD,
                scope: ['email', 'openid'],
                redirectSignIn: window.location.origin + environment.cognito.callback_url,
                redirectSignOut: window.location.origin + environment.cognito.signout,
                responseType: 'code' // or 'token', note that REFRESH token will only be generated when the responseType is code
            }
        }
    });
}

if (environment.production) {
    enableProdMode();
    window.console.log = () => {};
}

platformBrowserDynamic()
    .bootstrapModule(AppModule)
    .catch(err => console.log(err));
