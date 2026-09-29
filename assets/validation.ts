export const VALIDATION_ERRORS = {
    REQUIRED: 'is required',
    CANNOT_BE_EMPTY: 'cannot be empty',
    INVALID_FORMAT: 'has invalid format',
    MUST_BE_POSITIVE: 'must be a positive number',
} as const;

export function validateNonEmpty(value: string, fieldName: string): string {
    return !value.trim() ? `${fieldName} ${VALIDATION_ERRORS.REQUIRED}` : '';
}

export function validatePositiveNumber(value: string | number, fieldName: string): string {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(num) || num <= 0) {
        return `${fieldName} ${VALIDATION_ERRORS.MUST_BE_POSITIVE}`;
    }
    return '';
}

export function validateRange(value: string, fieldName: string): string {
    if (!value.trim()) {
        return `${fieldName} ${VALIDATION_ERRORS.CANNOT_BE_EMPTY}`;
    }
    // Validates format like "30-100"
    if (!/^\d+-\d+$/.test(value.trim())) {
        return `${fieldName} ${VALIDATION_ERRORS.INVALID_FORMAT}`;
    }
    return '';
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

export function clearError(currentError: string): string {
    return currentError ? '' : currentError;
}
