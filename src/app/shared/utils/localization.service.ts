import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable()
export class LocalizationService {
    masterData = {};

    constructor(private http: HttpClient) {}

    public getDisplayText(id) {
        let displayText = id;
        if (Array.isArray(id)) {
            displayText = '';
            for (const i in id) {
                if (this.masterData[id[i]]) {
                    displayText += this.masterData[id[i]].value + ',';
                } else {
                    displayText += id[i] + ',';
                }
            }
            if (displayText) {
                displayText = displayText.slice(0, -1);
            }
        } else {
            if (this.masterData[id]) {
                displayText = this.masterData[id].value;
            }
        }
        return displayText;
    }

    public getDisplayTextForList(ids) {
        var displayTextList = [];
        if (ids && Array.isArray(ids)) {
            ids.forEach(id => {
                displayTextList.push(this.getDisplayText(id));
            });
        }
        return displayTextList;
    }

    public getDeafultDisplayText(id) {
        if (this.masterData[id]) {
            return this.masterData[id].value;
        }
        return id;
    }

    public addToMasterData(src) {
        if (src) {
            Object.keys(src).forEach(
                function(key) {
                    this.masterData[key] = src[key];
                }.bind(this)
            );
        }
    }

    // refactor to not accepting param. return onLoadMasterData later
    public getMaterials(masterData) {
        const materials = [];
        for (const key in masterData) {
            if (key.startsWith('mtr')) {
                materials.push(masterData[key]);
            }
        }
        return materials;
    }

    public getVPs(masterData) {
        const vps = [];
        for (const key in masterData) {
            if (key.startsWith('vp')) {
                vps.push(masterData[key]);
            }
        }
        return vps;
    }

    public getcertifications(masterData) {
        const certifications = [];
        for (const key in masterData) {
            if (key.startsWith('cer')) {
                certifications.push(masterData[key]);
            }
        }
        return certifications;
    }

    getMasterData(): Observable<any> {
        const url = environment.api.company.getDefaultMasterData;
        return this.http.get(url);
    }

    ngOnInit() {}
}
