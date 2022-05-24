import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AnalyticsService } from '../../../core/analytics/analytics.service';
import { LocalizationService } from '../../../shared/utils/localization.service';
import { CommonServices } from '../../../shared/commonServices/common.service';
import { UtilsService } from '../../../shared/utils/utils.service';
import { SuppliersService } from '../suppliers.service';
import { MasterData, SubSupplierProfile } from './sub-supplier-profile.model';
import { CustomToastrService } from '../../../shared/commonServices/custom-toastr.service';
import { environment } from '../../../../environments/environment';
import { SUB_SUPPLIER_CONSTANTS } from '../suppliers.const';
import { HttpErrorResponse } from '@angular/common/http';
import { FacilitiesService } from '../../facilities/facilities.service';
@Component({
    selector: 'app-sub-supplier-details',
    templateUrl: './sub-supplier-details.component.html',
    styleUrls: ['./sub-supplier-details.component.scss']
})
export class SubSupplierDetailsComponent implements OnInit {
    profileDetails: SubSupplierProfile;
    pageLoading = true;
    facilitiesCount = 0;
    ratings: number[];
    SUB_SUPPLIER_CONSTANTS = SUB_SUPPLIER_CONSTANTS;
    masterData: MasterData[];
    masterStandards: MasterData[];
    env = environment;
    supplierId: string;
    supplierCompanyId: string;
    facilityCompanyId: string;
    isFacilityProfile: boolean;

    get getcdnImage(): (fileName: string) => string {
        return this.utilService.getcdnImage.bind(this.utilService);
    }

    get goBack(): () => void {
        return this.commonServices.goBack.bind(this.commonServices);
    }
    constructor(
        private route: ActivatedRoute,
        private supplierService: SuppliersService,
        private utilService: UtilsService,
        private commonServices: CommonServices,
        private localeService: LocalizationService,
        private analyticsService: AnalyticsService,
        private toastr: CustomToastrService,
        private facilitiesService: FacilitiesService
    ) {
        this.profileDetails = {
            id: null,
            supplierUid: null,
            name: '',
            description: '',
            associatedSince: '',
            contactInfo: { name: '', phoneNumber: '', email: '' },
            employeeCount: { men: '0', women: '0', others: '0', total: '0' },
            valueProcess: [],
            materials: [],
            certifications: [],
            address: {
                addressLine1: '',
                addressLine2: '',
                city: '',
                state: '',
                country: '',
                zip: ''
            },
            qualityRating: 0
        };
    }

    ngOnInit(): void {
        if (this.route.snapshot.paramMap.get(SUB_SUPPLIER_CONSTANTS.FACILITY_ID)) {
            this.getFacilityProfile();
        } else {
            this.getSupplierProfile();
        }
    }

    private getSupplierProfile(): void {
        this.isFacilityProfile = false;
        this.supplierId = this.route.snapshot.paramMap.get('supplierId');
        this.supplierCompanyId = this.route.snapshot.paramMap.get('supplierCompanyId');
        this.ratings = [];
        this.supplierService.getSubSupplierProfile(this.supplierId, this.supplierCompanyId).subscribe(
            response => {
                const subSuppliers = response.data;
                Object.keys(subSuppliers.supplier).forEach(key => {
                    if (subSuppliers.supplier[key]) {
                        this.profileDetails[key] = subSuppliers.supplier[key];
                    }
                });
                this.updateFacilities();

                this.masterData = subSuppliers.masterData;
                this.localeService.addToMasterData(subSuppliers.masterData);
                this.masterStandards = this.localeService.getcertifications(this.masterData);
                this.updateRatings();
                this.analyticsService.trackEvent('Sub Supplier Details Page', {
                    Origin: 'Sub Suppliers Page',
                    SupplierId: this.supplierId,
                    Action: 'Sub suppliers details page visited'
                });
                if (this.profileDetails.facilities) {
                    this.facilitiesCount = this.profileDetails.facilities.length;
                }
                this.pageLoading = false;
            },
            failResponse => {
                this.failResponse(failResponse);
            }
        );
    }

    private getFacilityProfile(): void {
        this.isFacilityProfile = true;
        this.supplierId = this.route.snapshot.paramMap.get(SUB_SUPPLIER_CONSTANTS.FACILITY_ID);
        this.facilityCompanyId = this.route.snapshot.paramMap.get('companyId');
        this.ratings = [];
        this.facilitiesService.getSubSupplierFacility(this.supplierId, this.facilityCompanyId).subscribe(
            response => {
                const facilityProfile = response;
                Object.keys(facilityProfile.facility).forEach(key => {
                    if (facilityProfile.facility[key]) {
                        this.profileDetails[key] = facilityProfile.facility[key];
                    }
                });
                if (facilityProfile.facility.certificateList.length) {
                    this.profileDetails.certifications = facilityProfile.facility.certificateList;
                }
                this.masterData = facilityProfile.masterData;
                this.localeService.addToMasterData(facilityProfile.masterData);
                this.masterStandards = this.localeService.getcertifications(this.masterData);
                this.updateRatings();
                this.analyticsService.trackEvent('Sub Supplier Facilities Details Page', {
                    Origin: 'Sub Supplier Facilities Page',
                    FacilityId: facilityProfile.facility.id,
                    Action: 'facilities details page visited'
                });
                this.pageLoading = false;
            },
            failResponse => {
                this.failResponse(failResponse);
            }
        );
    }

    private failResponse(failResponse: HttpErrorResponse): void {
        if (failResponse.status === 403) {
            this.toastr.info(this.env.error_messages.no_authorization, 'Insufficient Permission');
        } else {
            this.toastr.error(
                environment.error_messages.could_not_fetch_data.message,
                environment.error_messages.could_not_fetch_data.title
            );
        }
        this.pageLoading = false;
    }

    private updateFacilities(): void {
        this.profileDetails?.facilities
            .map(facility => {
                return facility.certificateList;
            })
            .forEach(certificate => this.profileDetails.certifications.push(...certificate));
    }

    private updateRatings(): void {
        for (let index = 5; index > 0; index--) {
            if (index <= Number(this.profileDetails.qualityRating)) {
                this.ratings.push(index);
            } else {
                this.ratings.push(0);
            }
        }
    }
}
