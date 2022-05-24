import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../../core/user/auth.guard';
import { AuthComponent } from './auth.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { LoginComponent } from './login/login.component';
import { LogoutComponent } from './logout/logout.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { LoginComponent as SsoLoginComponent } from './sso/login/login.component';
import { SsoComponent } from './sso/sso.component';

const routes: Routes = [
    {
        path: '',
        data: {
            breadcrumb: 'Auth',
            freshChatTags: ['visitors-fashion']
        },
        component: AuthComponent,
        children: [
            {
                path: '',
                data: {
                    breadcrumb: 'Login'
                },
                canActivate: [AuthGuard],
                component: LoginComponent
            },
            {
                path: 'forgot-password',
                data: {
                    breadcrumb: 'Forgot Password'
                },
                canActivate: [AuthGuard],
                component: ForgotPasswordComponent
            },
            {
                path: 'reset-password',
                data: {
                    breadcrumb: 'Reset Password'
                },
                canActivate: [AuthGuard],
                component: ResetPasswordComponent
            },
            {
                path: 'logout',
                data: {
                    breadcrumb: 'Logout'
                },
                component: LogoutComponent
            },
            {
                path: 'sso/callback',
                component: SsoComponent
            },
            {
                path: 'sso/login',
                component: SsoLoginComponent
            }
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class AuthRoutingModule {}
