import { useToast } from 'react-native-toast-notifications';
import { useThemeColours } from '@/context/ThemeContext';
import fontSizes from '@/assets/font-sizes';

export const useAppToast = () => {
    const toast = useToast();
    const colours = useThemeColours();

    const showSuccess = (message: string) => {
        toast.show(message, {
            type: 'success',
            textStyle: { color: colours.background, fontSize: fontSizes.normal, padding: 5, width: '100%' },
            style: {
                borderLeftColor: colours.tertiary,
                borderLeftWidth: 10,
                backgroundColor: colours.primary,
            },
        });
    };

    const showError = (message: string) => {
        toast.show(message, {
            type: 'danger',
            textStyle: { color: colours.background, fontSize: fontSizes.normal, padding: 5, width: '100%' },
            style: {
                borderLeftColor: colours.red,
                borderLeftWidth: 10,
                backgroundColor: colours.primary,
            },
        });
    };

    const showInfo = (message: string) => {
        toast.show(message, {
            type: 'normal',
            textStyle: { color: colours.text, fontSize: fontSizes.normal, padding: 5, width: '100%' },
            style: {
                borderLeftColor: colours.tertiary,
                borderLeftWidth: 10,
                backgroundColor: colours.background,
            },
        });
    };

    const showResult = (success: boolean, successMessage: string, errorMessage: string) => {
        if (success) {
            showSuccess(successMessage);
        } else {
            showError(errorMessage);
        }
    };

    return { showSuccess, showError, showInfo, showResult };
};
