const { withMainActivity, withMainApplication, withAppBuildGradle } = require('expo/config-plugins');

module.exports = function withBuildConfig(config) {
    const packageName = config.android?.package || 'com.qtes34.yokdilapp';

    const replaceBuildConfigRefs = (content) => {
        return content
            .replace(/BuildConfig\.IS_NEW_ARCHITECTURE_ENABLED/g, 'false')
            .replace(/BuildConfig\.IS_HERMES_ENABLED/g, 'true')
            .replace(/BuildConfig\.DEBUG/g, 'false')
            .replace(/BuildConfig\.BUILD_TYPE/g, '"release"')
            .replace(/BuildConfig\.APPLICATION_ID/g, `"${packageName}"`)
            .replace(/BuildConfig\.VERSION_NAME/g, '"1.0.0"')
            .replace(/BuildConfig\.VERSION_CODE/g, '1');
    };

    config = withMainActivity(config, (config) => {
        config.modResults.contents = replaceBuildConfigRefs(config.modResults.contents);
        return config;
    });

    config = withMainApplication(config, (config) => {
        config.modResults.contents = replaceBuildConfigRefs(config.modResults.contents);
        return config;
    });

    config = withAppBuildGradle(config, (config) => {
        let contents = config.modResults.contents;
        if (!contents.includes('buildConfig = true')) {
            if (contents.includes('buildFeatures {')) {
                contents = contents.replace(/buildFeatures\s*\{/, 'buildFeatures {\n        buildConfig = true');
            } else {
                contents = contents.replace(/android\s*\{/, 'android {\n    buildFeatures {\n        buildConfig = true\n    }');
            }
        }
        config.modResults.contents = contents;
        return config;
    });

    return config;
};
