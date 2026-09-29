import { useState, useCallback } from 'react';

export function useToggle(initialValue: boolean = false): [boolean, () => void, (value: boolean) => void] {
    const [value, setValue] = useState(initialValue);
    const toggle = useCallback(() => setValue(v => !v), []);
    const setDirectly = useCallback((newValue: boolean) => setValue(newValue), []);
    return [value, toggle, setDirectly];
}
