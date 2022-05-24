export type ApplicationMenuSubscription = {
    [key in SubscriptionType]: INavigationMenus;
};

export type SubscriptionType =
    | 'RETAILER'
    | 'BRAND_SUPP'
    | 'BRAND'
    | 'SUPPLIER'
    | 'FASHION_BRAND_SUPP'
    | 'FOOD_SUPPLIER';

export interface INavigationMenus {
    default_landing: string; // path
    sideNavigationMenus: ISideNavigation[];
    topNavigationMenus: INavigation[];
}

export interface INavigation {
    title: string;
    route_url: string;
    icon: string;
    authorities?: string[];
}

export interface ISideNavigation extends INavigation {
    childUrls?: string[];
    children?: ISideNavigation[];
}
