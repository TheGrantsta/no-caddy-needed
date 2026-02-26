const baseConfig = require('./app.json');

baseConfig.expo.ios.googleServicesFile =
  process.env.GOOGLE_SERVICES_INFO_PLIST || './GoogleService-Info.plist';

baseConfig.expo.android.googleServicesFile =
  process.env.GOOGLE_SERVICES_JSON || './google-services.json';

module.exports = baseConfig;
