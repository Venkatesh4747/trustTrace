export interface ITtTable {
    headers: string[];
    rows: ITableDataRows[];
    isHaveRoute: boolean;
}

export interface ITableDataRows {
    cells: ITableDataCell[];
    routerLink?: string[];
}

export class ITableDataCell {
    constructor(
        public content: string,
        public contentType: ContentType,
        public contentWrapStyle?: contentWrapStyle,
        public tooltip?: string,
        public customStyleClassName: string = ''
    ) {}
}

export type ContentType = 'TEXT' | 'ICON';

export type contentWrapStyle = 'WORD_WRAP' | 'WITH_DOTS';
