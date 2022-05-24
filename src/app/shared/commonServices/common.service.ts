import { Location } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ElementRef, Injectable } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import * as _moment from 'moment';
import { default as _rollupMoment } from 'moment';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { UtilsService } from '../utils/utils.service';
import { BehaviorSubject, Observable } from 'rxjs';
import html2canvas from 'html2canvas';

const moment = _rollupMoment || _moment;

export const MY_FORMATS = {
    parse: {
        dateInput: 'LL'
    },
    display: {
        dateInput: 'DD MMM YYYY',
        monthYearLabel: 'MMM YYYY',
        dateA11yLabel: 'DD MMM YYYY',
        monthYearA11yLabel: 'MMMM YYYY'
    }
};

@Injectable()
export class CommonServices {
    private childInputEvent = new BehaviorSubject<boolean>(false);

    locationBack = false;
    doesParamExist = false;
    params;
    returnUrl = '';

    constructor(
        private http: HttpClient,
        private route: ActivatedRoute,
        private router: Router,
        private location: Location,
        private utils: UtilsService,
        private translate: TranslateService
    ) {
        this.route.queryParams.subscribe(params => {
            this.locationBack = params.back;
        });
        this.route.queryParams.subscribe(params => {
            this.doesParamExist = params.paramExist;
        });
    }

    emitInputChildEvent(flag: boolean): void {
        this.childInputEvent.next(flag);
    }

    childInputEventListener(): Observable<boolean> {
        return this.childInputEvent.asObservable();
    }

    async getCanvas(element: ElementRef): Promise<HTMLCanvasElement> {
        return html2canvas(element.nativeElement, {
            height: window.outerHeight + window.innerHeight,
            width: window.outerWidth + window.innerWidth,
            windowHeight: window.outerHeight + window.innerHeight,
            windowWidth: window.outerWidth + window.innerWidth
        });
    }

    searchCities(searchPayload) {
        const url = environment.api.common.searchCities;
        return this.http.post(url, searchPayload);
    }

    getCities(stateId) {
        const url = environment.api.common.getCities.replace('$1', stateId);
        return this.http.get(url);
    }

    getStates(countryId) {
        const url = environment.api.common.getStates.replace('$1', countryId);
        return this.http.get(url);
    }

    getCountries() {
        return this.http.get(environment.api.common.getCountries);
    }

    convertToDate(dateString: number): any {
        const d = new Date(dateString);
        return d.getDate() + '/' + (d.getMonth() + 1) + '/' + d.getFullYear();
    }

    /*
     * Get Image from external url
     */
    getImage(imageUrl: string) {
        return this.http.get(imageUrl, { observe: 'response', responseType: 'blob' }).pipe(
            map(res => {
                return new Blob([res.body], { type: res.headers.get('Content-Type') });
            })
        );
    }

    /*
     * Download Image from external url into local machine
     */
    downloadImage(imageUrl: string, imageTitle: string) {
        this.getImage(imageUrl).subscribe(res => {
            const a = document.createElement('a');
            a.href = URL.createObjectURL(res);
            a.download = imageTitle;
            document.body.appendChild(a);
            a.click();
        });
    }

    getConvertedUnit(unit: string) {
        const str = unit.replace('^', '&sup');
        return str;
    }

    // go back service with previous navigation
    navigateToUrlWithLocationBack(url) {
        this.router.navigate(url, {
            queryParams: {
                back: true
            }
        });
    }

    // go back service with Query Params
    navigateToUrlWithQueryParams(url, parameter) {
        this.params = parameter.params;
        this.returnUrl = parameter.returnUrl;
        this.router.navigate(url, {
            queryParams: {
                paramExist: true
            }
        });
    }

    goToLocationBack() {
        this.location.back();
    }

    goToLocationWithQueryParam(url) {
        const link = url.split('/');
        this.router.navigate(link, { queryParams: this.params });
    }

    goBack(backUrl = []) {
        if (this.locationBack) {
            this.goToLocationBack();
        } else if (this.doesParamExist) {
            this.goToLocationWithQueryParam(this.returnUrl);
        } else if (backUrl.length === 0) {
            this.goToLocationBack();
        } else {
            this.router.navigate(backUrl);
        }
    }

    scrollToElement(id: string) {
        const el = document.getElementById(id);
        if (el) {
            el.scrollIntoView();
        }
    }

    getFilteredOptions(filter_session: string) {
        const tempFilterOptions = {};
        const options = this.utils.getSessionStorageValue(filter_session);
        if (options) {
            Object.keys(options).forEach(filterOption => {
                if (options[filterOption].length > 0) {
                    tempFilterOptions[filterOption] = options[filterOption];
                }
            });
        }
        return tempFilterOptions;
    }

    getSortbyFilteredOptions(sortby_session: string) {
        return this.utils.getSessionStorageValue(sortby_session);
    }

    resetSortByFilterSession(sortby_session: string) {
        const sortByFilter = {
            sortBy: 'create_ts',
            sortOrder: 'desc'
        };
        this.utils.setSessionStorageValue(sortby_session, sortByFilter);
    }

