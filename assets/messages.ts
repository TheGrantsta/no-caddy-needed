export const COMMON_MESSAGES = {
    SETTINGS_SAVED: 'Settings saved',
    SETTINGS_FAILED: 'Failed to save settings',
    CLUBS_SAVED: 'Clubs saved',
    CLUBS_FAILED: 'Failed to save clubs',
    WEDGE_CHART_SAVED: 'Wedge chart saved',
    WEDGE_CHART_FAILED: 'Failed to save wedge chart',
    WEDGE_CHART_CLEARED: 'Wedge chart cleared',
    WEDGE_CHART_CLEAR_FAILED: 'Failed to clear wedge chart',
    DISTANCES_CLEARED: 'Distances cleared',
    DISTANCES_CLEAR_FAILED: 'Failed to clear distances',
    EXPORT_STATS_FAILED: 'Failed to export stats',
} as const;

export const LOCATION_MESSAGES = {
    LOCATION_SERVICES_DISABLED: 'Location services are disabled. Enable them in your device settings to show wind data.',
    LOCATION_PERMISSION_DENIED: 'This app needs location permission to show wind data. Grant permission in your device settings.',
    WIND_DATA_UNAVAILABLE: 'Wind data unavailable — check location permission and your connection',
} as const;

export const BUTTON_LABELS = {
    OPEN_SETTINGS: 'Open Settings',
    CLEAR_ALL: 'Clear all',
    CANCEL: 'Cancel',
    CONFIRM: 'Confirm',
    SAVE: 'Save',
    DELETE: 'Delete',
    PLAY: 'Play',
    STOP: 'Stop',
    GENERATE: 'Generate',
    ADD_REMINDER: 'Add reminder',
    EXPORT_STATS: 'Export my stats',
    RATE_APP: 'Rate my app',
} as const;
