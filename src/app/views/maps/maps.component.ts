import { TitleCasePipe } from '@angular/common';
import { Component, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Title } from '@angular/platform-browser';
import '@elfalem/leaflet-curve';
import * as L from 'leaflet';
import { icon, Icon } from 'leaflet';
import 'leaflet-arrowheads';
import 'leaflet.markercluster';
import { Subscription } from 'rxjs';
import '../../../../node_modules/leaflet.fullscreen/Control.FullScreen';
import { environment as env, environment } from '../../../environments/environment';
import { AnalyticsService } from '../../core/analytics/analytics.service';
import { CommonServices } from '../../shared/commonServices/common.service';
import { CertificateManagerService } from '../../shared/components/certificate-manager/certificate-manager.service';
import { ContextService } from '../../shared/context.service';
import { TRModalComponent } from '../../shared/modals/TRModal/TRModal.component';
import { SideNavigationService } from '../../shared/side-navigation/side-navigation.service';
import { LocalizationService } from '../../shared/utils/localization.service';
import { UtilsService } from '../../shared/utils/utils.service';
import { MapsService } from './maps.service';
import {
    ICompanyData,
    IFacilityData,
    IGeoLocation,
    ISearchPayload,
    ISelectedCompany,
    ISelectedFacility,
    ISupplierData,
    ISupplierLinkEntry
} from './maps.model';
import { AuthService } from '../../core';
import { CustomToastrService } from '../../shared/commonServices/custom-toastr.service';
import { IPagination } from '../assessments/assessments.model';

declare module 'leaflet' {
    namespace control {
        function fullscreen(v: any): Control;
    }

    /**
     * Drawing Bezier curves and other complex shapes.
     */
    function curve(path: any[], options?: PathOptions): Path;
}

@Component({
    selector: 'app-maps',
    templateUrl: './maps.component.html',
    styleUrls: ['./maps.component.scss']
})
export class MapsComponent implements OnInit, OnDestroy {
    // TODO: Remove Monkey-patch that enables only specified company by ID to view the supplier-tier linking on map
    readonly companiesWithAccessToSupplierLink = [
        '60c30f2a4b36544a5d654683',
        '5f969b8fcde6b92a4a4dc987',
        '5f61dd092df9505270b674a6'
    ];

    sideNavigation;
    dashboardType = 'facilities';
    mapIconPath = env.IMG_URL + 'images/icons/maps/';
    public env = env;
    latlng = [];
    latlngs = []; // For curved lines
    polyLines: any[] = [];
    selectedFacility;
    selectedTR = [];
    pagination: IPagination = {
        from: 0,
        size: 10000
    };

    getMapDetails: Subscription;

    @ViewChild('facilityInfoModal', { static: true }) facilityInfoModal;
    @ViewChild('TRInfoModal', { static: true }) TRInfoModal: TRModalComponent;
    standards: any = [];
    standardsImage = env.config.standardsImage;

    mapContainerTop: number;
    profileDataObj = {
        id: '',
        companyName: '',
        contactPersonName: '',
        contactEmail: '',
        contactMobile: '',
        description: '',
        logo_url: '',
        address: {
            addressLine1: '',
            addressLine2: '',
            country: '',
            countryCode: '',
            state: '',
            city: '',
            zip: '',
            latitude: '',
            longitude: ''
        },
        Facilities: [
            {
                id: '',
                name: '',
                address: {
                    addressLine1: '',
                    addressLine2: '',
                    country: '',
                    countryCode: '',
                    state: '',
                    city: '',
                    zip: '',
                    latitude: '',
                    longitude: '',
                    fullText: ''
                },
                valueProcess: [],
                materials: [],
                standards: []
            }
        ]
    };
    profileData = {} as any;
    @ViewChild('supplierProfileModal', { static: true }) supplierModal;
    @ViewChild('facilityModal', { static: true }) facilityModal;
    countries: any = [];
    regions: any = [];
    valueProcesses: any = [];
    materials: any = [];
    viewingFacility: any;
    map: any;
    supplierFilters: any;
    filter_session = 'map_suppliers_filters';
    optionsParam = { key: 'id', value: 'value' };
    pageLoading = true;
    @ViewChild('leafletMap', { static: true }) leafletMap;

    ANALYTICS_EVENT_VISUALIZATION_MAPS = 'Visualization-Maps-';
    ANALYTICS_ACTION_VISUALIZATION_MAPS_VIEWED = 'Visualization Maps Viewed';

