import { Inject, Injectable } from '@angular/core';
import { sortBy } from 'lodash';
import { SESSION_STORAGE, StorageService } from 'ngx-webstorage-service';
import { environment as env } from '../../../environments/environment';
import { DatePipe } from '@angular/common';
import { IRenameKeys, getFilterListItems, setFilterListItems } from './utils.model';
import { HttpClient } from '@angular/common/http';
import { JwtModel } from '../../views/auth/jwt-refreshtoken-model/jwt-RefreshToken';

@Injectable()
export class UtilsService {
    constructor(
        @Inject(SESSION_STORAGE) private sessionStorage: StorageService,
        private datePipe: DatePipe,
        private http: HttpClient
    ) {}

    IMAGE_DIRECTORY = env.IMG_URL + 'images/';

    public convertRatioToPercentage(inputValue) {
        return Math.floor(inputValue * 100);
    }

    public getStandardImageUrl(standard: string): string {
        return this.IMAGE_DIRECTORY + 'standards/' + standard + '.png';
    }

    public getProductComplianceImageUrl(name: string) {
        return `${this.IMAGE_DIRECTORY}productCompliance/${name}`;
    }

    public getProductComplianceIconUrl(name: string) {
        return `${this.IMAGE_DIRECTORY}${name}`;
    }

    public getGroupImageUrl(id) {
        let url = this.IMAGE_DIRECTORY + 'group/';
        if (id) {
            url = url + id;
        } else {
            url = url + 'default';
        }
        url = url + '.png';
        return url;
    }

    public getcdnImage(fileName: string): string {
        const url = this.IMAGE_DIRECTORY + fileName;
        return url;
    }

    /**
     *
     * output: 30 Dec 2018
     *
     */
    DATE_FORMAT_1 = 'dd LLL yyyy';

    public getDatebyFormat1(date_val) {
        return this.datePipe.transform(new Date(date_val), this.DATE_FORMAT_1);
    }

    public getDate(date_val) {
        if (date_val) {
            return new Date(date_val).toLocaleString().split(',')[0];
        } else {
            return date_val;
        }
    }

    public getDateTime(date_val) {
        if (date_val) {
            return new Date(date_val).toLocaleString();
        } else {
            return date_val;
        }
    }

    public sortData(data, field?) {
        return sortBy(data, field);
    }

    public setSessionStorageValue(key, value, toSave = true) {
        this.sessionStorage.set(key, value);
        if (toSave) {
            if (Object.keys(value).length > 0 && !Object.keys(value).includes('sortBy')) {
                this.saveFilter(key, value);
            }
        }
    }

    public setInitialSessionStorageValue(filterItem: any) {
        const view_page = filterItem['viewPage'];
        this.setSessionStorageValue(getFilterListItems[view_page], filterItem['value'], false);
    }

    public getSessionStorageValue(key) {
        return this.sessionStorage.get(key);
    }

    public removeSessionStorageValue(key) {
        return this.sessionStorage.remove(key);
    }

    public clearSessionStorage() {
        this.sessionStorage.clear();
    }
    initializeSessionStorageValues(
        filter_session: string,
        label: string,
        optionsParam: any,
        options: any,
        filterType: string
    ) {
        if (!this.getSessionStorageValue(filter_session)) {
            // If session storage is not initialized, initialize

            let tempSessionStorageValue = {};
            tempSessionStorageValue[label] = [];
            this.setSessionStorageValue(filter_session, tempSessionStorageValue, false);
        } else {
            // if session storage is initialized, make sure every filter parameter exists on the session storage

            let tempSessionStorageValue = this.getSessionStorageValue(filter_session);
            if (!tempSessionStorageValue[label]) {
                tempSessionStorageValue[label] = [];
            } else {
                if (filterType === 'tt-multi-select') {
                    tempSessionStorageValue[label].forEach((value: any, index: any) => {
                        const list = options.filter((option: any) => option[optionsParam.key].indexOf(value) === 0);
                        if (list.length <= 0) {
                            tempSessionStorageValue[label].splice(index, 1);
                        }
                    });
                } else {
                    if (filterType === 'multi-select' || filterType === 'group-multi-select') {
                        tempSessionStorageValue[label].forEach((value: any, index: any) => {
                            const list = options.filter((option: any) => option && option.indexOf(value) === 0);
                            if (list.length <= 0) {
                                tempSessionStorageValue[label].splice(index, 1);
                            }
                        });
                    }
                }
            }
            this.setSessionStorageValue(filter_session, tempSessionStorageValue, false);
        }
    }

    updateSessionStorageValues(
        sessionStorageKey: string,
        sessionStorageValue: Array<String>,
        sessionStorageValueIndex: any
    ) {
        // Get existing session storage data
        let tempSessionStorageValue = this.getSessionStorageValue(sessionStorageKey);
        // Update to new data
        tempSessionStorageValue[sessionStorageValueIndex] = JSON.parse(JSON.stringify(sessionStorageValue));
        // Write back to session storage
        this.setSessionStorageValue(sessionStorageKey, tempSessionStorageValue);
    }

    getDefaultCertificateImage(element) {
        element.src = env.IMG_URL + 'images/no-certificate.png';
    }

    /**
     * @method renameKeys
     * @param data
     * @param renameKeys
     */
    renameKeys(data: Array<any>, renameKeys: Array<IRenameKeys>): Array<any> {
        const renamedObj = data.map((obj: any) => {
            renameKeys.forEach(rename => {
                if (obj[rename.from]) {
                    obj[rename.to] = obj[rename.from];
                    delete obj[rename.from];
                }
            });
            return obj;
        });
        return renamedObj;
    }

    /**
     * @method sortOptions
     * @param data
     * @param by
     */
    sortOptions(data: any, by: string): any {
        if (data && data.length > 0) {
            let finalData: Array<any> = [];
            finalData = JSON.parse(JSON.stringify(data));
            finalData.sort((a, b) => {
                return a[by].toLowerCase() < b[by].toLowerCase() ? -1 : 1;
            });
            return finalData;
        } else {
            return [];
        }
    }

    saveFilter(key: string, payload: any) {
        const filterPayload = {
            filter: payload,
            viewPage: setFilterListItems[key]
        };
        return this.http.post(env.api.auth.saveFilter, filterPayload);
    }

    parseJwtToken(token: string): JwtModel {
        return JSON.parse(atob(token.split('.')[1]));
    }

    getExpireTime(jwtToken: JwtModel): Date {
        return new Date(jwtToken.exp * 1000);
    }

    replaceCamelcaseWithSpace(strValue: string): string {
        strValue = strValue.trim();
        let result = strValue.slice(1).replace(/([A-Z])/g, ' $1');
        result = strValue.charAt(0).toUpperCase() + result;
        return result;
    }

    /**
     * @name validateProductUniqueCode
     * @param productUniqueCode
     * @returns boolean
     * @description
     * Validate the Product Unique Code with regex Pattern.
     * Allowd Characters: A-Z a-z 0-9 - _
     */
    validateProductUniqueCode(productUniqueCode: string): boolean {
        if (!productUniqueCode || !productUniqueCode.match(/^[A-Za-z0-9-_]*$/)) {
            return false;
        }
        return true;
    }

    copyText(inputElement: HTMLInputElement): void {
        inputElement.select();
        document.execCommand('copy');
        inputElement.setSelectionRange(0, 0);
    }
}