    public getSuppliersFacilities() {
        return this.http.get(environment.api.assessment.getSuppliersAndFacilities);
    }

    public getAllSuppliers() {
        return this.http.get(environment.api.common.getAllSuppliers);
    }

    makeId(length = 6) {
        let result = '';
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        const charactersLength = characters.length;
        for (let i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    }

    public uploadFile(file, type) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', type);
        return this.http.post(environment.api.common.uploadFile, formData);
    }

    public downloadFile(fileId) {
        const url = environment.api.common.downloadFile.replace('$fileId', fileId);
        return this.http.get(url, { responseType: 'blob' as 'blob' });
    }

    public downloadCertificate(certId) {
        const url = environment.api.evidences.downloadCertificate.replace('$certId', certId);
        return this.http.get(url, { responseType: 'blob' as 'blob' });
    }

    public downloadAdditionalCertificate(certId) {
        const url = environment.api.evidences.downloadAdditionalCertificate.replace('$certId', certId);
        return this.http.get(url, { responseType: 'blob' as 'blob' });
    }

    public getAllCertificateNames(certId) {
        const url = environment.api.evidences.allCertificateNames.replace('$certId', certId);
        return this.http.get(url).pipe(map((response: any) => response['data']));
    }

    public removeDocument(certId) {
        const url = environment.api.evidences.removeDocument.replace('$certId', certId);
        return this.http.delete(url);
    }

    deleteCertificate(payload) {
        const url = environment.api.certificateManager.deleteFile;
        return this.http.post(url, payload);
    }

    public getFileName(fileId) {
        const url = environment.api.common.getFileName.replace('$fileId', fileId);
        return this.http.get(url);
    }

    public removeFile(fileId, fileName) {
        const payload = {
            evidenceId: fileId,
            fileName: fileName
        };
        return this.http.post(environment.api.audits.removeFile, payload);
    }

    public getFile(fileId: string) {
        const url = environment.api.common.downloadFile.replace('$fileId', fileId);
        return this.http.get(url, { responseType: 'arraybuffer' as 'arraybuffer' });
    }

    public getCertificate(certId: string) {
        const url = environment.api.evidences.downloadCertificate.replace('$certId', certId);
        return this.http.get(url, { responseType: 'arraybuffer' as 'arraybuffer' });
    }

    exportDataAsExcel(payload: any) {
        const url = environment.api.common.getDataExport;
        return this.http.post(url, payload, {
            responseType: 'blob' as 'blob'
        });
    }

    public getCustomFieldInfo(payload: any) {
        const url = environment.api.entityCustomization.getCustomFieldInfo;
        return this.http.post(url, payload).pipe(map((response: any) => response.data['custom-field-data']));
    }

    public updateCustomFieldInfo(entity: string, id: string, payload: any) {
        let url = environment.api.entityCustomization.updateCustomFieldInfo;
        url = url.replace('$entity', entity);
        url = url.replace('$id', id);
        return this.http.put(url, payload);
    }

    getTranslation(str: string) {
        const currentLang = this.translate.currentLang; // get current language
        if (!this.translate.translations || !this.translate.translations[currentLang]) {
            return str;
        }
        const returnValue = this.translate.translations[currentLang][str]; // get converted string from current language
        if (returnValue) {
            return returnValue;
        } else {
            return str;
        }
    }

    public formatDate(dateToFormat, dateFormat: string = 'DD MMM YYYY') {
        return moment(dateToFormat).format(dateFormat);
    }

    getMasterData(keys: string[], isFoodIndustry = false): Observable<any> {
        let url: string;
        if (isFoodIndustry) {
            url = environment.api.products.getMasterAndLabelData;
        } else {
            url = environment.api.common.getMasterData;
        }
        return this.http.post(url, keys).pipe(map((response: any) => response.data));
    }

    adjustDateForTimezone(date: Date): Date {
        let timeOffsetInMS: number = date.getTimezoneOffset() * 60000;
        date.setHours(0, 0, 0, 0);
        date.setTime(date.getTime() - timeOffsetInMS);
        return date;
    }

    toImageDataURL(url, defaultImageUrl = ''): Promise<string> {
        return new Promise((resolve, reject) => {
            let img = new Image();
            img.setAttribute('crossOrigin', 'anonymous');

            img.onload = () => {
                let canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;

                let ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0);

                let dataURL = canvas.toDataURL('image/png');

                resolve(dataURL);
            };

            img.onerror = async error => {
                if (defaultImageUrl) {
                    resolve(await this.toImageDataURL(defaultImageUrl));
                } else {
                    reject(error);
                }
            };

            img.src = url;
        });
    }

    public getDateString(date: Date | string, dateFormat = 'en-GB') {
        return new Date(date).toLocaleDateString(dateFormat);
    }

    filterInput(event) {
        const keyCode = event.which ? event.which : event.keyCode;
        const isNotWanted = keyCode == 69 || keyCode === 187 || keyCode === 189;
        return !isNotWanted;
    }

    filterNumberInput(event) {
        const keyCode = 'which' in event ? event.which : event.keyCode;
        if (keyCode > 31 && (keyCode < 48 || keyCode > 57)) {
            return false;
        }
        return true;
    }
}