    supplierLink = [];
    private _supplierLinkStatus = false;
    companyAddress: IGeoLocation;
    companyData: ICompanyData;

    constructor(
        private titleService: Title,
        private sideNav: SideNavigationService,
        private commonServices: CommonServices,
        private titleCase: TitleCasePipe,
        private mapsService: MapsService,
        public localeService: LocalizationService,
        private analyticsService: AnalyticsService,
        public utilsService: UtilsService,
        private auth: AuthService,
        private appContext: ContextService,
        public certificateManagerService: CertificateManagerService,
        private toastrService: CustomToastrService
    ) {
        this.sideNavigation = sideNav;
        this.titleService.setTitle('TrusTrace | Maps');
    }

    @HostListener('window:resize', ['$event'])
    onResize() {
        setTimeout(() => {
            this.mapContainerTop =
                document.getElementById('map-header').offsetHeight +
                document.getElementById('filter-bar-wrapper').offsetHeight +
                15;
        }, 0);
    }

    ngOnInit() {
        this.changeType();
        this.profileData = JSON.parse(JSON.stringify(this.profileDataObj));
        this.commonServices.getCountries().subscribe(response1 => {
            const data1 = response1['data'];
            this.countries = data1.country;
        });
        this.onResize();
    }

    // TODO: Remove Monkey-patch that enables only specified company by ID to view the supplier-tier linking on map
    companyHasAccessToSupplierLink(): boolean {
        return this.companiesWithAccessToSupplierLink.includes(this.auth.companyId);
    }

    set supplierLinkStatus(status: boolean) {
        this._supplierLinkStatus = status;
        this.supplierLinkToggle();
    }

    get supplierLinkStatus(): boolean {
        return this._supplierLinkStatus;
    }

    supplierLinkToggle(): void {
        if (!this.companyHasAccessToSupplierLink()) {
            return;
        }
        if (this._supplierLinkStatus) {
            this.buildSupplierLink(this.companyData);
            this.renderSupplierLink();
        } else {
            this.supplierLink.splice(0, this.supplierLink.length);
            for (let i in this.map._layers) {
                if (this.map._layers[i]._path) {
                    this.map.removeLayer(this.map._layers[i]);
                }
            }
        }
    }

    private buildSupplierLink(companyData: ICompanyData): void {
        if (!companyData) {
            return;
        }

        if (this.supplierLink.length === 0) {
            this.buildSupplierLinkForDirectSuppliers(companyData, companyData.suppliers);
        }

        if (this.supplierLink.length > 0) {
            this.buildSupplierLinkForSubSuppliers(companyData.suppliers);
        }
    }

    private buildSupplierLinkForDirectSuppliers(companyData: ICompanyData, suppliersData: ISupplierData[]): void {
        for (const supplier of suppliersData) {
            this.mapSupplierLink(companyData, supplier, true);
        }
    }

    private buildSupplierLinkForSubSuppliers(suppliersData: ISupplierData[]): void {
        for (const supplierData of suppliersData) {
            for (const supplier of suppliersData) {
                this.mapSupplierLink(supplierData, supplier);
            }
        }
    }

    private mapSupplierLink(
        companyData: ICompanyData | ISupplierData,
        supplierData: ISupplierData,
        isCompany: boolean = false
    ): void {
        let supplierLinkEntry: ISupplierLinkEntry = {
            from: new IGeoLocation(),
            to: new IGeoLocation()
        };
        let supplierId = isCompany ? supplierData.company_id : supplierData.supplier_id;
        if (
            companyData.company_id === supplierId &&
            companyData.latitude &&
            companyData.longitude &&
            supplierData.latitude &&
            supplierData.longitude
        ) {
            supplierLinkEntry.from.latitude = companyData.latitude;
            supplierLinkEntry.from.longitude = companyData.longitude;
            supplierLinkEntry.to.latitude = supplierData.latitude;
            supplierLinkEntry.to.longitude = supplierData.longitude;
            this.supplierLink.push(supplierLinkEntry);
        }
    }

    removeSpace(key: any) {
        return 'maps-' + key.replace(/ /g, '-');
    }

    ngOnDestroy() {
        this.appContext.showHideSidenavSubject.next(true);
    }

