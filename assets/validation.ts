export const VALIDATION_ERRORS = {
    REQUIRED: 'is required',
    CANNOT_BE_EMPTY: 'cannot be empty',
    INVALID_FORMAT: 'has invalid format',
} as const;

export function validateNonEmpty(value: string, fieldName: string): string {
    return !value.trim() ? `${fieldName} ${VALIDATION_ERRORS.REQUIRED}` : '';
}

export function validateNumber(value: string, fieldName: string): string {
    if (!value.trim()) {
        return `${fieldName} ${VALIDATION_ERRORS.CANNOT_BE_EMPTY}`;
    }
    if (isNaN(parseFloat(value))) {
        return `${fieldName} ${VALIDATION_ERRORS.INVALID_FORMAT}`;
    }
    return '';
}
