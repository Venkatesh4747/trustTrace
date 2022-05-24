export interface City {
    country?: { id: string; name: string; emoji: string };
    countryCode?: string;
    countryId?: number;
    cityId?: number;
    id?: string;
    name: string;
    latitude: string;
    longitude: string;
    state?: { id: number; name: string };
    stateCode?: string;
    stateId?: number;
    stateObjId?: string;
    countryObjId?: string;
    stateName?: string | null;
    countryName?: string | null;
}

export interface State {
    id?: string;
    name: string;
    countryCode: string;
    stateCode?: string;
    stateId?: number;
    latitude: string;
    longitude: string;
    countryId: number;
    countryObjId?: string;
    country?: { id: string; name: string };
}

export interface Country {
    id?: string;
    countryId?: number;
    name: string;
    iso3: string;
    iso2: string;
    phone_code: string;
    capital: string;
    currency: string;
    native: string;
    region: string;
    subregion: string;
    translations?: { [key: string]: string };
    latitude: string;
    longitude: string;
    emoji?: string;
    emojiU?: string;
}

type Fields = { [key: string]: boolean } | string[];
interface Where {
    name?: {
        like: string;
        options: string;
    };
    status?: string;
}
interface Include {
    relation: string;
    scope: {
        fields: Fields;
    };
}
export interface IGeoPayload {
    offset?: number;
    limit?: number;
    fields?: Fields;
    include?: Include[];
    where?: Where;
}
export enum Response {
    Success = 'success',
    Fail = 'fail'
}

export enum formValidators {
    PATTERN = 'pattern',
    REQUIRED = 'required',
    ISEXISTS = 'isExists',
    NOTEXISTS = 'notExists',
    MINLENGTH = 'minlength',
    MAXLENGTH = 'maxlength'
}

export interface IGeoUrl {
    getCities?: string;
    getCitiesBasedOnCountry?: string;
    getCitiesBasedOnState?: string;
    getCountries?: string;
    getStatesBasedOnCountryId?: (string) => string;
    getRegions?: string;
    getSubRegions?: string;
    getStates?: string;
    onImport?: string;
    getImportCount?: string;
    getImportDetails?: string;
}

export interface ImportTrigger {
    userEmail: string;
}
