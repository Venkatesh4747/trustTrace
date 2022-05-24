import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { CustomToastrService } from '../../shared/commonServices/custom-toastr.service';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';

@Injectable()
export class RoleGuardService implements CanActivate {
    message = environment.error_messages.no_authorization;
    constructor(private auth: AuthService, private toastr: CustomToastrService) {}

    canActivate(route: ActivatedRouteSnapshot): boolean | Observable<boolean> {
        let userRoles = this.auth.user.role.map(role => role.authority);
        const roles = route.data['roles'] as string[];

        if (roles.length > 0) {
            if (!userRoles || userRoles.length === 0) {
                return this.auth.getUser().pipe(
                    map(userData => {
                        if (!userData.authorities || userData.authorities.length === 0) {
                            this.toastr.info(this.message, 'Insufficient permission');
                            this.auth.doPostLogoutActions();
                            return false;
                        } else {
                            userRoles = userData.authorities.map(role => role.authority);
                            const isRoleExists = roles.every(role => userRoles.indexOf(role) > -1);
                            if (isRoleExists) {
                                return true;
                            } else {
                                this.toastr.info(this.message, 'Insufficient permission');
                                return false;
                            }
                        }
                    })
                );
            } else {
                const isRoleExists = roles.every(role => userRoles.indexOf(role) > -1);

                if (isRoleExists) {
                    return true;
                } else {
                    this.toastr.info(this.message, 'Insufficient permission');
                    return false;
                }
            }
        } else {
            return true;
        }
    }
}
