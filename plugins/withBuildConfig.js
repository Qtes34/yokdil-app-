const { withGradleProperties } = require('expo/config-plugins');

/**
 * Expo Config Plugin: Enables BuildConfig generation globally via gradle.properties.
 * 
 * In AGP 8.0+, buildConfig generation is disabled by default.
 * This plugin adds `android.defaults.buildfeatures.buildconfig=true` to gradle.properties,
 * which enables BuildConfig generation for ALL modules including the app module.
 * 
 * This fixes "Unresolved reference 'BuildConfig'" errors in MainActivity.kt
 * and MainApplication.kt during EAS builds.
 */
module.exports = function withBuildConfig(config) {
    return withGradleProperties(config, (config) => {
        const key = 'android.defaults.buildfeatures.buildconfig';

        // Remove any existing entry to avoid duplicates
        config.modResults = config.modResults.filter(
            (item) => !(item.type === 'property' && item.key === key)
        );

        // Add the property
        config.modResults.push({
            type: 'property',
            key: key,
            value: 'true',
        });

        return config;
    });
};