    initMap() {
        if (this.map) {
            this.map.remove();
        }

        // Declaring Map
        this.map = L.map('map', {
            maxBounds: L.latLngBounds([-90, -180], [90, 180]),
            minZoom: 3,
            worldCopyJump: true
        }).setView([20, 5], 2);

        L.tileLayer(
            'https://tile.thunderforest.com/neighbourhood/{z}/{x}/{y}.png?apikey=43cb23a08fbb49a6be049b0cda24559a',
            {
                attribution: 'Maps © Thunderforest, Data © OpenStreetMap contributors'
            }
        ).addTo(this.map);

        L.control
            .fullscreen({
                position: 'topleft', // change the position of the button can be topleft, topright, bottomright or bottomleft, defaut topleft
                forceSeparateButton: true, // force seperate button to detach from zoom buttons, default false
                forcePseudoFullscreen: true, // force use of pseudo full screen even if full screen API is available, default false
                fullscreenElement: false // Dom element to render in full screen, false by default, fallback to map._container
            })
            .addTo(this.map);

        this.map.on('enterFullscreen', () => {
            this.map.invalidateSize();
            this.appContext.showHideSidenavSubject.next(false);
            this.leafletMap.nativeElement.style.marginTop = '73px';
        });

        this.map.on('exitFullscreen', () => {
            this.map.invalidateSize();
            this.appContext.showHideSidenavSubject.next(true);
            this.leafletMap.nativeElement.style.marginTop = '0px';
        });

        this.map.leafletMap = this.leafletMap;
        this.map.appContext = this.appContext;
    }

    getCountryCode(countryName) {
        countryName = this.titleCase.transform(countryName);
        if (Array.isArray(this.countries) && this.countries.length > 0) {
            for (const country of this.countries) {
                if (country.name === countryName) {
                    return country.code.toLowerCase();
                }
            }
        }
        return false;
    }

    changeType() {
        if (this.getMapDetails) {
            this.getMapDetails.unsubscribe();
        }
        this.initMap();

        const analyticsOptions = {};
        analyticsOptions[
            this.analyticsService.PROPERTY_ACTION_PERFORMED
        ] = this.ANALYTICS_ACTION_VISUALIZATION_MAPS_VIEWED;
        this.analyticsService.trackEvent(
            this.ANALYTICS_EVENT_VISUALIZATION_MAPS + this.dashboardType,
            analyticsOptions
        );

        switch (this.dashboardType) {
            case 'products':
                this.getMapDetails = this.mapsService.getAllTR().subscribe(
                    response => {
                        const data = response.data;
                        this.plotLines(data);
                    },
                    failResponse => {
                        if (failResponse.error.message === 'Access is denied') {
                            this.toastrService.info(
                                this.env.error_messages.no_authorization,
                                'Insufficient Permission'
                            );
                        }
                    }
                );
                break;
            case 'styles':
                this.getMapDetails = this.mapsService.getAllStyles().subscribe(
                    response => {
                        const data = response.data;
                        this.plotLines(data);
                    },
                    failResponse => {
                        if (failResponse.error.message === 'Access is denied') {
                            this.toastrService.info(
                                this.env.error_messages.no_authorization,
                                'Insufficient Permission'
                            );
                        }
                    }
                );
                break;
            default:
                this.getAllFacilities();
                break;
        }
    }

    getAllFacilities(init = true) {
        this.pageLoading = true;
        // Reset the supplier_link on reset filters
        this.supplierLink = [];
        const payload = this.getSearchPayload();
        payload.filter['Ancestors'] = [this.auth.companyId];
        payload.collapse = 'supplier_id';
        this.supplierFilters = this.fetchMapFilters(payload);
        this.getMapDetails = this.mapsService.getAllFacilities(payload).subscribe(
            response => {
                this.localeService.addToMasterData(response['masterData']);
                const data = response['data'];
                const company: ICompanyData = {
                    company_id: '',
                    latitude: 0,
                    longitude: 0,
                    map_facility_info: [],
                    suppliers: []
                };
                company.company_id = data.companyId;
                company.map_facility_info = data.mapFacility;
                company.latitude = data.latitude;
                company.longitude = data.longitude;
                company.suppliers = data.suppliers;
                this.latlng = [];
                this.traverseSuppliers(company);
                this.addMarker();
                this.pageLoading = false;

                this.companyData = company;
                this.supplierLinkToggle();
            },
            failResponse => {
                if (failResponse.error.message === 'Access is denied') {
                    this.toastrService.info(this.env.error_messages.no_authorization, 'Insufficient Permission');
                }
                this.pageLoading = false;
            }
        );
    }
    updateFiltersSelection(): ISearchPayload {
        return this.utilsService.getSessionStorageValue(this.filter_session) || {};
    }

