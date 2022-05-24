import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { map, take } from 'rxjs/operators';
import { CustomToastrService } from '../../shared/commonServices/custom-toastr.service';
import { AuthService } from './auth.service';

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(private authService: AuthService, private router: Router, private toastr: CustomToastrService) {}

    canActivate() {
        return this.authService.loggedIn.pipe(
            take(1),
            map(data => {
                if (data) {
                    this.toastr.success('Login successful');
                    this.router.navigate(['/']);
                } else {
                    return true;
                }
            })
        );
    }
}
