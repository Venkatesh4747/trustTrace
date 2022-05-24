export interface ISearchPayload {
    filter: any;
    sort: ISort;
    pagination: IPagination;
}

export interface ISort {
    sortBy: 'create_ts' | 'status';
    sortOrder: 'desc' | 'asc';
}

export interface IPagination {
    from: number;
    size: number;
}