    private fetchMapFilters(payload: ISearchPayload): void {
        this.pageLoading = true;
        this.mapsService.getMapFilters(payload).subscribe(response => {
            this.supplierFilters = response['data'];
            this.onResize();
            this.pageLoading = false;
        });
    }
    private renderSupplierLink(): void {
        setTimeout(() => {
            this.supplierLink.forEach(supplierLink => {
                let polylinePoints = [];

                if (supplierLink.from && supplierLink.to) {
                    polylinePoints.push(new L.LatLng(supplierLink.from.latitude, supplierLink.from.longitude));
                    polylinePoints.push(new L.LatLng(supplierLink.to.latitude, supplierLink.to.longitude));
                }

                // @ts-ignore
                // prettier-ignore
                L.polyline(polylinePoints).arrowheads({
                    size: '10px',
                    fill: true,
                    frequency: 5
                })
                    .addTo(this.map);
                if (this.supplierLink[this.supplierLink.length - 1] === supplierLink) {
                    this.supplierLink = [];
                }
            });
        }, 100);
    }

    resetAllFilters(): void {
        this.utilsService.setSessionStorageValue(this.filter_session, {});
        this.appContext.resetFilterOptions.next(true);
        this.fetchMapFilters(this.getSearchPayload());
        this.handleFilterSelection();
    }

    getFilteredOptions() {
        const tempFilterOptions = {};
        const options = this.utilsService.getSessionStorageValue(this.filter_session);
        if (options) {
            Object.keys(options).forEach(filterOption => {
                if (options[filterOption].length > 0) {
                    tempFilterOptions[filterOption] = options[filterOption];
                }
            });
        }
        return tempFilterOptions;
    }

    private getSearchPayload(): ISearchPayload {
        return {
            filter: this.getFilteredOptions(),
            pagination: this.pagination,
            collapse: 'supplier_id'
        };
    }

    getStandardImageName(standardName) {
        const standard = standardName.toLowerCase();

        return this.standardsImage[standard];
    }

    addSupplierCompanyAddressToLatLng(supplierInfo: ICompanyData): void {
        if (supplierInfo && !supplierInfo.latitude && !supplierInfo.longitude) {
            return;
        }
        this.latlng.push({
            lat: supplierInfo.latitude,
            lng: supplierInfo.longitude,
            company: supplierInfo
        });
    }

    addFacilityCompanyAddressToLatLng(facilityInfo: IFacilityData): void {
        if (facilityInfo && !facilityInfo.latitude && !facilityInfo.longitude) {
            return;
        }
        this.latlng.push({
            lat: facilityInfo.latitude,
            lng: facilityInfo.longitude,
            facility: facilityInfo
        });
    }

    processSuppliersFacilities(supplierInfo: ICompanyData): void {
        if (supplierInfo.map_facility_info) {
            supplierInfo.map_facility_info.forEach(facility => {
                this.addFacilityCompanyAddressToLatLng(facility);
                if (supplierInfo.hasOwnProperty('logoUrl')) {
                    facility['logoUrl'] = supplierInfo.logoUrl || env.IMG_URL + 'images/nologo.png';
                }
            });
        }
    }

    processSubSuppliers(supplierInfo: ICompanyData): void {
        if (supplierInfo.hasOwnProperty('suppliers') && supplierInfo.suppliers !== null) {
            for (const subSupplier of supplierInfo.suppliers) {
                const supplier: ICompanyData = {
                    company_id: '',
                    latitude: 0,
                    longitude: 0,
                    map_facility_info: [],
                    suppliers: []
                };
                supplier.company_id = subSupplier.supplier_id;
                supplier.latitude = subSupplier.latitude;
                supplier.longitude = subSupplier.longitude;
                supplier.map_facility_info = subSupplier.map_facility_info;
                this.addSupplierCompanyAddressToLatLng(supplier);
                this.processSuppliersFacilities(supplier);
            }
        }
    }

