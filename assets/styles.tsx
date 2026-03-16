import { Dimensions, StyleSheet } from 'react-native';
import colours, { ThemeColours } from './colours';
import fontSizes from './font-sizes';

export const createStyles = (c: ThemeColours) => ({
    // Global flat styles — backward-compatible
    ...StyleSheet.create({
        flexOne: {
            flex: 1,
        },
        header: {
            paddingTop: 32,
            paddingHorizontal: 24,
            paddingBottom: 4,
            alignItems: 'center',
        },
        titleRow: {
            flexDirection: 'row',
            alignItems: 'center',
            alignSelf: 'flex-start',
            gap: 10,
            marginBottom: 8,
        },
        titleText: {
            color: colours.primary,
            fontSize: fontSizes.header,
            fontWeight: 'bold',
            padding: 8,
            textAlign: 'left',
        },
        subtitleText: {
            color: colours.text,
            fontSize: fontSizes.normal,
            textAlign: 'left',
        },
        divider: {
            height: 1,
            backgroundColor: colours.primary,
            opacity: 0.2,
            marginHorizontal: 24,
            marginTop: 20,
            marginBottom: 4,
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
        headerText: {
            color: c.primary,
            fontSize: fontSizes.subHeader,
            fontWeight: 'bold',
            alignItems: 'baseline',
            padding: 6,
        },
        subHeaderText: {
            color: c.primary,
            fontSize: fontSizes.subHeader,
            fontWeight: 'bold',
            alignItems: 'baseline',
            padding: 6,
        },
        normalText: {
            color: c.text,
            fontSize: fontSizes.normal,
            alignItems: 'center',
        },
        smallText: {
            color: c.text,
            fontSize: fontSizes.smallText,
            alignItems: 'center',
            padding: 5,
        },
        smallestText: {
            color: c.text,
            fontSize: fontSizes.smallestText,
            alignItems: 'center',
            padding: 5,
        },
        contentSection: {
            marginHorizontal: 8,
            marginTop: 20,
            borderRadius: 14,
            padding: 16,
            borderWidth: 1,
            borderColor: colours.primary + '33',
        },
        buttonContainer: {
            margin: 8,
            alignItems: 'center',
            alignContent: 'center',
            flexDirection: 'row',
        },
        largeButton: {
            backgroundColor: c.primary,
            padding: 10,
            borderRadius: 8,
            width: '90%',
            alignItems: 'center',
            margin: 5,
        },
        mediumButton: {
            backgroundColor: c.primary,
            padding: 10,
            borderRadius: 8,
            width: '35%',
            alignItems: 'center',
            margin: 5,
        },
        button: {
            backgroundColor: c.primary,
            padding: 10,
            borderRadius: 8,
            width: 100,
            alignItems: 'center',
            margin: 5,
        },
        buttonText: {
            color: c.white,
            fontSize: fontSizes.tableHeader,
            fontWeight: 'bold',
        },
        yellowText: {
            color: c.primary,
        },
        errorText: {
            color: c.errorText,
            fontSize: fontSizes.smallText,
            marginTop: 5,
        },
        textLabel: {
            fontSize: fontSizes.smallText,
            color: c.primary,
            margin: 5,
        },
        textInput: {
            height: 40,
            borderColor: c.tertiary,
            borderWidth: 1,
            borderRadius: 5,
            paddingHorizontal: 10,
            fontSize: fontSizes.smallText,
            color: c.primary,
        },
        textInputError: {
            borderColor: c.borderError,
        },
        row: {
            flexDirection: 'row',
        },
        cell: {
            flex: 4,
            borderWidth: 1,
            borderColor: c.border,
            padding: 2,
            textAlign: 'center',
            color: c.primary,
            fontSize: fontSizes.smallText,
            fontWeight: 'bold',
        },
        updateOverlay: {
            width: '100%',
            backgroundColor: c.background,
        },
        updateText: {
            color: c.primary,
            marginTop: 5,
            fontSize: fontSizes.normal,
            textAlign: 'center',
        },
        scrollWrapper: {
            margin: 5,
            borderRadius: 5,
            borderColor: c.primary,
            borderWidth: 2,
            borderLeftColor: c.primary,
            borderLeftWidth: 10,
        },
        horizontalScrollContainer: {
            flex: 1,
            justifyContent: 'center',
            marginTop: 10,
        },
        scrollItemContainer: {
            width: Dimensions.get('window').width,
            justifyContent: 'center',
            alignItems: 'center',
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
            backgroundColor: c.black,
            marginHorizontal: 5,
            borderColor: c.black,
            borderWidth: 1,
        },
        scrollActiveDot: {
            backgroundColor: c.red,
            borderColor: c.red,
        },
        navGrid: {
            paddingHorizontal: 8,
            paddingTop: 16,
            gap: 12,
        },
        navRow: {
            flexDirection: 'row',
            gap: 12,
        },
        navCardLink: {
            flex: 1,
        },
        navCard: {
            backgroundColor: colours.primary,
            borderRadius: 16,
            paddingVertical: 28,
            alignItems: 'center',
            justifyContent: 'center',
            gap: 14,
            width: '100%',
        },
        iconCircle: {
            width: 72,
            height: 72,
            borderRadius: 36,
            backgroundColor: colours.secondary,
            alignItems: 'center',
            justifyContent: 'center',
        },
        navCardLabel: {
            color: colours.white,
            fontSize: fontSizes.subHeader,
            fontWeight: '700',
            letterSpacing: 0.3,
        },
    }),

    // Component style groups
    smallButton: StyleSheet.create({
        buttonContainer: {
            width: 175,
            height: 38,
            margin: 5,
            alignItems: 'center',
            justifyContent: 'center',
        },
        button: {
            borderRadius: 10,
            borderColor: c.primary,
            borderWidth: 1,
            backgroundColor: c.mutedYellow,
            width: '100%',
            height: '100%',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'row',
        },
        buttonIcon: {
            paddingRight: 8,
        },
        buttonLabel: {
            color: c.text,
            fontSize: fontSizes.tableHeader,
            fontWeight: 'bold',
        },
        selected: {
            color: c.background,
            backgroundColor: c.primary,
        },
    }),

    subMenu: StyleSheet.create({
        subMenuContainer: {
            padding: 7,
            paddingBottom: 0,
            flexDirection: 'row',
            justifyContent: 'space-evenly',
            backgroundColor: c.background,
            borderBottomWidth: 0.5,
            borderBottomColor: c.primary,
        },
        subMenuItemContainer: {
            flex: 1,
            alignItems: 'center',
        },
        subMenuItemContainerSelected: {
            borderBottomWidth: 4,
            borderBottomColor: c.primary,
        },
        subMenuItem: {
            color: c.primary,
            fontSize: fontSizes.normal,
        },
        subMenuItemSelected: {
            textDecorationColor: c.primary,
            textDecorationStyle: 'solid',
            color: c.primary,
            fontSize: fontSizes.normal,
        },
    }),

    drill: StyleSheet.create({
        contentText: {
            marginTop: 5,
            fontSize: fontSizes.normal,
            color: c.white,
        },
        toggleWrapper: {
            flexDirection: 'row',
            alignItems: 'center',
            width: 150,
        },
        toggleContainer: {
            width: 45,
            height: 15,
            borderRadius: 10,
            backgroundColor: c.backgroundLight,
            justifyContent: 'center',
        },
        toggleOn: {
            backgroundColor: c.primary,
        },
        toggleCircle: {
            width: 20,
            height: 20,
            borderRadius: 10,
            backgroundColor: c.backgroundLight,
            alignSelf: 'flex-start',
        },
        circleOn: {
            alignSelf: 'flex-end',
        },
    }),

    holeScoreInput: StyleSheet.create({
        container: {
            paddingTop: 15,
        },
        holeText: {
            color: c.primary,
            fontSize: fontSizes.header,
            paddingEnd: 10,
        },
        parRow: {
            flexDirection: 'row',
            justifyContent: 'center',
            marginBottom: 10,
        },
        parButton: {
            paddingVertical: 8,
            paddingHorizontal: 16,
            borderWidth: 1,
            borderColor: c.primary,
            marginHorizontal: 5,
            borderRadius: 4,
        },
        parButtonActive: {
            backgroundColor: c.primary,
        },
        parButtonText: {
            color: c.primary,
            fontSize: fontSizes.normal,
            fontWeight: 'bold',
        },
        parButtonTextActive: {
            color: c.background,
        },
        playerRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 15,
            paddingVertical: 5,
        },
        playerName: {
            color: c.primary,
            fontSize: fontSizes.subHeader,
            flex: 1,
        },
        stepperRow: {
            flexDirection: 'row',
            alignItems: 'center',
        },
        stepperButton: {
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: c.primary,
            justifyContent: 'center',
            alignItems: 'center',
        },
        stepperButtonText: {
            color: c.background,
            fontSize: fontSizes.subHeader,
            fontWeight: 'bold',
        },
        scoreText: {
            color: c.text,
            fontSize: fontSizes.header,
            fontWeight: 'bold',
            marginHorizontal: 15,
            minWidth: 30,
            textAlign: 'center',
        },
    }),

    scorecard: StyleSheet.create({
        container: {
            padding: 15,
        },
        totalRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            paddingVertical: 4,
        },
        totalPlayerName: {
            color: c.text,
            fontSize: fontSizes.normal,
        },
        totalScore: {
            color: c.primary,
            fontSize: fontSizes.normal,
            fontWeight: 'bold',
        },
        nineSection: {
            marginTop: 15,
        },
        nineHeader: {
            color: c.primary,
            fontSize: fontSizes.subHeader,
            fontWeight: 'bold',
            marginBottom: 10,
        },
        gridRow: {
            flexDirection: 'row',
            alignItems: 'center',
        },
        labelCell: {
            width: 60,
            paddingVertical: 4,
        },
        holeCell: {
            flex: 1,
            alignItems: 'center',
            paddingVertical: 4,
        },
        holeNumberText: {
            color: c.text,
            fontSize: fontSizes.normal,
        },
        parText: {
            color: c.text,
            fontSize: fontSizes.normal,
        },
        labelText: {
            color: c.text,
            fontSize: fontSizes.normal,
        },
        playerNameText: {
            color: c.text,
            fontSize: fontSizes.normal,
        },
        scoreText: {
            color: c.text,
            fontSize: fontSizes.normal,
            fontWeight: 'bold',
        },
        underParText: {
            color: c.green,
        },
        overParText: {
            color: c.errorText,
        },
        atParText: {
            color: c.primary,
        },
        selectedCell: {
            borderWidth: 2,
            borderColor: c.primary,
            borderRadius: 4,
        },
        roundTotalSection: {
            marginTop: 15,
            borderTopWidth: 1,
            borderTopColor: c.primary,
            paddingTop: 10,
        },
    }),

    roundScorecard: StyleSheet.create({
        container: {
            padding: 15,
        },
        totalScore: {
            color: c.primary,
            fontSize: fontSizes.massive,
            fontWeight: 'bold',
            textAlign: 'center',
            marginBottom: 20,
        },
        nineSection: {
            marginBottom: 15,
        },
        nineHeader: {
            color: c.primary,
            fontSize: fontSizes.subHeader,
            fontWeight: 'bold',
            marginBottom: 10,
        },
        holesGrid: {
            flexDirection: 'row',
            flexWrap: 'wrap',
        },
        holeCell: {
            width: '11.11%',
            alignItems: 'center',
            paddingVertical: 5,
        },
        holeNumber: {
            color: c.text,
            fontSize: fontSizes.smallestText,
        },
        holeScore: {
            color: c.text,
            fontSize: fontSizes.normal,
            fontWeight: 'bold',
        },
        underParText: {
            color: c.green,
        },
        overParText: {
            color: c.errorText,
        },
        nineTotal: {
            color: c.text,
            fontSize: fontSizes.normal,
            textAlign: 'right',
            marginTop: 5,
            borderTopWidth: 0.5,
            borderTopColor: c.primary,
            paddingTop: 5,
        },
    }),

    clubDistanceList: StyleSheet.create({
        container: {
            padding: 15,
        },
        headerRow: {
            flexDirection: 'row',
            borderBottomWidth: 1,
            borderBottomColor: c.primary,
            paddingBottom: 8,
            marginBottom: 5,
        },
        row: {
            flexDirection: 'row',
            paddingVertical: 6,
            borderBottomWidth: 0.5,
            borderBottomColor: c.primary,
        },
        headerCell: {
            color: c.primary,
            fontSize: fontSizes.normal,
            fontWeight: 'bold',
        },
        cell: {
            color: c.text,
            fontSize: fontSizes.normal,
        },
        clubCell: {
            flex: 2,
        },
        distanceCell: {
            flex: 1,
            textAlign: 'right',
        },
        emptyText: {
            color: c.text,
            fontSize: fontSizes.normal,
            textAlign: 'center',
        },
        input: {
            color: c.text,
            fontSize: fontSizes.normal,
            paddingVertical: 4,
        },
        addButton: {
            padding: 10,
            alignItems: 'center',
            marginTop: 10,
        },
        addButtonText: {
            color: c.primary,
            fontSize: fontSizes.normal,
        },
        saveButton: {
            backgroundColor: c.primary,
            padding: 12,
            borderRadius: 8,
            alignItems: 'center',
            marginTop: 10,
        },
        saveButtonText: {
            color: c.background,
            fontSize: fontSizes.tableHeader,
            fontWeight: 'bold',
        },
    }),

    wedgeChart: StyleSheet.create({
        container: {
            padding: 15,
        },
        headerRow: {
            flexDirection: 'row',
            borderBottomWidth: 1,
            borderBottomColor: c.primary,
            paddingBottom: 8,
            marginBottom: 5,
        },
        row: {
            flexDirection: 'row',
            paddingVertical: 6,
            borderBottomWidth: 0.5,
            borderBottomColor: c.primary,
        },
        headerCell: {
            color: c.primary,
            fontSize: fontSizes.normal,
            fontWeight: 'bold',
        },
        headerInput: {
            color: c.primary,
            fontSize: fontSizes.normal,
            fontWeight: 'bold',
            paddingVertical: 4,
        },
        clubCell: {
            flex: 2,
        },
        distanceCell: {
            flex: 1,
            textAlign: 'right',
        },
        input: {
            color: c.text,
            fontSize: fontSizes.normal,
            paddingVertical: 4,
        },
        buttonRow: {
            flexDirection: 'row',
            justifyContent: 'space-around',
            marginTop: 10,
        },
        addButton: {
            padding: 10,
            alignItems: 'center',
        },
        addButtonText: {
            color: c.primary,
            fontSize: fontSizes.normal,
        },
        saveButton: {
            backgroundColor: c.primary,
            padding: 12,
            borderRadius: 8,
            alignItems: 'center',
            marginTop: 10,
        },
        saveButtonText: {
            color: c.background,
            fontSize: fontSizes.tableHeader,
            fontWeight: 'bold',
        },
    }),

    scoreEditor: StyleSheet.create({
        container: {
            padding: 15,
            alignItems: 'center',
        },
        headerText: {
            color: c.primary,
            fontSize: fontSizes.subHeader,
            fontWeight: 'bold',
            marginBottom: 15,
        },
        stepperRow: {
            flexDirection: 'row',
            alignItems: 'center',
        },
        stepperButton: {
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: c.primary,
            justifyContent: 'center',
            alignItems: 'center',
        },
        stepperButtonText: {
            color: c.background,
            fontSize: fontSizes.subHeader,
            fontWeight: 'bold',
        },
        scoreText: {
            color: c.text,
            fontSize: fontSizes.header,
            fontWeight: 'bold',
            marginHorizontal: 15,
            minWidth: 30,
            textAlign: 'center',
        },
    }),

    playerSetup: StyleSheet.create({
        container: {
            padding: 15,
        },
        playerRow: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 10,
        },
        playerName: {
            color: c.primary,
            fontSize: fontSizes.normal,
            fontWeight: 'bold',
        },
        input: {
            flex: 1,
            color: c.text,
            fontSize: fontSizes.normal,
            borderBottomWidth: 1,
            borderBottomColor: c.primary,
            paddingVertical: 5,
        },
        courseNameInput: {
            color: c.text,
            fontSize: fontSizes.normal,
            borderBottomWidth: 1,
            borderBottomColor: c.primary,
            paddingVertical: 5,
            marginBottom: 15,
        },
        removeButton: {
            marginLeft: 10,
            padding: 5,
        },
        removeButtonText: {
            color: c.errorText,
            fontSize: fontSizes.normal,
            fontWeight: 'bold',
        },
        addButton: {
            paddingVertical: 10,
            alignItems: 'center',
        },
        addButtonText: {
            color: c.primary,
            fontSize: fontSizes.normal,
        },
        startButton: {
            backgroundColor: c.primary,
            padding: 12,
            borderRadius: 8,
            alignItems: 'center',
            marginTop: 10,
        },
        startButtonText: {
            color: c.background,
            fontSize: fontSizes.tableHeader,
            fontWeight: 'bold',
        },
        cancelButton: {
            backgroundColor: c.red,
            padding: 12,
            borderRadius: 8,
            alignItems: 'center',
            marginTop: 10,
        },
        cancelButtonText: {
            color: c.white,
            fontSize: fontSizes.tableHeader,
            fontWeight: 'bold',
        },
        recentLabel: {
            color: c.text,
            fontSize: fontSizes.smallText,
            marginBottom: 5,
        },
        recentItem: {
            paddingVertical: 6,
            paddingHorizontal: 10,
        },
        recentItemText: {
            color: c.primary,
            fontSize: fontSizes.normal,
        },
        recentContainer: {
            marginBottom: 10,
        },
        errorText: {
            color: c.red,
            fontSize: fontSizes.smallText,
            marginBottom: 10,
        },
    }),

    onboardingOverlay: StyleSheet.create({
        overlay: {
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
            justifyContent: 'center',
            alignItems: 'center',
            padding: 20,
        },
        container: {
            backgroundColor: c.background,
            borderRadius: 16,
            padding: 24,
            width: '100%',
            maxWidth: 400,
            borderWidth: 2,
            borderColor: c.primary,
        },
        title: {
            color: c.primary,
            fontSize: fontSizes.header,
            fontWeight: 'bold',
            textAlign: 'center',
            marginBottom: 20,
        },
        stepText: {
            color: c.text,
            fontSize: fontSizes.normal,
            textAlign: 'center',
            marginBottom: 24,
            lineHeight: 24,
        },
        indicatorContainer: {
            flexDirection: 'row',
            justifyContent: 'center',
            marginBottom: 20,
        },
        indicator: {
            width: 10,
            height: 10,
            borderRadius: 5,
            marginHorizontal: 4,
        },
        indicatorActive: {
            backgroundColor: c.primary,
        },
        indicatorInactive: {
            backgroundColor: c.backgroundAlternate,
        },
        buttonContainer: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
        },
        primaryButton: {
            backgroundColor: c.primary,
            paddingVertical: 12,
            paddingHorizontal: 24,
            borderRadius: 8,
        },
        primaryButtonText: {
            color: c.background,
            fontSize: fontSizes.normal,
            fontWeight: 'bold',
        },
        secondaryButton: {
            paddingVertical: 12,
            paddingHorizontal: 24,
        },
        secondaryButtonText: {
            color: c.tertiary,
            fontSize: fontSizes.normal,
        },
        spacer: {
            width: 80,
        },
    }),

    deadlySinsTally: StyleSheet.create({
        container: {
            paddingTop: 5,
            paddingLeft: 20,
            paddingRight: 20,
            paddingBottom: 20,
        },
        row: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingVertical: 6,
            borderBottomWidth: 0.5,
            borderColor: c.primary,
        },
        label: {
            color: c.text,
            fontSize: fontSizes.smallText,
            flex: 1,
        },
        controls: {
            flexDirection: 'row',
            alignItems: 'center',
        },
        button: {
            backgroundColor: c.primary,
            width: 24,
            height: 24,
            borderRadius: 12,
        },
        buttonText: {
            color: c.background,
            fontSize: fontSizes.tableHeader,
            fontWeight: 'bold',
            textAlign: 'center',
        },
        count: {
            color: c.text,
            fontSize: fontSizes.subHeader,
            minWidth: 40,
            textAlign: 'center',
        },
        saveButton: {
            backgroundColor: c.primary,
            padding: 12,
            borderRadius: 8,
            alignItems: 'center',
            marginTop: 5,
        },
        saveButtonText: {
            color: c.background,
            fontSize: fontSizes.tableHeader,
            fontWeight: 'bold',
        },
        toggleHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingVertical: 8,
            borderBottomWidth: 0.5,
            borderColor: c.primary,
        },
        toggleLabel: {
            color: c.text,
            fontSize: fontSizes.smallText,
            fontWeight: 'bold',
        },
        chevron: {
            color: c.primary,
            fontSize: fontSizes.subHeader,
        },
    }),

    deadlySinsChart: StyleSheet.create({
        container: {
            padding: 10,
            paddingBottom: 0,
        },
        title: {
            color: c.primary,
            fontSize: fontSizes.subHeader,
            textAlign: 'center',
        },
        barContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 8,
        },
        labelContainer: {
            width: 120,
            paddingRight: 5,
        },
        label: {
            color: c.primary,
            fontSize: fontSizes.smallestText,
        },
        barWrapper: {
            flex: 1,
            flexDirection: 'row',
            height: 20,
            borderRadius: 4,
            overflow: 'hidden',
        },
        bar: {
            height: '100%',
            borderTopLeftRadius: 4,
            borderBottomLeftRadius: 4,
        },
        barBackground: {
            height: '100%',
            backgroundColor: c.backgroundLight,
        },
        countContainer: {
            width: 40,
            alignItems: 'flex-end',
        },
        countText: {
            color: c.primary,
            fontSize: fontSizes.smallText,
            fontWeight: 'bold',
        },
        legend: {
            flexDirection: 'row',
            justifyContent: 'center',
            marginTop: 15,
            paddingTop: 10,
            borderTopWidth: 1,
            borderTopColor: c.primary,
        },
        legendItem: {
            flexDirection: 'row',
            alignItems: 'center',
            marginHorizontal: 10,
        },
        legendDot: {
            width: 10,
            height: 10,
            borderRadius: 5,
            marginRight: 5,
        },
        legendText: {
            color: c.text,
            fontSize: fontSizes.smallestText,
        },
        toggleHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 8,
            borderBottomWidth: 0.5,
            borderColor: c.primary,
        },
        chevron: {
            color: c.primary,
            fontSize: fontSizes.header,
        },
    }),

    drillStatsChart: StyleSheet.create({
        container: {
            padding: 10,
            marginBottom: 10,
        },
        title: {
            color: c.primary,
            fontSize: fontSizes.subHeader,
            marginBottom: 15,
        },
        barContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 8,
        },
        labelContainer: {
            width: 125,
            paddingRight: 5,
        },
        label: {
            color: c.primary,
            fontSize: fontSizes.smallText,
        },
        barWrapper: {
            flex: 1,
            flexDirection: 'row',
            height: 20,
            borderRadius: 4,
            overflow: 'hidden',
        },
        bar: {
            height: '100%',
            borderTopLeftRadius: 4,
            borderBottomLeftRadius: 4,
        },
        barBackground: {
            height: '100%',
            backgroundColor: c.backgroundLight,
        },
        statsContainer: {
            width: 90,
            flexDirection: 'row',
            justifyContent: 'flex-end',
            alignItems: 'center',
        },
        statsText: {
            color: c.primary,
            fontSize: fontSizes.smallText,
            fontWeight: 'bold',
            marginRight: 2,
        },
        countText: {
            color: c.white,
            fontSize: fontSizes.smallText,
        },
        legend: {
            flexDirection: 'row',
            justifyContent: 'center',
            marginTop: 15,
            paddingTop: 10,
            borderTopWidth: 1,
            borderTopColor: c.border,
        },
        legendItem: {
            flexDirection: 'row',
            alignItems: 'center',
            marginHorizontal: 10,
        },
        legendDot: {
            width: 10,
            height: 10,
            borderRadius: 5,
            marginRight: 5,
        },
        legendText: {
            color: c.white,
            fontSize: fontSizes.smallText,
        },
    }),

    networkStatus: StyleSheet.create({
        container: {
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            backgroundColor: c.backgroundAlternate,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: 8,
            paddingHorizontal: 16,
            zIndex: 1000,
        },
        text: {
            color: c.white,
            fontSize: fontSizes.smallText,
            marginLeft: 8,
            fontWeight: '500',
        },
    }),

    instructions: StyleSheet.create({
        contentText: {
            padding: 5,
            margin: 5,
        },
    }),

    themedText: StyleSheet.create({
        default: {
            fontSize: fontSizes.smallText,
            lineHeight: 24,
        },
        defaultSemiBold: {
            fontSize: fontSizes.smallText,
            lineHeight: 24,
            fontWeight: '600',
        },
        title: {
            fontSize: fontSizes.header,
            fontWeight: 'bold',
            lineHeight: 32,
        },
        link: {
            lineHeight: 30,
            fontSize: fontSizes.smallText,
            color: '#0a7ea4',
        },
    }),
    collapsible: StyleSheet.create({
        heading: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
        },
        content: {
            marginTop: 6,
            marginLeft: 24,
        },
    }),

    helloWave: StyleSheet.create({
        text: {
            fontSize: 28,
            lineHeight: 32,
            marginTop: -6,
        },
    }),

    errorBoundary: StyleSheet.create({
        container: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: c.background,
            padding: 20,
        },
        title: {
            fontSize: 24,
            fontWeight: 'bold',
            color: c.text,
            marginBottom: 16,
        },
        message: {
            fontSize: 16,
            color: c.text,
            textAlign: 'center',
            marginBottom: 24,
        },
        button: {
            backgroundColor: c.primary,
            paddingHorizontal: 24,
            paddingVertical: 12,
            borderRadius: 8,
        },
        buttonText: {
            fontSize: 16,
            fontWeight: 'bold',
            color: c.background,
        },
    }),

    playScreen: StyleSheet.create({
        startRoundContainer: {
            padding: 15,
            alignItems: 'center',
        },
        actionButton: {
            backgroundColor: c.primary,
            padding: 12,
            borderRadius: 8,
            alignItems: 'center',
            width: '100%',
            marginTop: 5,
        },
        actionButtonText: {
            color: c.background,
            fontSize: fontSizes.tableHeader,
            fontWeight: 'bold',
        },
        nextHoleButton: {
            backgroundColor: c.primary,
            padding: 12,
            borderRadius: 8,
            alignItems: 'center',
            marginHorizontal: 15,
        },
        nextHoleButtonText: {
            color: c.background,
            fontSize: fontSizes.tableHeader,
            fontWeight: 'bold',
        },
        confirmContainer: {
            marginTop: 20,
            marginHorizontal: 15,
        },
        endRoundButton: {
            backgroundColor: c.red,
            padding: 12,
            borderRadius: 8,
            alignItems: 'center',
            marginTop: 20,
            marginHorizontal: 15,
        },
        endRoundButtonText: {
            color: c.white,
            fontSize: fontSizes.tableHeader,
            fontWeight: 'bold',
        },
        roundHistoryScroll: {
            maxHeight: 300,
        },
        filterContainer: {
            flexDirection: 'row',
            justifyContent: 'flex-end',
            paddingHorizontal: 15,
            paddingTop: 20,
            gap: 8,
        },
        filterLabel: {
            color: c.primary,
            fontSize: fontSizes.normal,
            alignSelf: 'center',
            marginRight: 4,
        },
        filterButton: {
            paddingVertical: 4,
            width: 68,
            alignItems: 'center',
            borderRadius: 6,
            borderWidth: 1,
            borderColor: c.primary,
        },
        filterButtonSelected: {
            backgroundColor: c.primary,
        },
        filterButtonText: {
            color: c.primary,
            fontSize: fontSizes.normal,
        },
        filterButtonTextSelected: {
            color: c.background,
        },
        historyDateColumn: {
            width: '70%',
        },
        historyNarrowColumn: {
            width: '15%',
            textAlign: 'center',
        },
        scorecardHeader: {
            color: c.text,
            fontSize: fontSizes.subHeader,
            fontWeight: 'bold',
            textAlign: 'center',
            marginTop: 10,
            marginBottom: 5,
        },
    }),

    practiceScreen: StyleSheet.create({
        page: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
        },
    }),

    screenWrapper: StyleSheet.create({
        container: {
            flex: 1,
            paddingLeft: 10,
            paddingRight: 10,
            backgroundColor: c.background,
        },
    }),

    randomTool: StyleSheet.create({
        container: {
            padding: 20,
        },
        actionButton: {
            backgroundColor: c.primary,
            padding: 12,
            borderRadius: 8,
            alignItems: 'center',
            width: '100%',
        },
        actionButtonText: {
            color: c.background,
            fontSize: fontSizes.tableHeader,
            fontWeight: 'bold',
        },
        randomNumberContainer: {
            backgroundColor: c.background,
            borderColor: c.primary,
            borderWidth: 2,
            borderRadius: 12,
            margin: 15,
            padding: 10,
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'row',
        },
        randomNumberText: {
            color: c.primary,
            fontSize: fontSizes.massive,
            fontWeight: 'bold',
            textAlign: 'center',
            fontFamily: 'Arial',
        },
        micButton: {
            marginTop: 12,
            padding: 10,
            borderRadius: 8,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            backgroundColor: c.tertiary,
        },
        micButtonActive: {
            backgroundColor: c.primary,
        },
    }),

    tempoTool: StyleSheet.create({
        container: {
            padding: 20,
            alignItems: 'center',
        },
        title: {
            fontSize: fontSizes.subHeader,
            color: c.primary,
            marginBottom: 10,
        },
        slider: {
            width: '90%',
            height: 40,
        },
        labelsContainer: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            width: '90%',
            marginTop: 5,
        },
        label: {
            fontSize: fontSizes.normal,
            color: c.primary,
        },
        valueText: {
            marginTop: 10,
            fontSize: 18,
            fontWeight: 'bold',
        },
    }),

    notFound: StyleSheet.create({
        container: {
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20,
        },
        link: {
            marginTop: 15,
            paddingVertical: 15,
        },
    }),
});

export default createStyles(colours);
