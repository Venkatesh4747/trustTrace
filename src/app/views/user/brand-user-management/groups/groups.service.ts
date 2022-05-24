import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { environment } from '../../../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class GroupsService {
    constructor(private http: HttpClient) {}

    getGroupConfig() {
        const url = environment.api.userManagement.getGroupConfig;
        return this.http.get(url).pipe(map((response: any) => response.data));
    }

    getAllGroups(payload: any) {
        const url = environment.api.userManagement.getAllGroups;
        return this.http.post(url, payload).pipe(map((response: any) => response.data.searchResponse));
    }
    getGroup(id) {
        const url = environment.api.userManagement.getGroup.replace('$1', id);
        return this.http.get(url).pipe(map((response: any) => response.data));
    }
    deleteGroup(id) {
        const url = environment.api.userManagement.deleteGroup.replace('$1', id);
        return this.http.patch(url, null).pipe(map((response: any) => response.data));
    }

    saveGroup(payload) {
        const url = environment.api.userManagement.saveGroup;
        return this.http.post(url, payload).pipe(map((response: any) => response.data));
    }

    updateGroup(payload) {
        const url = environment.api.userManagement.saveGroup;
        return this.http.put(url, payload).pipe(map((response: any) => response.data));
    }
}