    traverseSuppliers(supplier: ICompanyData): boolean | void {
        if (!supplier) {
            return false;
        }
        this.addSupplierCompanyAddressToLatLng(supplier);
        this.processSuppliersFacilities(supplier);
        this.processSubSuppliers(supplier);
    }

    generateMapIcon(iconUrl) {
        return icon({
            iconUrl,
            // iconSize: [32, 44],
            iconAnchor: [16, 44] // point of the icon which will correspond to marker's location
        });
    }

    addMarker() {
        let iconUrl: Icon;

        const markers = L.markerClusterGroup({
            spiderfyOnMaxZoom: true,
            showCoverageOnHover: false,
            zoomToBoundsOnClick: true
        });
        for (const item of this.latlng) {
            if (item.hasOwnProperty('facility')) {
                const facilityIcon = item.facility.map_icon || 'default.png';
                iconUrl = this.generateMapIcon(this.mapIconPath + facilityIcon);
                const marker = L.marker([item.lat, item.lng], { icon: iconUrl }).on('click', () => {
                    this.pageLoading = true;
                    this.mapsService.getSelectedFacilityDetailsById(item.facility.id).subscribe(
                        (response: ISelectedFacility) => {
                            this.selectedFacility = response;
                            this.pageLoading = false;
                            this.openFacilityInfoModal();
                        },
                        () => this.showServerErrorToastr()
                    );
                });
                markers.addLayer(marker);
            } else {
                iconUrl = this.generateMapIcon(this.mapIconPath + 'head-office.png');
                const marker = L.marker([item.lat, item.lng], { icon: iconUrl }).on('click', () => {
                    this.pageLoading = true;
                    this.mapsService.getSelectedCompanyDetailsById(item.company.company_id).subscribe(
                        (response: ISelectedCompany) => {
                            this.pageLoading = false;
                            this.openSupplierModal(response);
                        },
                        () => this.showServerErrorToastr()
                    );
                });
                markers.addLayer(marker);
            }
        }
        this.map.addLayer(markers);
    }

    private showServerErrorToastr(): void {
        this.toastrService.error(
            environment.error_messages.could_not_fetch_data.message,
            environment.error_messages.could_not_fetch_data.title
        );
    }

    // Plot Markers for lines
    generateNode(node) {
        for (const item of node) {
            L.marker([item.node.lat, item.node.lng])
                .on('click', () => {
                    this.selectedTR = item.nodeInfo;
                    this.openTRInfoModal();
                })
                .addTo(this.map);
        }
    }

    // generate Curve
    generateCurve(from, to) {
        const offsetX = to[1] - from[1];
        const offsetY = to[0] - from[0];

        const r = Math.sqrt(Math.pow(offsetX, 2) + Math.pow(offsetY, 2));
        const theta = Math.atan2(offsetY, offsetX);

        const thetaOffset = 3.14 / 10;

        const r2 = r / 2 / Math.cos(thetaOffset);
        const theta2 = theta + thetaOffset;

        const midpointX = r2 * Math.cos(theta2) + from[1];
        const midpointY = r2 * Math.sin(theta2) + from[0];

        const midpointLatLng = [midpointY, midpointX];

        this.latlngs.push(from, midpointLatLng, to);

        return midpointLatLng;
    }

    plotLines(responseData) {
        // Get the edge details
        const data = responseData.edge;

        this.polyLines = [];

        // Add Markers to layer to show on line
        this.generateNode(responseData.node);

        for (const datum of data) {
            const polyLine_data_from = [];
            const polyLine_data_to = [];

            if (datum.to !== undefined) {
                // Get From Lat and Lng
                polyLine_data_from.push(datum.from.lat);
                polyLine_data_from.push(datum.from.lng);

                polyLine_data_to.push(datum.to.lat);
                polyLine_data_to.push(datum.to.lng);

                // Generate curve to draw a line on map
                const midpointLatLng = this.generateCurve(polyLine_data_from, polyLine_data_to);

                const pathOptions = {
                    color: 'rgba(51, 136, 255, 1.0)',
                    weight: 3,
                    data: datum.responseList
                };
                L.curve(['M', polyLine_data_from, 'Q', midpointLatLng, polyLine_data_to], pathOptions)
                    .on('click', () => {
                        this.selectedTR = pathOptions.data;
                        this.openTRInfoModal();
                    })
                    .addTo(this.map);
            }
        }
    }

    openFacilityInfoModal() {
        this.facilityInfoModal.show();
    }

