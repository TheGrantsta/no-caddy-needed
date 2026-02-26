const baseConfig = require('./app.json');

baseConfig.expo.android.googleServicesFile =
  process.env.GOOGLE_SERVICES_JSON || './google-services.json';

module.exports = baseConfig;
