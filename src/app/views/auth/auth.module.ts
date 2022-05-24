import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CarouselModule } from 'ngx-bootstrap/carousel';
import { CarouselConfig } from 'ngx-bootstrap/carousel';
import { PopoverModule } from 'ngx-bootstrap/popover';
import { AuthGuard } from '../../core/user/auth.guard';
import { SharedModule } from '../../shared/shared.module';
import { AuthRoutingModule } from './auth-routing.module';
import { AuthComponent } from './auth.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { LoginComponent } from './login/login.component';
import { LogoutComponent } from './logout/logout.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { LoginComponent as SsoLoginComponent } from './sso/login/login.component';
import { SsoComponent } from './sso/sso.component';

@NgModule({
    imports: [
        CommonModule,
        AuthRoutingModule,
        ReactiveFormsModule,
        PopoverModule.forRoot(),
        CarouselModule.forRoot(),
        MatIconModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatButtonToggleModule,
        SharedModule,
        MatProgressSpinnerModule,
        MatCardModule
    ],
    providers: [
        { provide: CarouselConfig, useValue: { interval: 4500, noPause: true, showIndicators: true } },
        AuthGuard
    ],
    declarations: [
        AuthComponent,
        LoginComponent,
        ForgotPasswordComponent,
        ResetPasswordComponent,
        LogoutComponent,
        SsoComponent,
        SsoLoginComponent
    ]
})
export class AuthModule {}
