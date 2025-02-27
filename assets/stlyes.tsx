import { StyleSheet } from 'react-native';
import colours from './colours';
import fontSizes from './font-sizes';

const styles = StyleSheet.create({
    flexOne: {
        flex: 1,
    },
    marginTop: {
        marginTop: 10,
    },
    marginBottom: {
        marginBottom: 10,
    },
    scrollContainer: {
        flex: 1,
        backgroundColor: colours.background,
    },
    viewContainer: {
        alignItems: 'center',
    },
    principlesContainer: {
        flexDirection: 'row',
        marginTop: 10,
        paddingBottom: 5,
        paddingLeft: 30,
        paddingRight: 5,
        width: '95%',
    },
    container: {
        flex: 1,
        backgroundColor: colours.background,
    },
    headerContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    iconsContainer: {
        backgroundColor: colours.background,
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-evenly',
        alignItems: 'center',
        width: '100%',
        paddingHorizontal: 2,
    },
    iconContainer: {
        padding: 15,
    },
    headerText: {
        color: colours.yellow,
        fontSize: fontSizes.header,
        alignItems: 'center',
        padding: 8,
    },
    subHeaderText: {
        color: colours.yellow,
        fontSize: fontSizes.subHeader,
        alignItems: 'baseline',
        padding: 6,
    },
    normalText: {
        color: colours.text,
        fontSize: fontSizes.normal,
        alignItems: 'center',
    },
    smallestText: {
        color: colours.text,
        fontSize: fontSizes.smallestText,
        alignItems: 'center',
        padding: 5,
    },
    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.85)', // Transparent black
        zIndex: 1000,
    },
    overlayText: {
        color: colours.white,
        fontSize: fontSizes.normal,
        paddingBottom: 20,
        paddingLeft: 10,
        alignItems: 'center',
    },
    buttonContainer: {
        margin: 8,
        alignItems: 'center',
        alignContent: 'center',
        flexDirection: 'row',
    },
    button: {
        backgroundColor: colours.yellow,
        padding: 10,
        borderRadius: 8,
        width: 100,
        alignItems: 'center',
        margin: 5,
    },
    buttonText: {
        color: colours.background,
        fontSize: fontSizes.tableHeader,
        fontWeight: 'bold',
    },
    yellowText: {
        color: colours.yellow,
    },
    deleteBackground: {
        backgroundColor: colours.backgroundDelete,
        position: 'absolute',
        right: 0,
        left: 0,
        top: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'flex-end',
        width: '90%',
    },
    deleteText: {
        color: colours.white,
        fontSize: fontSizes.normal,
        fontWeight: 'bold',
        padding: 2,
    },
    cardRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 2,
    },
    card: {
        backgroundColor: colours.background,
        paddingTop: 3,
        width: '90%',
    },
    cardText: {
        flex: 1,
        color: colours.text,
        fontSize: fontSizes.smallText,
        paddingLeft: 2,
    },
    cardIcon: {
        paddingBottom: 1,
    },
    textarea: {
        height: 150,
        borderColor: colours.border,
        borderWidth: 1,
        padding: 10,
        borderRadius: 5,
        backgroundColor: colours.backgroundLight,
        fontSize: fontSizes.normal,
    },
    textareaError: {
        borderColor: colours.borderError,
    },
    errorText: {
        color: colours.errorText,
        fontSize: fontSizes.normal,
        marginTop: 5,
    },
    textLabel: {
        fontSize: fontSizes.smallText,
        color: colours.white,
        margin: 5,
    },
    textInput: {
        height: 40,
        borderColor: colours.border,
        borderWidth: 1,
        borderRadius: 5,
        paddingHorizontal: 10,
        fontSize: fontSizes.smallText,
        color: colours.white,
    },
    textInputError: {
        borderColor: colours.borderError,
    },
    table: {
        marginTop: 20,
        marginLeft: 20,
        marginRight: 20,
        marginBottom: 5,
        borderWidth: 1,
        borderColor: colours.border,
    },
    row: {
        flexDirection: 'row',
    },
    alternateRow: {
        backgroundColor: colours.backgroundAlternate,
        color: colours.black,
    },
    cell: {
        flex: 4,
        borderWidth: 1,
        borderColor: colours.border,
        padding: 10,
        textAlign: 'center',
        color: colours.white,
        fontSize: fontSizes.smallText,
        fontWeight: 'bold',
    },
    header: {
        color: colours.yellow,
        fontSize: fontSizes.tableHeader,
        fontWeight: 'bold',
    },
    bold: {
        fontWeight: 'bold',
    },
    spinnerContainer: {
        marginTop: 16,
        alignItems: 'center',
    },
    updateOverlay: {
        width: '100%',
        backgroundColor: colours.background,
    },
    updateText: {
        color: colours.yellow,
        marginTop: 5,
        fontSize: fontSizes.normal,
        textAlign: 'center',
    },
});

export default styles;
