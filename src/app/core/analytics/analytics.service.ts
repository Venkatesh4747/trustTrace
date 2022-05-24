import { Injectable } from '@angular/core';
import { IUserProps } from '../../views/user/brand-user-management/users/user.model';
import { environment } from '../../../environments/environment';
import { RouterHistoryService } from '../../shared/commonServices/router-history.service';

const amplitude = require('amplitude-js/amplitude');

const AMPLITUDE_TOKEN = environment.amplitude_token;

@Injectable()
export class AnalyticsService {
    constructor(private routerHistoryService: RouterHistoryService) {}
    public PROPERTY_ORIGIN = 'Origin';
    public PROPERTY_PREVIOUS_URL = 'PreviousURL';
    public PROPERTY_CURRENT_URL = 'CurrentURL';
    public PROPERTY_ACTION_PERFORMED = 'Action Performed';
    public PROPERTY_COMPANY_ID = 'CompanyId';
    public PROPERTY_FACILITY_ID = 'FacilityId';
    public SEARCH_TERM = 'SearchTerm';
    public PROPERTY_SOURCE_MEDIUM = 'SourceMedium';
    initalizeAmplitude() {
        amplitude.getInstance().init(AMPLITUDE_TOKEN, null, {
            includeReferrer: true,
            forceHttps: true,
            includeUtm: true,
            unsetParamsReferrerOnNewSession: true
        });
    }

    identifyUser(userId: string) {
        amplitude.getInstance().setUserId(userId);
        this.trackEvent('User Logged In/Identified');
    }

    setUserProperties(userProperties: IUserProps): void {
        amplitude.setUserProperties(userProperties);
    }

    trackEvent(eventType: string, props?: object) {
        if (!props) {
            props = {};
        }
        props[this.PROPERTY_PREVIOUS_URL] = this.routerHistoryService.getPreviousUrl();
        props[this.PROPERTY_CURRENT_URL] = this.routerHistoryService.getCurrentUrl();
        amplitude.getInstance().logEvent(eventType, props);
    }

    onMenuClick(menuItemClicked) {
        this.trackEvent(menuItemClicked + ' menu clicked');
    }

    public trackPageVisit(pageName = '', actionMessage = '', entity_platform_id = '') {
        const props = {};
        if (pageName) {
            pageName = pageName.toLowerCase();
            pageName += ' ';
        }

        props['Action'] = actionMessage;
        if (entity_platform_id) {
            props['entity_platform_id'] = entity_platform_id;
        }

        const eventTitle = `Create ${pageName}page`;
        const eventAction = actionMessage === '' ? 'Visit ' + eventTitle : actionMessage;
        this.trackEvent(eventTitle, props);
    }

    public trackButtonClick(
        buttonName,
        clickFromPage,
        actionMessage = '',
        entity_platform_id = '',
        entity_user_specified_id = ''
    ) {
        const props = {};
        if (!actionMessage) {
            actionMessage = `User clicked ${buttonName} button`;
        }

        props['Origin'] = clickFromPage;
        props['Action'] = actionMessage;
        if (entity_platform_id) {
            props['entity_platform_id'] = entity_platform_id;
        }
        if (entity_user_specified_id) {
            props['entity_user_specified_id'] = entity_user_specified_id;
        }

        this.trackEvent(`User clicked ${buttonName} button`, props);
    }

    public trackSaveButtonClick(
        clickFromPage,
        actionMessage = '',
        entity_platform_id = '',
        entity_user_specified_id = ''
    ) {
        this.trackButtonClick('save', clickFromPage, actionMessage, entity_platform_id, entity_user_specified_id);
    }

    public trackSaveSuccess(clickFromPage, actionMessage = '', entity_platform_id = '', entity_user_specified_id = '') {
        if (!actionMessage) {
            actionMessage = 'Successfully saved entity';
        }

        this.trackButtonClick('save', clickFromPage, actionMessage, entity_platform_id, entity_user_specified_id);
    }

    public trackSaveFail(clickFromPage, actionMessage = '', entity_platform_id = '', entity_user_specified_id = '') {
        if (!actionMessage) {
            actionMessage = 'Error saving entity';
        }

        this.trackButtonClick('save', clickFromPage, actionMessage, entity_platform_id, entity_user_specified_id);
    }
}
