const config = require('./app.json');

if (process.env.GOOGLE_SERVICES_JSON) {
  config.expo.android.googleServicesFile = process.env.GOOGLE_SERVICES_JSON;
}

module.exports = config;
