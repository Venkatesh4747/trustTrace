import { map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
    IUpdateSupplierInvitePayload,
    IUpdateSupplierInviteResponse
} from '../../shared/modals/add-supplier-v2/add-supplier-v2.model';
import { ISupplierStatistics } from './supplier.model';
import { Payload } from './sub-supplier-details/sub-supplier-profile.model';

@Injectable()
export class SuppliersService {
    constructor(private http: HttpClient) {}

    public SUPPLIER_CANNOT_DISCLOSE = 'SNA_CANNOT_DISCLOSE';
    public getList(filterOptions, searchMultiTire): Observable<any> {
        return this.http.post(environment.api.suppliers.getAll.replace('$1', searchMultiTire), filterOptions);
    }
    public getSupplierProfile(supplierId): Observable<any> {
        return this.http.get(environment.api.suppliers.getSupplier.replace('$1', supplierId));
    }
    public getSubSupplierProfile(supplierId: string, companyId: string): Observable<any> {
        return this.http.get(
            environment.api.suppliers.getSubSupplier.replace('$supplier-id/$company-id', supplierId + '/' + companyId)
        );
    }
    public saveSupplierProfile(supplierId, supplierPayLoad): Observable<any> {
        return this.http.put(environment.api.suppliers.getSupplier.replace('$1', supplierId), supplierPayLoad);
    }
    public associateSupplier(payload) {
        return this.http.post(environment.api.company.associateSupplier, payload);
    }
    public getTodoTask(supplierId) {
        return this.http.get(environment.api.todo.getTodoTask.replace('$1', supplierId));
    }
    public createTask(payload) {
        return this.http.post(environment.api.todo.createTask, payload);
    }
    public addTaskItem(payload) {
        return this.http.put(environment.api.todo.addTaskItem, payload);
    }
    public removeTodo(itemId) {
        return this.http.delete(environment.api.todo.removeTaskItem.replace('$1', itemId));
    }
    public editTodo(payload) {
        return this.http.put(environment.api.todo.editTaskItem, payload);
    }
    public getAllSuppliers(payload) {
        return this.http.post(environment.api.suppliers.getAllSuppliers, payload);
    }
    public getAllSuppliersProfile(payload) {
        return this.http.post(environment.api.suppliers.getAllSuppliersProfile, payload);
    }
    public getAcceptedAndUnAcceptedSupplierFilters(payload) {
        return this.http.post(environment.api.suppliers.getAcceptedUnAcceptedSupplierFilters, payload);
    }
    public getUninvitedSupplierFilters(payload) {
        return this.http.post(environment.api.suppliers.getUninvitedSupplierFilters, payload);
    }
    public getTerminatedSupplierFilters(payload) {
        return this.http.post(environment.api.suppliers.getTerminatedSupplierFilters, payload);
    }

    public getSubSupplierFilters(payload: Payload): Observable<any> {
        return this.http.post(environment.api.suppliers.getSubSupplierFilters, payload);
    }

    public addSupplier(payload) {
        return this.http.post(environment.api.suppliers.addSupplier, payload, { observe: 'response' });
    }

    public updateSupplierInvite(payload: IUpdateSupplierInvitePayload): Observable<IUpdateSupplierInviteResponse> {
        return this.http.post<IUpdateSupplierInviteResponse>(environment.api.suppliers.updateSupplierInvite, payload);
    }
    public getAdditionalInfo(supplierId) {
        let url = environment.api.suppliers.getAdditionalInfo;
        url = url.replace('$supplierId', supplierId);
        return this.http.get(url).pipe(map(response => response['data']));
    }
    public saveAdditionalInfo(supplierId: string, payload: any) {
        let url = environment.api.suppliers.getAdditionalInfo;
        url = url.replace('$supplierId', supplierId);
        return this.http.put(url, payload).pipe(map(response => response['data']));
    }

    public sendRegistrationAssociationReminderEmail(supplierId: string): Observable<any> {
        let url = environment.api.suppliers.registrationAssociationReminder.replace('$supplierId', supplierId);
        return this.http.get(url);
    }
    public getSupplierInviteLink(supplierId: string): Observable<any> {
        let url = environment.api.suppliers.supplierInviteLink.replace('$supplierId', supplierId);
        return this.http.get(url);
    }

    public getAllSubSuppliersProfile(payload: Payload): Observable<any> {
        return this.http.post(environment.api.suppliers.getAllSubSuppliersProfile, payload);
    }
    public archiveSupplier(supplierId: string): Observable<any> {
        let url = environment.api.suppliers.archiveSupplier;
        url = url.replace('$supplierId', supplierId);
        return this.http.patch(url, null);
    }
    public getSupplierStatistics(supplierId: string): Observable<ISupplierStatistics> {
        let url = environment.api.admin.supplierStatistics;
        url = url.replace('$supplierId', supplierId);
        return this.http.get(url).pipe(map(response => response['data']));
    }

    public downloadData() {
        const url = environment.api.suppliers.downloadSupplierTemplate;
        return this.http.get(url, { responseType: 'blob' as 'blob' });
    }

    public uploadData(payload: any) {
        const formData = new FormData();
        formData.append('file', payload);
        return this.http.post<any>(environment.api.suppliers.importSuppliers, formData);
    }

    public getSupplierConflicts(): Observable<any> {
        return this.http.get(environment.api.suppliers.getSupplierConflicts).pipe(map(response => response['data']));
    }

    public terminateSupplier(comapnyId: string, supplierId: string): Observable<any> {
        let url = environment.api.suppliers.terminate.replace('$1', comapnyId).replace('$2', supplierId);
        return this.http.post(url, {});
    }
}
