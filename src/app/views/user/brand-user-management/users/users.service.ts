import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { environment } from '../../../../../environments/environment';
import { User } from './user.model';

@Injectable({
    providedIn: 'root'
})
export class UsersService {
    constructor(private http: HttpClient) {}

    getAllUsers(payload: any, isFoodIndustry: boolean = false): any {
        let url: string;
        if (isFoodIndustry) {
            url = environment.api.userManagement.getAllUsersWithDefaultFiltering;
        } else {
            url = environment.api.userManagement.getAllUsers;
        }
        return this.http.post(url, payload).pipe(map((response: any) => response.data.searchResponse));
    }

    getUserMgConfig() {
        const url = environment.api.userManagement.getUserConfig;
        return this.http.get(url).pipe(map((response: any) => response.data));
    }

    getUserById(userId: string) {
        const url = environment.api.userManagement.getUser.replace('$1', userId);
        return this.http.get(url).pipe(map((response: any) => response.data));
    }

    activateUser(userId) {
        const url = environment.api.userManagement.activateUser.replace('$1', userId);
        return this.http.patch(url, null).pipe(map((response: any) => response.data));
    }

    deActivateUser(userId) {
        const url = environment.api.userManagement.deActivateUser.replace('$1', userId);
        return this.http.patch(url, null).pipe(map((response: any) => response.data));
    }

    saveUser(payload: User) {
        const url = environment.api.userManagement.saveUser;
        return this.http.post(url, payload).pipe(map((response: any) => response.data));
    }

    updateUser(payload: User) {
        const url = environment.api.userManagement.updateUser;
        return this.http.put(url, payload).pipe(map((response: any) => response.data));
    }

    getUsersFilter() {
        return this.http.get(environment.api.userManagement.usersFilter).pipe(map((response: any) => response.data));
    }
}
