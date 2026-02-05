import { Dimensions, StyleSheet } from 'react-native';
import colours, { ThemeColours } from './colours';
import fontSizes from './font-sizes';

export const createStyles = (c: ThemeColours) => StyleSheet.create({
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
        backgroundColor: c.background,
    },
    scrollContentContainer: {
        paddingBottom: 100,
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
        backgroundColor: c.background,
    },
    headerContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    iconsContainer: {
        backgroundColor: c.background,
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
    wrapper: {
        borderColor: c.border,
        borderWidth: 2,
        borderRadius: 10,
        marginTop: 10
    },
    headerText: {
        color: c.yellow,
        fontSize: fontSizes.header,
        alignItems: 'center',
        padding: 8,
    },
    subHeaderText: {
        color: c.yellow,
        fontSize: fontSizes.subHeader,
        alignItems: 'baseline',
        padding: 6,
    },
    normalText: {
        color: c.text,
        fontSize: fontSizes.normal,
        alignItems: 'center',
    },
    smallestText: {
        color: c.text,
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
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        zIndex: 1000,
    },
    overlayText: {
        color: c.white,
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
    largeButton: {
        backgroundColor: c.yellow,
        padding: 10,
        borderRadius: 8,
        width: '90%',
        alignItems: 'center',
        margin: 5,
    },
    button: {
        backgroundColor: c.yellow,
        padding: 10,
        borderRadius: 8,
        width: 100,
        alignItems: 'center',
        margin: 5,
    },
    buttonText: {
        color: c.background,
        fontSize: fontSizes.tableHeader,
        fontWeight: 'bold',
    },
    yellowText: {
        color: c.yellow,
    },
    deleteBackground: {
        backgroundColor: c.backgroundDelete,
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
        color: c.white,
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
        backgroundColor: c.background,
        paddingTop: 3,
        width: '90%',
    },
    cardText: {
        flex: 1,
        color: c.text,
        fontSize: fontSizes.smallText,
        paddingLeft: 2,
    },
    cardIcon: {
        paddingBottom: 1,
    },
    textarea: {
        height: 150,
        borderColor: c.border,
        borderWidth: 1,
        padding: 10,
        borderRadius: 5,
        backgroundColor: c.backgroundLight,
        fontSize: fontSizes.normal,
    },
    textareaError: {
        borderColor: c.borderError,
    },
    errorText: {
        color: c.errorText,
        fontSize: fontSizes.normal,
        marginTop: 5,
    },
    textLabel: {
        fontSize: fontSizes.smallText,
        color: c.white,
        margin: 5,
    },
    textInput: {
        height: 40,
        borderColor: c.border,
        borderWidth: 1,
        borderRadius: 5,
        paddingHorizontal: 10,
        fontSize: fontSizes.smallText,
        color: c.white,
    },
    textInputError: {
        borderColor: c.borderError,
    },
    table: {
        marginTop: 20,
        marginLeft: 20,
        marginRight: 20,
        marginBottom: 5,
        borderWidth: 1,
        borderColor: c.border,
    },
    row: {
        flexDirection: 'row',
    },
    alternateRow: {
        backgroundColor: c.backgroundAlternate,
        color: c.black,
    },
    cell: {
        flex: 4,
        borderWidth: 1,
        borderColor: c.border,
        padding: 10,
        textAlign: 'center',
        color: c.white,
        fontSize: fontSizes.smallText,
        fontWeight: 'bold',
    },
    header: {
        color: c.yellow,
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
        backgroundColor: c.background,
    },
    updateText: {
        color: c.yellow,
        marginTop: 5,
        fontSize: fontSizes.normal,
        textAlign: 'center',
    },
    scrollWrapper: {
        margin: 5,
        borderRadius: 5,
        borderColor: c.yellow,
        borderWidth: 2,
        borderLeftColor: c.yellow,
        borderLeftWidth: 10,
    },
    horizontalScrollContainer: {
        flex: 1,
        justifyContent: 'center',
        marginTop: 10,
    },
    scrollItemContainer: {
        width: Dimensions.get('window').width,
        height: 300,
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollItemText: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    scrollIndicatorContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 20,
        marginBottom: 10,
    },
    scrollIndicatorDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: c.backgroundAlternate,
        marginHorizontal: 5,
        borderColor: c.backgroundAlternate,
        borderWidth: 1,
    },
    scrollActiveDot: {
        backgroundColor: c.yellow,
        borderColor: c.yellow,
    },
});

export default createStyles(colours);
