import { useState, useCallback } from 'react';

export interface FormField<T> {
    value: T;
    error: string;
    onChange: (newValue: T) => void;
    setError: (error: string) => void;
    clear: () => void;
}

export type FormState<T extends Record<string, any>> = {
    [K in keyof T]: FormField<T[K]>;
};

export function useForm<T extends Record<string, any>>(
    initialValues: T
): [FormState<T>, () => void] {
    const [values, setValues] = useState(initialValues);
    const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});

    const createField = useCallback(
        (key: keyof T): FormField<T[keyof T]> => ({
            value: values[key],
            error: errors[key] || '',
            onChange: (newValue: T[keyof T]) => {
                setValues(prev => ({ ...prev, [key]: newValue }));
                if (errors[key]) {
                    setErrors(prev => ({ ...prev, [key]: '' }));
                }
            },
            setError: (error: string) => {
                setErrors(prev => ({ ...prev, [key]: error }));
            },
            clear: () => {
                setValues(prev => ({ ...prev, [key]: initialValues[key] }));
                setErrors(prev => ({ ...prev, [key]: '' }));
            },
        }),
        [values, errors, initialValues]
    );

    const reset = useCallback(() => {
        setValues(initialValues);
        setErrors({});
    }, [initialValues]);

    const formState = Object.keys(initialValues).reduce(
        (acc, key) => {
            acc[key as keyof T] = createField(key as keyof T);
            return acc;
        },
        {} as FormState<T>
    );

    return [formState, reset];
}
