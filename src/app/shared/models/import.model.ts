export interface IImportApiResponse {
    status: string;
    message?: string;
    data: IImportStatus | null;
}

export interface IImportMetrics {
    conflict: number;
    total: number;
    success: number;
    failure: number;
    skipped: number;
}
export interface IImportError {
    sheetName: string;
    row: string;
    field: string;
    errorMsg: string;
}
export interface IImportStatus {
    errors: IImportError[];
    metrics: IImportMetrics;
    status: string;
    phase: string;
}

export const steps = {
    SELECTION: 'SELECTION',
    CREATE: 'CREATE',
    UPDATE: 'UPDATE'
};

export interface IDialogData {
    titles: {
        createTitle: string;
        updateTitle: string;
    };
    create: {
        texts: {
            title: string;
            downloadText: string;
            downloadBtnText: string;
            editText: string;
            uploadText: string;
        };
        fileName: string;
        downloadCallBack: Function;
        importCallBack: Function;
    };
    update: {
        texts: {
            title: string;
            downloadText: string;
            downloadBtnText: string;
            editText: string;
            uploadText: string;
        };
        fileName: string;
        downloadCallBack: Function;
        importCallBack: Function;
    };
    btnTexts: {
        primaryBtnText: string;
        secondaryBtnText: string;
    };
    handleUploadCompleteCallBack: Function;
    step: string;
}
