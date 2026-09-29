import { renderHook, act } from '@testing-library/react-native';
import { useForm } from '../../hooks/useForm';

describe('useForm', () => {
    it('initializes form fields with provided values', () => {
        const initialValues = { name: '', email: '' };
        const { result } = renderHook(() => useForm(initialValues));
        const [formState] = result.current;

        expect(formState.name.value).toBe('');
        expect(formState.email.value).toBe('');
        expect(formState.name.error).toBe('');
        expect(formState.email.error).toBe('');
    });

    it('updates field value on onChange', () => {
        const initialValues = { name: '', email: '' };
        const { result } = renderHook(() => useForm(initialValues));
        const [formState] = result.current;

        act(() => {
            formState.name.onChange('John');
        });

        expect(result.current[0].name.value).toBe('John');
    });

    it('clears error when field changes', () => {
        const initialValues = { name: '', email: '' };
        const { result } = renderHook(() => useForm(initialValues));

        act(() => {
            result.current[0].name.setError('Name is required');
        });

        expect(result.current[0].name.error).toBe('Name is required');

        act(() => {
            result.current[0].name.onChange('John');
        });

        expect(result.current[0].name.error).toBe('');
    });

    it('sets error on field', () => {
        const initialValues = { name: '' };
        const { result } = renderHook(() => useForm(initialValues));
        const [formState] = result.current;

        act(() => {
            formState.name.setError('This field is required');
        });

        expect(result.current[0].name.error).toBe('This field is required');
    });

    it('clears single field', () => {
        const initialValues = { name: 'John', email: 'john@example.com' };
        const { result } = renderHook(() => useForm(initialValues));
        const [formState] = result.current;

        act(() => {
            formState.name.onChange('Jane');
            formState.name.setError('Error');
        });

        expect(result.current[0].name.value).toBe('Jane');
        expect(result.current[0].name.error).toBe('Error');

        act(() => {
            formState.name.clear();
        });

        expect(result.current[0].name.value).toBe('John');
        expect(result.current[0].name.error).toBe('');
    });

    it('resets entire form', () => {
        const initialValues = { name: 'John', email: 'john@example.com' };
        const { result } = renderHook(() => useForm(initialValues));
        const [, reset] = result.current;

        act(() => {
            result.current[0].name.onChange('Jane');
            result.current[0].email.setError('Invalid email');
        });

        expect(result.current[0].name.value).toBe('Jane');
        expect(result.current[0].email.error).toBe('Invalid email');

        act(() => {
            reset();
        });

        expect(result.current[0].name.value).toBe('John');
        expect(result.current[0].email.value).toBe('john@example.com');
        expect(result.current[0].email.error).toBe('');
    });

    it('works with multiple field types', () => {
        const initialValues = { name: '', age: 0, subscribed: false };
        const { result } = renderHook(() => useForm(initialValues));
        const [formState] = result.current;

        act(() => {
            formState.name.onChange('Alice');
            formState.age.onChange(30);
            formState.subscribed.onChange(true);
        });

        expect(result.current[0].name.value).toBe('Alice');
        expect(result.current[0].age.value).toBe(30);
        expect(result.current[0].subscribed.value).toBe(true);
    });
});
