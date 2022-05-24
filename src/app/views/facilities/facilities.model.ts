import { Facility, MasterData } from '../suppliers/sub-supplier-details/sub-supplier-profile.model';

export interface IFacilityProfile {
    id: string;
    supplier_facility_id: string;
    name: string;
    supplier_id: string;
    company_id: string;
    supplier_name: string;
    is_sub_supplier: boolean;
    standards?: IStandards[];
    launched_assessment_count?: number;
    address_country?: string;
    address_state?: string;
    address_city?: string;
}
export interface IFacilityProfileResponse {
    facility: Facility;
    masterData: MasterData[];
}
export interface IFacilityListResponse {
    customFieldDisplayList: string;
    searchResponse: IFacilityProfile[];
    totalCount: number;
}
export interface IFacilityProfileFilter {
    Country: IFilterObject;
    Materials: IFilterObject;
    Standards: IFilterObject;
    Suppliername: IFilterObject;
    Valueprocess: IFilterObject;
}
export interface IFilterObject {
    id: string;
    value: string;
}
export interface IStandards {
    id: string;
    value: string;
}
export interface Filters {
    filter: string;
    sortBy: string;
}
export type tabs = null | 'sub_suppliers_facility';
