const {
    withAppBuildGradle,
    withGradleProperties,
    withMainActivity,
    withMainApplication,
} = require('expo/config-plugins');

/**
 * Replaces ALL BuildConfig.XXXX references with hardcoded values.
 * This is necessary because AGP 8.x + Kotlin 2.x has a bug where
 * the generated BuildConfig.java is not visible to the Kotlin compiler.
 */
function replaceBuildConfigRefs(contents, packageName) {
    // Replace ALL BuildConfig.XXX references with a catch-all regex
    contents = contents.replace(/BuildConfig\.(\w+)/g, (match, prop) => {
        switch (prop) {
            case 'DEBUG':
                return 'false';
            case 'APPLICATION_ID':
                return `"${packageName}"`;
            case 'BUILD_TYPE':
                return '"release"';
            case 'VERSION_NAME':
                return '"1.0.0"';
            case 'VERSION_CODE':
                return '1';
            case 'IS_HERMES_ENABLED':
                return 'true';
            case 'IS_NEW_ARCHITECTURE_ENABLED':
                return 'true';
            case 'EX_UPDATES_NATIVE_DEBUG':
                return 'false';
            case 'REACT_NATIVE_BUNDLE_FILE_NAME':
                return '"index.android.bundle"';
            default:
                // For any unknown property: if name contains ENABLED/DEBUG, use false
                // Otherwise use empty string as it's likely a string type
                if (prop.includes('ENABLED') || prop.includes('DEBUG')) {
                    return 'false';
                }
                return '""';
        }
    });
    return contents;
}

module.exports = function withBuildConfig(config) {
    const packageName = config.android?.package || 'com.qtes34.yokdilapp';

    // Step 1: gradle.properties (backup, deprecated but doesn't hurt)
    config = withGradleProperties(config, (config) => {
        const key = 'android.defaults.buildfeatures.buildconfig';
        config.modResults = config.modResults.filter(
            (item) => !(item.type === 'property' && item.key === key)
        );
        config.modResults.push({ type: 'property', key, value: 'true' });
        return config;
    });

    // Step 2: build.gradle buildFeatures (backup)
    config = withAppBuildGradle(config, (config) => {
        let contents = config.modResults.contents;
        if (!/buildFeatures\s*\{[^}]*buildConfig\s*(=\s*)?true/s.test(contents)) {
            const m = contents.match(/android\s*\{/);
            if (m) {
                const idx = m.index + m[0].length;
                contents = contents.substring(0, idx) +
                    '\n    buildFeatures {\n        buildConfig = true\n    }' +
                    contents.substring(idx);
                config.modResults.contents = contents;
            }
        }
        return config;
    });

    // Step 3: Replace ALL BuildConfig refs in MainActivity.kt
    config = withMainActivity(config, (config) => {
        config.modResults.contents = replaceBuildConfigRefs(
            config.modResults.contents, packageName
        );
        console.log('[withBuildConfig] Replaced ALL BuildConfig refs in MainActivity.kt');
        return config;
    });

    // Step 4: Replace ALL BuildConfig refs in MainApplication.kt
    config = withMainApplication(config, (config) => {
        config.modResults.contents = replaceBuildConfigRefs(
            config.modResults.contents, packageName
        );
        console.log('[withBuildConfig] Replaced ALL BuildConfig refs in MainApplication.kt');
        return config;
    });

    return config;
};