    openFacilityModal(facility) {
        this.viewingFacility = JSON.parse(JSON.stringify(facility));
        this.facilityModal.show();
    }

    openTRInfoModal() {
        this.TRInfoModal.show();
    }

    openSupplierModal(supplierData) {
        const supplier = JSON.parse(JSON.stringify(supplierData));
        this.profileData = JSON.parse(JSON.stringify(this.profileDataObj));
        this.profileData.logo_url = supplier.logoUrl || env.IMG_URL + 'images/nologo.png';
        this.profileData.address = supplier.companyAddress;
        this.profileData.companyName = supplier.companyName;
        this.profileData.description = supplier.description;

        if (supplier && supplier.hasOwnProperty('contactInfo') && supplier.contactInfo) {
            this.profileData.contactPersonName = supplier.contactInfo.name;
            this.profileData.contactEmail = supplier.contactInfo.email;
            this.profileData.contactMobile = supplier.contactInfo.phoneNumber;
        }

        this.profileData.Facilities = JSON.parse(JSON.stringify(supplier.facilities));

        this.valueProcesses = [];
        this.materials = [];
        this.standards = [];

        // Get unique VPs, Materials and Standards from Facilities
        if (this.profileData.Facilities === null) {
            this.mapsService.getSupplierFacilities(supplier.companyId).subscribe(
                response => {
                    this.profileData.Facilities = response['data'];
                    this.getAssignedFacility();
                },
                () => {
                    this.toastrService.error('Unable to load facilities');
                }
            );
        } else {
            this.getAssignedFacility();
        }
    }

    getAssignedFacility() {
        if (this.profileData.Facilities !== null) {
            for (const { address, certificateList, materials: material, valueProcess: facility } of this.profileData
                .Facilities) {
                if (address) {
                    if (address.country) {
                        address.countryCode = this.getCountryCode(address.country);
                    }
                    address.fullText = '';

                    if (address.addressLine1) {
                        address.fullText += address.addressLine1 + ' ';
                    }

                    if (address.addressLine2) {
                        address.fullText += address.addressLine2 + ' ';
                    }

                    if (address.city) {
                        address.fullText += address.city + ' ';
                    }

                    if (address.zip) {
                        address.fullText += address.zip;
                    }
                }

                let regionUniqueCheckFlag = true;

                for (let k = 0; k < this.regions.length; k++) {
                    if (!this.profileData.Facilities[k] || !this.profileData.Facilities[k].address) {
                        continue;
                    }
                    if (this.regions[k].country === this.profileData.Facilities[k].address.country) {
                        regionUniqueCheckFlag = false;
                        break;
                    }
                }

                if ((this.regions.length === 0 || regionUniqueCheckFlag) && address && address.country) {
                    this.regions.push({
                        countryCode: this.getCountryCode(address.country),
                        country: address.country
                    });
                }

                const standard = certificateList || [];

                if (facility && Array.isArray(facility)) {
                    for (const _facility of facility) {
                        if (this.valueProcesses.indexOf(_facility) === -1) {
                            this.valueProcesses.push(_facility);
                        }
                    }
                }

                if (material && Array.isArray(material)) {
                    for (const _material of material) {
                        if (this.materials.indexOf(_material) === -1) {
                            this.materials.push(_material);
                        }
                    }
                }

                if (standard && Array.isArray(standard)) {
                    for (const _standard of standard) {
                        this.standards.push(_standard);
                    }
                }
            }
        }
        this.supplierModal.show();
    }

    getScorePercent(obtained, total) {
        if (total === 0) {
            return total;
        }
        let scorePercent = (obtained / total) * 100;
        scorePercent = Math.round(scorePercent * 10) / 10;
        return scorePercent;
    }

    handleFilterSelection(init = false) {
        this.analyticsService.trackEvent('Filter', {
            Origin: 'Map Page',
            Action: 'Filter used'
        });
        this.resetPagination();
        if (this.getMapDetails) {
            this.getMapDetails.unsubscribe();
        }
        this.initMap();
        this.fetchMapFilters(this.getSearchPayload());
        this.getAllFacilities(init);
    }

    resetPagination(): void {
        this.getMapDetails?.unsubscribe();
        this.pagination = {
            from: 0,
            size: 10000
        };
    }

    refreshFilter(): void {
        this.fetchMapFilters(this.getSearchPayload());
    }
}
