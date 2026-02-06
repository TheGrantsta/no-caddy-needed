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
                borderLeftColor: colours.green,
                borderLeftWidth: 10,
                backgroundColor: colours.yellow,
            },
        });
    };

    const showError = (message: string) => {
        toast.show(message, {
            type: 'danger',
            textStyle: { color: colours.background, fontSize: fontSizes.normal, padding: 5, width: '100%' },
            style: {
                borderLeftColor: colours.errorText,
                borderLeftWidth: 10,
                backgroundColor: colours.yellow,
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

    return { showSuccess, showError, showResult };
};
