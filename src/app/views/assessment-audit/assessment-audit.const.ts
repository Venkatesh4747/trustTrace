export const NORMALISED_RATINGS = ['A', 'B', 'C', 'D', 'E'];
export type INormalisedRatings = 'A' | 'B' | 'C' | 'D' | 'E';

export const extractionStatus = {
    EXTRACTION_PENDING: 10,
    VERIFICATION_PENDING: 20,
    FAILED: 30,
    COMPLETED: 35,
    DELETED: 40
};

export type IExtractionStatus = 10 | 20 | 30 | 35 | 40;
